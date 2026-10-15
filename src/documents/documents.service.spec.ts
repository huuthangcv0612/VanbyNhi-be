import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DocumentsService } from './documents.service.js';
import {
  UploadTargetType,
  UploadSessionStatus,
} from '../../generated/prisma/client.js';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let prismaMock: any;
  let r2Mock: any;

  beforeEach(() => {
    prismaMock = {
      documentCategory: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
      },
      document: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      uploadSession: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(prismaMock)),
    };

    r2Mock = {
      generateStorageKey: vi.fn((prefix) => `${prefix}/2026/10/15/mock-uuid`),
      createPresignedPutUrl: vi.fn().mockResolvedValue({
        uploadUrl: 'https://r2.mock/upload',
        storageKey: 'teachers/2026/10/15/mock-uuid',
        expiresInSeconds: 300,
        requiredHeaders: { 'Content-Type': 'application/pdf' },
      }),
      createPresignedGetUrl: vi.fn().mockResolvedValue({
        downloadUrl: 'https://r2.mock/download',
        expiresInSeconds: 300,
      }),
      getObjectMetadata: vi.fn().mockResolvedValue({
        sizeBytes: 1048576,
        contentType: 'application/pdf',
      }),
      validateFileSignature: vi.fn().mockResolvedValue(true),
      deleteObject: vi.fn().mockResolvedValue(true),
    };

    service = new DocumentsService(prismaMock, r2Mock);
  });

  // ==================== 1. QUẢN LÝ DANH MỤC & VÒNG LẶP ====================
  describe('Document Categories', () => {
    it('tạo danh mục thành công khi parentId hợp lệ và thuộc giáo viên', async () => {
      prismaMock.documentCategory.findUnique.mockResolvedValue({
        id: 'cat-parent',
        teacherId: 'teacher-A',
      });
      prismaMock.documentCategory.findFirst.mockResolvedValue(null);
      prismaMock.documentCategory.create.mockResolvedValue({
        id: 'cat-child',
        name: 'Văn học trung đại',
        parentId: 'cat-parent',
        teacherId: 'teacher-A',
      });

      const res = await service.createCategory('teacher-A', {
        name: 'Văn học trung đại',
        parentId: 'cat-parent',
      });

      expect(res.category.id).toBe('cat-child');
      expect(prismaMock.documentCategory.create).toHaveBeenCalled();
    });

    it('từ chối tạo danh mục nếu parentId thuộc giáo viên khác (tình huống 17)', async () => {
      prismaMock.documentCategory.findUnique.mockResolvedValue({
        id: 'cat-parent-B',
        teacherId: 'teacher-B', // Thuộc giáo viên B!
      });

      await expect(
        service.createCategory('teacher-A', {
          name: 'Văn học hiện đại',
          parentId: 'cat-parent-B',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối cập nhật nếu đặt parentId là chính nó (tình huống 17)', async () => {
      prismaMock.documentCategory.findUnique.mockResolvedValue({
        id: 'cat-1',
        teacherId: 'teacher-A',
      });

      await expect(
        service.updateCategory('teacher-A', 'cat-1', {
          parentId: 'cat-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('ngăn chặn tạo vòng lặp trong cây danh mục A -> B -> A (tình huống 17)', async () => {
      prismaMock.documentCategory.findUnique
        .mockResolvedValueOnce({ id: 'cat-A', teacherId: 'teacher-A' }) // category to update
        .mockResolvedValueOnce({ id: 'cat-B', teacherId: 'teacher-A' }) // target parent
        .mockResolvedValueOnce({ parentId: 'cat-A', teacherId: 'teacher-A' }); // cat-B trỏ về cat-A!

      await expect(
        service.updateCategory('teacher-A', 'cat-A', {
          parentId: 'cat-B',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('xóa danh mục an toàn: chuyển tài liệu về unclassified và đưa danh mục con lên cấp cha', async () => {
      prismaMock.documentCategory.findUnique.mockResolvedValue({
        id: 'cat-to-delete',
        teacherId: 'teacher-A',
        parentId: 'cat-root',
      });

      const res = await service.deleteCategory('teacher-A', 'cat-to-delete');

      expect(prismaMock.document.updateMany).toHaveBeenCalledWith({
        where: { categoryId: 'cat-to-delete', ownerId: 'teacher-A' },
        data: { categoryId: null },
      });
      expect(prismaMock.documentCategory.updateMany).toHaveBeenCalledWith({
        where: { parentId: 'cat-to-delete', teacherId: 'teacher-A' },
        data: { parentId: 'cat-root' },
      });
      expect(prismaMock.documentCategory.delete).toHaveBeenCalledWith({
        where: { id: 'cat-to-delete' },
      });
      expect(res.message).toBeDefined();
    });
  });

  // ==================== 2. THƯ VIỆN GIÁO VIÊN & UPLOAD ====================
  describe('Document Library & Upload Flow', () => {
    it('khởi tạo upload thư viện thành công và lưu UploadSession (tình huống 6)', async () => {
      prismaMock.documentCategory.findUnique.mockResolvedValue({
        id: 'cat-1',
        teacherId: 'teacher-A',
      });
      prismaMock.uploadSession.create.mockResolvedValue({
        id: 'session-1',
        storageKey: 'teachers/2026/10/15/mock-uuid',
      });

      const res = await service.initLibraryUpload('teacher-A', {
        title: 'Chí Phèo - Phân tích',
        originalName: 'chi-pheo.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1048576,
        categoryId: 'cat-1',
      });

      expect(res.uploadUrl).toBe('https://r2.mock/upload');
      expect(res.storageKey).toBe('teachers/2026/10/15/mock-uuid');
      expect(prismaMock.uploadSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'teacher-A',
            targetType: UploadTargetType.LIBRARY,
            categoryId: 'cat-1',
          }),
        }),
      );
    });

    it('từ chối xác nhận upload nếu object không tồn tại trên R2 (tình huống 13)', async () => {
      prismaMock.uploadSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'teacher-A',
        targetType: UploadTargetType.LIBRARY,
        status: UploadSessionStatus.PENDING,
        storageKey: 'teachers/missing-key',
      });
      r2Mock.getObjectMetadata.mockResolvedValue(null); // Không có trên R2!

      await expect(
        service.completeLibraryUpload('teacher-A', {
          storageKey: 'teachers/missing-key',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('hoàn tất upload tạo Document mới thành công và chuyển session sang COMPLETED (tình huống 6 & 10)', async () => {
      prismaMock.uploadSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'teacher-A',
        targetType: UploadTargetType.LIBRARY,
        status: UploadSessionStatus.PENDING,
        storageKey: 'teachers/new-cut-file-key',
        title: 'Đề kiểm tra cắt trang 1-3.pdf',
        originalName: 'de-kiem-tra-cut.pdf',
        mimeType: 'application/pdf',
        sizeBytes: BigInt(512000),
        categoryId: 'cat-1',
      });

      prismaMock.document.create.mockResolvedValue({
        id: 'doc-new',
        title: 'Đề kiểm tra cắt trang 1-3.pdf',
        storageKey: 'teachers/new-cut-file-key',
        sizeBytes: BigInt(512000),
        ownerId: 'teacher-A',
        categoryId: 'cat-1',
      });

      const res = await service.completeLibraryUpload('teacher-A', {
        storageKey: 'teachers/new-cut-file-key',
      });

      expect(res.document.id).toBe('doc-new');
      expect(res.document.sizeBytes).toBe(512000); // Đã format sang Number
      expect(prismaMock.uploadSession.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: { status: UploadSessionStatus.COMPLETED },
      });
    });

    it('xử lý idempotency: request complete upload lặp lại không tạo duplicate (tình huống 14)', async () => {
      prismaMock.uploadSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'teacher-A',
        targetType: UploadTargetType.LIBRARY,
        status: UploadSessionStatus.COMPLETED, // Đã hoàn thành trước đó
        storageKey: 'teachers/already-done-key',
      });

      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-existing',
        title: 'Tài liệu đã tạo',
        storageKey: 'teachers/already-done-key',
        sizeBytes: BigInt(1024),
      });

      const res = await service.completeLibraryUpload('teacher-A', {
        storageKey: 'teachers/already-done-key',
      });

      expect(res.document.id).toBe('doc-existing');
      expect(prismaMock.document.create).not.toHaveBeenCalled();
    });

    it('từ chối khi người dùng khác xác nhận storageKey của giáo viên khác (tình huống 16)', async () => {
      prismaMock.uploadSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'teacher-B', // Thuộc giáo viên B!
        targetType: UploadTargetType.LIBRARY,
        status: UploadSessionStatus.PENDING,
        storageKey: 'teachers/key-of-B',
      });

      await expect(
        service.completeLibraryUpload('teacher-A', {
          storageKey: 'teachers/key-of-B',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('giáo viên A không xem được chi tiết tài liệu riêng của giáo viên B (tình huống 1)', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-B',
        title: 'Tài liệu bí mật của B',
        ownerId: 'teacher-B',
        deletedAt: null,
      });

      await expect(
        service.getDocumentDetail('teacher-A', 'doc-B'),
      ).rejects.toThrow(NotFoundException);
    });

    it('giáo viên A không lấy được link tải tài liệu riêng của giáo viên B (tình huống 1)', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-B',
        title: 'Tài liệu của B',
        ownerId: 'teacher-B',
        deletedAt: null,
      });

      await expect(
        service.getDocumentDownloadUrl('teacher-A', 'doc-B'),
      ).rejects.toThrow(NotFoundException);
    });

    it('giáo viên A không sửa được tài liệu riêng của giáo viên B (tình huống 1)', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-B',
        title: 'Tài liệu của B',
        ownerId: 'teacher-B',
        deletedAt: null,
      });

      await expect(
        service.updateDocument('teacher-A', 'doc-B', { title: 'Hack title' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('xóa tài liệu: nếu đang liên kết ở lớp thì chỉ xóa mềm khỏi thư viện, không xóa R2 (tình huống 11)', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-linked',
        ownerId: 'teacher-A',
        storageKey: 'teachers/linked-key',
        deletedAt: null,
        _count: { materials: 2 }, // Đang được 2 lớp/buổi học sử dụng!
      });

      const res = await service.deleteDocument('teacher-A', 'doc-linked');

      expect(prismaMock.document.update).toHaveBeenCalledWith({
        where: { id: 'doc-linked' },
        data: { deletedAt: expect.any(Date) },
      });
      // Không gọi deleteObject trên R2!
      expect(r2Mock.deleteObject).not.toHaveBeenCalled();
      expect(res.message).toContain('file gốc vẫn được lưu trữ an toàn');
    });

    it('xóa tài liệu: nếu không còn nơi nào dùng thì xóa file trên R2 (tình huống 11)', async () => {
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-standalone',
        ownerId: 'teacher-A',
        storageKey: 'teachers/standalone-key',
        deletedAt: null,
        _count: { materials: 0 }, // Không còn liên kết nào
      });

      await service.deleteDocument('teacher-A', 'doc-standalone');

      expect(prismaMock.document.update).toHaveBeenCalled();
      expect(r2Mock.deleteObject).toHaveBeenCalledWith('teachers/standalone-key');
    });
  });
});
