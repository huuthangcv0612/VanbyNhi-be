import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { DocumentsService } from './documents.service.js';
import {
  DocumentType,
  DocumentStatus,
  DocumentExportStatus,
  DocumentExportFormat,
  UserRole,
} from '../../generated/prisma/client.js';

describe('DocumentsService - Structured Documents, Autosave & OCC, Versions, Import/Export', () => {
  let service: DocumentsService;
  let prismaMock: any;
  let r2Mock: any;

  beforeEach(() => {
    prismaMock = {
      $transaction: vi.fn((cb) => cb(prismaMock)),
      document: {
        findUnique: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      documentCategory: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      documentVersion: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        count: vi.fn(),
      },
      documentExportJob: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      uploadSession: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      enrollment: {
        findFirst: vi.fn(),
      },
    };

    r2Mock = {
      createPresignedGetUrl: vi.fn().mockResolvedValue({
        downloadUrl: 'https://r2.test/download-file',
        expiresInSeconds: 300,
      }),
      createPresignedPutUrl: vi.fn(),
      getObjectMetadata: vi.fn(),
      validateFileSignature: vi.fn().mockResolvedValue(true),
      deleteObject: vi.fn().mockResolvedValue(true),
      uploadObjectBuffer: vi.fn().mockResolvedValue(undefined),
      downloadObjectBuffer: vi.fn(),
    };

    service = new DocumentsService(prismaMock, r2Mock);
  });

  describe('Phân quyền xem và sửa (verifyUserCanViewDocument & verifyUserCanEditDocument)', () => {
    it('ADMIN luôn có quyền xem tài liệu bất kỳ', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        ownerId: 'teacher-other',
        deletedAt: null,
        materials: [],
      });

      const res = await service.verifyUserCanViewDocument(
        { sub: 'admin-1', role: UserRole.ADMIN },
        'doc-1',
      );
      expect(res.id).toBe('doc-1');
    });

    it('Owner luôn có quyền xem tài liệu của mình', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        ownerId: 'teacher-1',
        deletedAt: null,
        materials: [],
      });

      const res = await service.verifyUserCanViewDocument(
        { sub: 'teacher-1', role: UserRole.TEACHER },
        'doc-1',
      );
      expect(res.id).toBe('doc-1');
    });

    it('Học sinh xem được tài liệu khi được chia sẻ vào lớp học học sinh đang tham gia ACTIVE', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        ownerId: 'teacher-1',
        deletedAt: null,
        materials: [
          {
            id: 'mat-1',
            classId: 'class-1',
            isPublished: true,
            accessStartTime: null,
            accessEndTime: null,
          },
        ],
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'enr-1',
        studentId: 'student-1',
        classId: 'class-1',
        status: 'ACTIVE',
      });

      const res = await service.verifyUserCanViewDocument(
        { sub: 'student-1', role: UserRole.STUDENT },
        'doc-1',
      );
      expect(res.id).toBe('doc-1');
    });

    it('Học sinh bị từ chối 404 nếu tài liệu chưa được chia sẻ hoặc lớp không ACTIVE', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        ownerId: 'teacher-1',
        deletedAt: null,
        materials: [],
      });

      await expect(
        service.verifyUserCanViewDocument(
          { sub: 'student-1', role: UserRole.STUDENT },
          'doc-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('Giáo viên khác không sửa được tài liệu của giáo viên chủ sở hữu (403 Forbidden)', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        ownerId: 'teacher-1',
        deletedAt: null,
      });

      await expect(
        service.verifyUserCanEditDocument(
          { sub: 'teacher-hacker', role: UserRole.TEACHER },
          'doc-1',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Tạo tài liệu cấu trúc (createStructuredDocument)', () => {
    it('tạo tài liệu mới thành công và ghi nhận version snapshot 1', async () => {
      const createdDoc = {
        id: 'doc-new-1',
        title: 'Giáo án Chí Phèo',
        ownerId: 'teacher-1',
        type: DocumentType.STRUCTURED_NOTE,
        status: DocumentStatus.DRAFT,
        revision: 1,
        content: { type: 'doc', content: [] },
        sizeBytes: BigInt(25),
      };

      prismaMock.document.create.mockResolvedValue(createdDoc);
      prismaMock.documentVersion.create.mockResolvedValue({});

      const res = await service.createStructuredDocument('teacher-1', {
        title: 'Giáo án Chí Phèo',
      });

      expect(res.document.id).toBe('doc-new-1');
      expect(res.document.revision).toBe(1);
      expect(prismaMock.documentVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            documentId: 'doc-new-1',
            revision: 1,
            reason: 'Khởi tạo tài liệu',
          }),
        }),
      );
    });
  });

  describe('Autosave & Optimistic Concurrency Control (updateDocumentContent)', () => {
    it('lưu thành công khi expectedRevision khớp với revision hiện tại và tăng revision', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        ownerId: 'teacher-1',
        deletedAt: null,
      });

      prismaMock.document.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.document.findUniqueOrThrow.mockResolvedValue({
        id: 'doc-1',
        title: 'Tài liệu',
        revision: 2,
        updatedAt: new Date(),
      });

      const res = await service.updateDocumentContent(
        { sub: 'teacher-1', role: UserRole.TEACHER },
        'doc-1',
        {
          expectedRevision: 1,
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Nội dung sửa đổi' }],
              },
            ],
          },
        },
      );

      expect(res.revision).toBe(2);
      expect(res.message).toContain('thành công');
    });

    it('trả về 409 Conflict với REVISION_CONFLICT khi expectedRevision không khớp (2 request song song)', async () => {
      prismaMock.document.findUnique
        .mockResolvedValueOnce({
          id: 'doc-1',
          ownerId: 'teacher-1',
          deletedAt: null,
        })
        .mockResolvedValueOnce({
          id: 'doc-1',
          revision: 2,
          updatedAt: new Date(),
        });
      prismaMock.document.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.updateDocumentContent(
          { sub: 'teacher-1', role: UserRole.TEACHER },
          'doc-1',
          {
            expectedRevision: 1, // Client tưởng còn ở rev 1
            content: {
              type: 'doc',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sửa trễ' }] }],
            },
          },
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('từ chối payload Tiptap JSON không an toàn hoặc chứa script', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        ownerId: 'teacher-1',
        deletedAt: null,
      });

      await expect(
        service.updateDocumentContent(
          { sub: 'teacher-1', role: UserRole.TEACHER },
          'doc-1',
          {
            expectedRevision: 1,
            content: {
              type: 'doc',
              content: [
                {
                  type: 'malicious_script_tag',
                  content: [],
                },
              ],
            },
          },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Lịch sử phiên bản và Khôi phục (restoreDocumentVersion)', () => {
    it('khôi phục phiên bản snapshot tạo revision mới đơn điệu, không ghi đè lịch sử', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        ownerId: 'teacher-1',
        deletedAt: null,
      });

      prismaMock.documentVersion.findFirst.mockResolvedValue({
        id: 'ver-old',
        documentId: 'doc-1',
        revision: 1,
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bản cũ' }] }] },
      });

      prismaMock.document.findUniqueOrThrow.mockResolvedValue({
        id: 'doc-1',
        revision: 5, // Revision hiện tại là 5
      });

      prismaMock.document.update.mockResolvedValue({
        id: 'doc-1',
        title: 'Tài liệu',
        revision: 6, // Tạo revision mới là 6
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bản cũ' }] }] },
        sizeBytes: BigInt(50),
      });

      const res = await service.restoreDocumentVersion(
        { sub: 'teacher-1', role: UserRole.TEACHER },
        'doc-1',
        'ver-old',
      );

      expect(res.revision).toBe(6);
      expect(prismaMock.documentVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            documentId: 'doc-1',
            revision: 6,
            reason: expect.stringContaining('Khôi phục từ phiên bản rev 1'),
          }),
        }),
      );
    });
  });

  describe('Xuất DOCX/PDF từ revision đã lưu', () => {
    it('xuất DOCX tạo file và trả downloadUrl có thời hạn', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        title: 'Đề cương Ôn thi Văn',
        ownerId: 'teacher-1',
        revision: 3,
        deletedAt: null,
        materials: [],
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Đề cương Ôn thi' }],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Nội dung phân tích...' }],
            },
          ],
        },
      });

      prismaMock.documentExportJob.findFirst.mockResolvedValue(null);
      prismaMock.documentExportJob.create.mockResolvedValue({
        id: 'job-1',
        documentId: 'doc-1',
        revision: 3,
        format: DocumentExportFormat.DOCX,
      });

      prismaMock.documentExportJob.update.mockResolvedValue({
        id: 'job-1',
        documentId: 'doc-1',
        revision: 3,
        status: DocumentExportStatus.COMPLETED,
        format: DocumentExportFormat.DOCX,
      });

      const res = await service.exportDocument(
        { sub: 'teacher-1', role: UserRole.TEACHER },
        'doc-1',
        { format: DocumentExportFormat.DOCX },
      );

      expect(res.jobId).toBe('job-1');
      expect(res.downloadUrl).toBeDefined();
      expect(r2Mock.uploadObjectBuffer).toHaveBeenCalled();
    });

    it('xuất PDF tạo file nhúng font Roboto tiếng Việt và trả presigned URL', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        title: 'Chuyên đề Sóng Xuân Quỳnh',
        ownerId: 'teacher-1',
        revision: 2,
        deletedAt: null,
        materials: [],
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Sóng - Xuân Quỳnh' }],
            },
          ],
        },
      });

      prismaMock.documentExportJob.findFirst.mockResolvedValue(null);
      prismaMock.documentExportJob.create.mockResolvedValue({
        id: 'job-pdf-1',
        documentId: 'doc-1',
        revision: 2,
        format: DocumentExportFormat.PDF,
      });

      prismaMock.documentExportJob.update.mockResolvedValue({
        id: 'job-pdf-1',
        documentId: 'doc-1',
        revision: 2,
        status: DocumentExportStatus.COMPLETED,
        format: DocumentExportFormat.PDF,
      });

      const res = await service.exportDocument(
        { sub: 'teacher-1', role: UserRole.TEACHER },
        'doc-1',
        { format: DocumentExportFormat.PDF },
      );

      expect(res.jobId).toBe('job-pdf-1');
      expect(res.downloadUrl).toBeDefined();
      expect(r2Mock.uploadObjectBuffer).toHaveBeenCalled();
    });
  });
});
