import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ClassMaterialsService } from './class-materials.service.js';
import {
  UploadTargetType,
  UploadSessionStatus,
  MemberStatus,
} from '../../generated/prisma/client.js';

describe('ClassMaterialsService', () => {
  let service: ClassMaterialsService;
  let prismaMock: any;
  let r2Mock: any;

  beforeEach(() => {
    prismaMock = {
      class: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      classSession: {
        findUnique: vi.fn(),
      },
      enrollment: {
        findFirst: vi.fn(),
      },
      classMaterial: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      document: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
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
        storageKey: 'classes/class-1/mock-uuid',
        expiresInSeconds: 300,
        requiredHeaders: { 'Content-Type': 'application/pdf' },
      }),
      createPresignedGetUrl: vi.fn().mockResolvedValue({
        downloadUrl: 'https://r2.mock/download-file',
        expiresInSeconds: 300,
      }),
      getObjectMetadata: vi.fn().mockResolvedValue({
        sizeBytes: 2097152,
        contentType: 'application/pdf',
      }),
      validateFileSignature: vi.fn().mockResolvedValue(true),
      deleteObject: vi.fn().mockResolvedValue(true),
      getMaxUploadSizeBytes: vi.fn().mockReturnValue(52428800),
    };

    service = new ClassMaterialsService(prismaMock, r2Mock);
  });

  // ==================== 1. PHÂN QUYỀN GIÁO VIÊN TRÊN LỚP & BUỔI HỌC ====================
  describe('Teacher Authorization', () => {
    it('từ chối giáo viên không quản lý lớp khi khởi tạo upload vào lớp (tình huống 2)', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-1',
        teacherId: 'teacher-owner', // Chủ lớp là teacher-owner!
      });

      await expect(
        service.initClassDirectUpload('teacher-intruder', 'class-1', {
          title: 'Đề kiểm tra',
          originalName: 'test.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1024,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('từ chối giáo viên không quản lý lớp khi chia sẻ tài liệu vào lớp (tình huống 2)', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-1',
        teacherId: 'teacher-owner',
      });

      await expect(
        service.shareDocumentToClass('teacher-intruder', 'class-1', {
          documentId: 'doc-1',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('từ chối giáo viên chia sẻ tài liệu của giáo viên khác vào lớp mình dạy (tình huống 1 & 2)', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-1',
        teacherId: 'teacher-A',
      });
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-B',
        ownerId: 'teacher-B', // Tài liệu thuộc giáo viên B!
        deletedAt: null,
      });

      await expect(
        service.shareDocumentToClass('teacher-A', 'class-1', {
          documentId: 'doc-B',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ==================== 2. UPLOAD TRỰC TIẾP VÀ CHIA SẺ TÀI LIỆU ====================
  describe('Direct Upload & Reuse Materials', () => {
    it('upload trực tiếp vào lớp không tự thêm vào thư viện (categoryId là null) (tình huống 7)', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-1',
        teacherId: 'teacher-A',
      });
      prismaMock.uploadSession.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'teacher-A',
        targetType: UploadTargetType.CLASS,
        targetId: 'class-1',
        status: UploadSessionStatus.PENDING,
        storageKey: 'classes/class-1/mock-uuid',
        title: 'Tài liệu lớp 10A1',
        originalName: 'tailieu.pdf',
        mimeType: 'application/pdf',
        sizeBytes: BigInt(2097152),
      });

      prismaMock.document.create.mockResolvedValue({
        id: 'doc-class',
        title: 'Tài liệu lớp 10A1',
        storageKey: 'classes/class-1/mock-uuid',
        sizeBytes: BigInt(2097152),
        ownerId: 'teacher-A',
        categoryId: null, // Không gắn category thư viện!
      });

      prismaMock.classMaterial.create.mockResolvedValue({
        id: 'mat-1',
        classId: 'class-1',
        sessionId: null,
        documentId: 'doc-class',
        title: 'Tài liệu lớp 10A1',
        fileSize: BigInt(2097152),
      });

      const res = await service.completeClassDirectUpload('teacher-A', 'class-1', {
        storageKey: 'classes/class-1/mock-uuid',
      });

      expect(res.material.id).toBe('mat-1');
      expect(prismaMock.document.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          categoryId: null,
          ownerId: 'teacher-A',
        }),
      });
      expect(prismaMock.classMaterial.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            classId: 'class-1',
            sessionId: null, // Chỉ là tài liệu lớp
            documentId: 'doc-class',
          }),
        }),
      );
    });

    it('upload trực tiếp vào buổi học chỉ liên kết với buổi học (tình huống 8)', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 'session-101',
        classId: 'class-1',
        class: { id: 'class-1', teacherId: 'teacher-A' },
      });
      prismaMock.uploadSession.findUnique.mockResolvedValue({
        id: 'upload-session-1',
        userId: 'teacher-A',
        targetType: UploadTargetType.SESSION,
        targetId: 'session-101',
        status: UploadSessionStatus.PENDING,
        storageKey: 'sessions/session-101/mock-uuid',
        title: 'Phiếu học tập buổi 1',
        originalName: 'phieu-hoc-tap.pdf',
        mimeType: 'application/pdf',
        sizeBytes: BigInt(1048576),
      });

      prismaMock.document.create.mockResolvedValue({
        id: 'doc-session',
        title: 'Phiếu học tập buổi 1',
        storageKey: 'sessions/session-101/mock-uuid',
        sizeBytes: BigInt(1048576),
        ownerId: 'teacher-A',
        categoryId: null,
      });

      prismaMock.classMaterial.create.mockResolvedValue({
        id: 'mat-session',
        classId: 'class-1',
        sessionId: 'session-101',
        documentId: 'doc-session',
        title: 'Phiếu học tập buổi 1',
        fileSize: BigInt(1048576),
      });

      const res = await service.completeSessionDirectUpload(
        'teacher-A',
        'session-101',
        { storageKey: 'sessions/session-101/mock-uuid' },
      );

      expect(res.material.id).toBe('mat-session');
      expect(prismaMock.classMaterial.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            classId: 'class-1',
            sessionId: 'session-101', // Gắn chặt với buổi học
            documentId: 'doc-session',
          }),
        }),
      );
    });

    it('chia sẻ Document có sẵn không tạo object R2 mới (tình huống 9)', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-1',
        teacherId: 'teacher-A',
      });
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-reuse',
        title: 'Giáo trình Ngữ Văn',
        originalName: 'giao-trinh.pdf',
        mimeType: 'application/pdf',
        sizeBytes: BigInt(5000000),
        ownerId: 'teacher-A',
        deletedAt: null,
      });
      prismaMock.classMaterial.findFirst.mockResolvedValue(null); // Chưa chia sẻ
      prismaMock.classMaterial.create.mockResolvedValue({
        id: 'mat-reused',
        classId: 'class-1',
        sessionId: null,
        documentId: 'doc-reuse',
        title: 'Giáo trình Ngữ Văn',
        fileSize: BigInt(5000000),
      });

      const res = await service.shareDocumentToClass('teacher-A', 'class-1', {
        documentId: 'doc-reuse',
      });

      expect(res.material.id).toBe('mat-reused');
      // KHÔNG gọi R2 upload hay sinh object mới!
      expect(r2Mock.createPresignedPutUrl).not.toHaveBeenCalled();
      expect(prismaMock.document.create).not.toHaveBeenCalled();
    });

    it('xử lý idempotent khi chia sẻ lại tài liệu đã hoạt động: cập nhật cài đặt, không tạo bản ghi trùng lặp', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-1',
        teacherId: 'teacher-A',
      });
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-reuse',
        title: 'Giáo trình Ngữ Văn',
        ownerId: 'teacher-A',
        deletedAt: null,
      });
      prismaMock.classMaterial.findFirst.mockResolvedValue({
        id: 'mat-existing',
        classId: 'class-1',
        documentId: 'doc-reuse',
        deletedAt: null, // Đang hoạt động
        title: 'Giáo trình Ngữ Văn',
      });
      prismaMock.classMaterial.update.mockResolvedValue({
        id: 'mat-existing',
        classId: 'class-1',
        documentId: 'doc-reuse',
        title: 'Giáo trình Ngữ Văn (Cập nhật)',
        isPublished: true,
      });

      const res = await service.shareDocumentToClass('teacher-A', 'class-1', {
        documentId: 'doc-reuse',
        title: 'Giáo trình Ngữ Văn (Cập nhật)',
      });

      expect(res.material.id).toBe('mat-existing');
      expect(prismaMock.classMaterial.create).not.toHaveBeenCalled();
      expect(prismaMock.classMaterial.update).toHaveBeenCalled();
    });

    it('khôi phục liên kết khi chia sẻ lại tài liệu từng bị gỡ (soft-deleted)', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-1',
        teacherId: 'teacher-A',
      });
      prismaMock.document.findUnique.mockResolvedValue({
        id: 'doc-reuse',
        title: 'Giáo trình Ngữ Văn',
        ownerId: 'teacher-A',
        deletedAt: null,
      });
      prismaMock.classMaterial.findFirst.mockResolvedValue({
        id: 'mat-revoked',
        classId: 'class-1',
        documentId: 'doc-reuse',
        deletedAt: new Date(), // Từng bị gỡ bỏ
      });
      prismaMock.classMaterial.update.mockResolvedValue({
        id: 'mat-revoked',
        classId: 'class-1',
        documentId: 'doc-reuse',
        deletedAt: null,
        title: 'Giáo trình Ngữ Văn',
      });

      const res = await service.shareDocumentToClass('teacher-A', 'class-1', {
        documentId: 'doc-reuse',
      });

      expect(res.material.id).toBe('mat-revoked');
      expect(prismaMock.classMaterial.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });

    it('giáo viên cấp quyền hàng loạt: 2 tài liệu cho 2 lớp thành công trong 1 thao tác', async () => {
      prismaMock.class.findMany.mockResolvedValue([
        { id: 'class-1', name: 'Lớp 10A1', teacherId: 'teacher-A' },
        { id: 'class-2', name: 'Lớp 10A2', teacherId: 'teacher-A' },
      ]);
      prismaMock.document.findMany.mockResolvedValue([
        { id: 'doc-1', title: 'Tài liệu 1', ownerId: 'teacher-A', sizeBytes: BigInt(1024) },
        { id: 'doc-2', title: 'Tài liệu 2', ownerId: 'teacher-A', sizeBytes: BigInt(2048) },
      ]);
      prismaMock.classMaterial.findFirst.mockResolvedValue(null); // Chưa tồn tại
      prismaMock.classMaterial.create
        .mockResolvedValueOnce({ id: 'm1', classId: 'class-1', documentId: 'doc-1' })
        .mockResolvedValueOnce({ id: 'm2', classId: 'class-1', documentId: 'doc-2' })
        .mockResolvedValueOnce({ id: 'm3', classId: 'class-2', documentId: 'doc-1' })
        .mockResolvedValueOnce({ id: 'm4', classId: 'class-2', documentId: 'doc-2' });

      const res = await service.assignDocumentsToClasses('teacher-A', {
        documentIds: ['doc-1', 'doc-2'],
        classIds: ['class-1', 'class-2'],
        isPublished: true,
      });

      expect(res.assignedCount).toBe(4);
      expect(prismaMock.classMaterial.create).toHaveBeenCalledTimes(4);
      // Không upload lại lên R2
      expect(r2Mock.createPresignedPutUrl).not.toHaveBeenCalled();
    });

    it('từ chối cấp quyền hàng loạt nếu có lớp thuộc quyền giáo viên khác', async () => {
      prismaMock.class.findMany.mockResolvedValue([
        { id: 'class-1', name: 'Lớp của A', teacherId: 'teacher-A' },
        { id: 'class-2', name: 'Lớp của B', teacherId: 'teacher-B' }, // Của giáo viên B!
      ]);

      await expect(
        service.assignDocumentsToClasses('teacher-A', {
          documentIds: ['doc-1'],
          classIds: ['class-1', 'class-2'],
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('từ chối cấp quyền hàng loạt nếu có tài liệu của giáo viên khác', async () => {
      prismaMock.class.findMany.mockResolvedValue([
        { id: 'class-1', name: 'Lớp của A', teacherId: 'teacher-A' },
      ]);
      prismaMock.document.findMany.mockResolvedValue([
        { id: 'doc-1', title: 'Tài liệu của A', ownerId: 'teacher-A' },
        { id: 'doc-B', title: 'Tài liệu của B', ownerId: 'teacher-B' }, // Của giáo viên B!
      ]);

      await expect(
        service.assignDocumentsToClasses('teacher-A', {
          documentIds: ['doc-1', 'doc-B'],
          classIds: ['class-1'],
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('gỡ tài liệu khỏi một lớp không xóa file đang được lớp khác sử dụng (tình huống 11 & 12)', async () => {
      prismaMock.classMaterial.findUnique.mockResolvedValue({
        id: 'mat-1',
        classId: 'class-1',
        documentId: 'doc-shared-multiple',
        deletedAt: null,
        class: { teacherId: 'teacher-A' },
      });

      const res = await service.removeMaterial('teacher-A', 'mat-1');

      // Chỉ đánh dấu deletedAt trên ClassMaterial của lớp 1
      expect(prismaMock.classMaterial.update).toHaveBeenCalledWith({
        where: { id: 'mat-1' },
        data: { deletedAt: expect.any(Date) },
      });
      // KHÔNG gọi xóa object trên R2!
      expect(r2Mock.deleteObject).not.toHaveBeenCalled();
      expect(res.message).toContain('bảo toàn nguyên vẹn');
    });
  });

  // ==================== 3. BẢO MẬT VÀ PHÂN QUYỀN HỌC SINH ====================
  describe('Student Access & Security', () => {
    it('học sinh lớp 6 không xem được danh sách tài liệu lớp 7 khi đổi classId (tình huống 3)', async () => {
      // Học sinh không có Enrollment ACTIVE trong lớp class-lop-7
      prismaMock.enrollment.findFirst.mockResolvedValue(null);

      await expect(
        service.getStudentClassMaterials('student-lop-6', 'class-lop-7', {}),
      ).rejects.toThrow(ForbiddenException);
    });

    it('học sinh không được cấp URL tải nếu mất tư cách thành viên lớp (tình huống 5)', async () => {
      prismaMock.classMaterial.findUnique.mockResolvedValue({
        id: 'mat-1',
        classId: 'class-1',
        isPublished: true,
        deletedAt: null,
        document: {
          storageKey: 'classes/class-1/doc.pdf',
          originalName: 'doc.pdf',
          mimeType: 'application/pdf',
          sizeBytes: BigInt(1024),
        },
      });

      // Học sinh đã bị REMOVED / LEFT (không tìm thấy enrollment ACTIVE)
      prismaMock.enrollment.findFirst.mockResolvedValue(null);

      await expect(
        service.getStudentMaterialDownloadUrl('student-removed', 'mat-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('học sinh không tải được tài liệu chưa xuất bản (isPublished: false) (tình huống 4)', async () => {
      prismaMock.classMaterial.findUnique.mockResolvedValue({
        id: 'mat-unpublished',
        classId: 'class-1',
        isPublished: false, // Chưa xuất bản!
        deletedAt: null,
      });

      await expect(
        service.getStudentMaterialDownloadUrl('student-active', 'mat-unpublished'),
      ).rejects.toThrow(NotFoundException);
    });

    it('học sinh bị từ chối tải tài liệu khi chưa đến thời gian truy cập (accessStartTime)', async () => {
      const futureTime = new Date(Date.now() + 3600 * 1000); // 1 tiếng sau
      prismaMock.classMaterial.findUnique.mockResolvedValue({
        id: 'mat-timed',
        classId: 'class-1',
        isPublished: true,
        deletedAt: null,
        accessStartTime: futureTime,
        document: { storageKey: 'k', originalName: 'o', sizeBytes: BigInt(100) },
      });
      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'enr-1',
        status: MemberStatus.ACTIVE,
      });

      await expect(
        service.getStudentMaterialDownloadUrl('student-active', 'mat-timed'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('học sinh bị từ chối tải tài liệu khi đã quá hạn thời gian truy cập (accessEndTime)', async () => {
      const pastTime = new Date(Date.now() - 3600 * 1000); // 1 tiếng trước
      prismaMock.classMaterial.findUnique.mockResolvedValue({
        id: 'mat-expired',
        classId: 'class-1',
        isPublished: true,
        deletedAt: null,
        accessEndTime: pastTime,
        document: { storageKey: 'k', originalName: 'o', sizeBytes: BigInt(100) },
      });
      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'enr-1',
        status: MemberStatus.ACTIVE,
      });

      await expect(
        service.getStudentMaterialDownloadUrl('student-active', 'mat-expired'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('học sinh thành viên ACTIVE được cấp presigned URL tải tài liệu hợp lệ', async () => {
      prismaMock.classMaterial.findUnique.mockResolvedValue({
        id: 'mat-valid',
        classId: 'class-1',
        isPublished: true,
        deletedAt: null,
        title: 'Bài giảng Chiếc thuyền ngoài xa',
        document: {
          storageKey: 'classes/class-1/thuyen.pdf',
          originalName: 'thuyen.pdf',
          mimeType: 'application/pdf',
          sizeBytes: BigInt(2048),
        },
      });
      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'enr-1',
        status: MemberStatus.ACTIVE,
      });

      const res = await service.getStudentMaterialDownloadUrl(
        'student-active',
        'mat-valid',
      );

      expect(res.downloadUrl).toBe('https://r2.mock/download-file');
      expect(res.expiresInSeconds).toBe(300);
      expect(res.sizeBytes).toBe(2048);
      expect(r2Mock.createPresignedGetUrl).toHaveBeenCalledWith(
        'classes/class-1/thuyen.pdf',
        'thuyen.pdf',
      );
    });

    it('học sinh ACTIVE xem được danh sách tài liệu đầy đủ thông tin (classId, documentId, sizeBytes)', async () => {
      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'enr-1',
        status: MemberStatus.ACTIVE,
      });

      const mockMaterials = [
        {
          id: 'mat-1',
          classId: 'class-1',
          sessionId: null,
          documentId: 'doc-1',
          title: 'Tài liệu học tập 1',
          description: 'Mô tả',
          type: 'DOCUMENT',
          originalName: 'tailieu1.pdf',
          mimeType: 'application/pdf',
          fileSize: BigInt(1048576),
          isPublished: true,
          publishedAt: new Date(),
          order: 0,
          accessStartTime: null,
          accessEndTime: null,
          createdAt: new Date(),
        },
      ];

      prismaMock.classMaterial.findMany.mockResolvedValue(mockMaterials);
      prismaMock.classMaterial.count.mockResolvedValue(1);

      const res = await service.getStudentClassMaterials('student-active', 'class-1', {});

      expect(res.items).toHaveLength(1);
      expect(res.items[0].id).toBe('mat-1');
      expect(res.items[0].classId).toBe('class-1');
      expect(res.items[0].documentId).toBe('doc-1');
      expect(res.items[0].fileSize).toBe(1048576);
      expect(res.items[0].sizeBytes).toBe(1048576);
      expect(res.pagination.total).toBe(1);
    });

    it('từ chối tải tài liệu khi liên kết đã bị giáo viên thu hồi (deletedAt !== null)', async () => {
      prismaMock.classMaterial.findUnique.mockResolvedValue({
        id: 'mat-revoked',
        classId: 'class-1',
        isPublished: true,
        deletedAt: new Date(), // Đã bị thu hồi
      });

      await expect(
        service.getStudentMaterialDownloadUrl('student-active', 'mat-revoked'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
