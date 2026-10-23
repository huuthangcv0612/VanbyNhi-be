import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssignmentRetentionService } from './assignment-retention.service.js';
import {
  AttachmentCleanupStatus,
  ReviewStatus,
  UserRole,
} from '../../generated/prisma/client.js';

describe('AssignmentRetentionService', () => {
  let retentionService: AssignmentRetentionService;
  let prismaMock: any;
  let configMock: any;
  let r2StorageMock: any;

  beforeEach(() => {
    prismaMock = {
      assignmentAttachment: {
        findMany: vi.fn().mockResolvedValue([]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        update: vi.fn().mockResolvedValue({}),
        count: vi.fn().mockResolvedValue(0),
        findUnique: vi.fn(),
      },
      submissionAttachment: {
        findMany: vi.fn().mockResolvedValue([]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        update: vi.fn().mockResolvedValue({}),
        count: vi.fn().mockResolvedValue(0),
        findUnique: vi.fn(),
      },
      reviewAttachment: {
        findMany: vi.fn().mockResolvedValue([]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        update: vi.fn().mockResolvedValue({}),
        count: vi.fn().mockResolvedValue(0),
        findUnique: vi.fn(),
      },
      document: {
        findMany: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
      classMaterial: {
        findMany: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
      assignmentSubmission: {
        findUnique: vi.fn(),
      },
    };

    configMock = {
      get: vi.fn((key: string) => {
        if (key === 'ASSIGNMENT_RETENTION_DAYS') return 14;
        if (key === 'ASSIGNMENT_RETENTION_BATCH_SIZE') return 50;
        if (key === 'ASSIGNMENT_RETENTION_MAX_RETRIES') return 3;
        if (key === 'ASSIGNMENT_RETENTION_CLAIM_TIMEOUT_MS') return 600000;
        return undefined;
      }),
    };

    r2StorageMock = {
      deleteObject: vi.fn().mockResolvedValue(true),
      getObjectMetadata: vi.fn().mockResolvedValue(null),
    };

    retentionService = new AssignmentRetentionService(
      prismaMock,
      configMock,
      r2StorageMock,
    );
  });

  // =========================================================================
  // 1. TỆP BÀI TẬP HẾT HẠN ĐÚNG THEO retentionExpiresAt ĐƯỢC CHỌN ĐỂ DỌN DẸP
  // =========================================================================
  it('1. Tệp bài tập hết hạn (retentionExpiresAt <= now) được chọn để dọn dẹp', async () => {
    prismaMock.assignmentAttachment.findMany.mockResolvedValueOnce([
      {
        id: 'att-expired-1',
        storageKey: 'assignments/c1/expired.pdf',
        cleanupAttempts: 0,
      },
    ]);

    const result = await retentionService.runRetentionCleanup();

    expect(result.scannedCount).toBe(1);
    expect(result.cleanedCount).toBe(1);
    expect(r2StorageMock.deleteObject).toHaveBeenCalledWith(
      'assignments/c1/expired.pdf',
    );
    expect(prismaMock.assignmentAttachment.update).toHaveBeenCalledWith({
      where: { id: 'att-expired-1' },
      data: expect.objectContaining({
        cleanupStatus: AttachmentCleanupStatus.CLEANED,
        lastCleanupError: null,
      }),
    });
  });

  // =========================================================================
  // 2. TỆP CHƯA HẾT HẠN KHÔNG BỊ XÓA
  // =========================================================================
  it('2. Tệp chưa hết hạn không bị job dọn dẹp', async () => {
    // findMany chỉ truy vấn lte: now, nên giả lập trả về rỗng vì không có tệp hết hạn
    prismaMock.assignmentAttachment.findMany.mockResolvedValue([]);
    prismaMock.submissionAttachment.findMany.mockResolvedValue([]);
    prismaMock.reviewAttachment.findMany.mockResolvedValue([]);

    const result = await retentionService.runRetentionCleanup();

    expect(result.scannedCount).toBe(0);
    expect(result.cleanedCount).toBe(0);
    expect(r2StorageMock.deleteObject).not.toHaveBeenCalled();
  });

  // =========================================================================
  // 3. TÀI LIỆU THƯ VIỆN GIÁO VIÊN KHÔNG BAO GIỜ BỊ JOB XÓA
  // =========================================================================
  it('3. Tuyệt đối không quét hoặc xóa Document / ClassMaterial thư viện giáo viên', async () => {
    await retentionService.runRetentionCleanup();

    expect(prismaMock.document.findMany).not.toHaveBeenCalled();
    expect(prismaMock.document.delete).not.toHaveBeenCalled();
    expect(prismaMock.document.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.classMaterial.findMany).not.toHaveBeenCalled();
    expect(prismaMock.classMaterial.delete).not.toHaveBeenCalled();
  });

  // =========================================================================
  // 4. TỆP CHƯA PHÂN LOẠI HOẶC KHÔNG CÓ HẠN LƯU KHÔNG BỊ XÓA
  // =========================================================================
  it('4. Tệp không có hạn lưu (retentionExpiresAt = null) không bị xóa', async () => {
    // Hàm calculateRetentionExpiresAt trả về null nếu dueDate không có
    const expiresAt = retentionService.calculateRetentionExpiresAt(null);
    expect(expiresAt).toBeNull();

    // Query findMany của service luôn có điều kiện `retentionExpiresAt: { not: null, lte: now }`
    await retentionService.runRetentionCleanup();

    expect(prismaMock.assignmentAttachment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          retentionExpiresAt: expect.objectContaining({
            not: null,
          }),
        }),
      }),
    );
  });

  // =========================================================================
  // 5. BÀI CHỮA ĐƯỢC TÍNH HẠN TỪ THỜI ĐIỂM TRẢ BÀI THEO CHÍNH SÁCH
  // =========================================================================
  it('5. Bài chữa được tính hạn 14 ngày từ returnedAt; bài nháp DRAFT có hạn = null', () => {
    const returnedAt = new Date('2026-10-01T10:00:00.000Z');

    // 1. Nếu đã trả bài (RETURNED): returnedAt + 14 ngày
    const returnedExpires = retentionService.getReviewAttachmentExpiration(
      ReviewStatus.RETURNED,
      returnedAt,
    );
    expect(returnedExpires).not.toBeNull();
    const expected = new Date(returnedAt.getTime() + 14 * 24 * 60 * 60 * 1000);
    expect(returnedExpires?.toISOString()).toBe(expected.toISOString());

    // 2. Nếu còn là DRAFT: hạn là null (không xóa bài chữa nháp)
    const draftExpires = retentionService.getReviewAttachmentExpiration(
      ReviewStatus.DRAFT,
      returnedAt,
    );
    expect(draftExpires).toBeNull();

    // 3. Nếu không có returnedAt: hạn là null
    const noReturnedAtExpires = retentionService.getReviewAttachmentExpiration(
      ReviewStatus.RETURNED,
      null,
    );
    expect(noReturnedAtExpires).toBeNull();
  });

  // =========================================================================
  // 6. XỬ LÝ LỖI R2 VÀ DB PHỤC HỒI AN TOÀN
  // =========================================================================
  describe('6. R2 xóa thành công, object không tồn tại, timeout/lỗi, DB phục hồi', () => {
    it('R2 trả về lỗi -> cập nhật FAILED, tăng retry, không đánh dấu CLEANED', async () => {
      prismaMock.assignmentAttachment.findMany.mockResolvedValueOnce([
        {
          id: 'att-err-1',
          storageKey: 'assignments/err.pdf',
          cleanupAttempts: 0,
        },
      ]);
      r2StorageMock.deleteObject.mockRejectedValueOnce(
        new Error('R2 Connection Timeout with sensitive secret AKIAIOSFODNN7EXAMPLE'),
      );

      const result = await retentionService.runRetentionCleanup();

      expect(result.failedCount).toBe(1);
      expect(prismaMock.assignmentAttachment.update).toHaveBeenCalledWith({
        where: { id: 'att-err-1' },
        data: expect.objectContaining({
          cleanupStatus: AttachmentCleanupStatus.FAILED,
          cleanupAttempts: 1,
          lastCleanupError: expect.not.stringContaining('AKIAIOSFODNN7EXAMPLE'), // Đã làm sạch secret
        }),
      });
    });

    it('R2 deleteObject thành công -> cập nhật CLEANED', async () => {
      prismaMock.submissionAttachment.findMany.mockResolvedValueOnce([
        {
          id: 'sub-att-1',
          storageKey: 'submissions/sub1.pdf',
          cleanupAttempts: 1,
        },
      ]);
      r2StorageMock.deleteObject.mockResolvedValueOnce(true);

      const result = await retentionService.runRetentionCleanup();

      expect(result.cleanedCount).toBe(1);
      expect(prismaMock.submissionAttachment.update).toHaveBeenCalledWith({
        where: { id: 'sub-att-1' },
        data: expect.objectContaining({
          cleanupStatus: AttachmentCleanupStatus.CLEANED,
          lastCleanupError: null,
        }),
      });
    });
  });

  // =========================================================================
  // 7. JOB CHẠY LẠI AN TOÀN (IDEMPOTENT), BATCHING VÀ CHỐNG WORKER TRÙNG
  // =========================================================================
  describe('7. Idempotency, claim locking và batching', () => {
    it('worker claim thất bại (worker khác đã xử lý) -> bỏ qua an toàn không xóa trùng', async () => {
      prismaMock.assignmentAttachment.findMany.mockResolvedValueOnce([
        {
          id: 'att-claimed-other',
          storageKey: 'assignments/key1.pdf',
          cleanupAttempts: 0,
        },
      ]);
      // updateMany trả về count: 0 nghĩa là worker khác đã đổi trạng thái
      prismaMock.assignmentAttachment.updateMany.mockResolvedValueOnce({
        count: 0,
      });

      const result = await retentionService.runRetentionCleanup();

      // Không gọi R2 delete vì claim thất bại
      expect(r2StorageMock.deleteObject).not.toHaveBeenCalled();
      expect(result.cleanedCount).toBe(0);
    });

    it('hỗ trợ chế độ dry-run không xóa object thật', async () => {
      prismaMock.assignmentAttachment.findMany.mockResolvedValueOnce([
        {
          id: 'att-dry-1',
          storageKey: 'assignments/dry.pdf',
          cleanupAttempts: 0,
        },
      ]);

      const result = await retentionService.runRetentionCleanup({ dryRun: true });

      expect(result.dryRun).toBe(true);
      expect(result.scannedCount).toBe(1);
      expect(r2StorageMock.deleteObject).not.toHaveBeenCalled();
      expect(prismaMock.assignmentAttachment.update).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 8. ĐIỂM, NHẬN XÉT, LỊCH SỬ CHẤM VẪN ĐƯỢC GIỮ NGUYÊN SAU KHI TỆP HẾT HẠN
  // =========================================================================
  it('8. Xóa tệp hết hạn không xóa bản ghi bài nộp, điểm số hay nhận xét', async () => {
    prismaMock.submissionAttachment.findMany.mockResolvedValueOnce([
      {
        id: 'sub-att-2',
        storageKey: 'submissions/sub2.pdf',
        cleanupAttempts: 0,
      },
    ]);

    await retentionService.runRetentionCleanup();

    // Chỉ update trạng thái của SubmissionAttachment sang CLEANED
    expect(prismaMock.submissionAttachment.update).toHaveBeenCalledWith({
      where: { id: 'sub-att-2' },
      data: expect.objectContaining({
        cleanupStatus: AttachmentCleanupStatus.CLEANED,
      }),
    });

    // Tuyệt đối không xóa bản ghi AssignmentSubmission
    expect(prismaMock.assignmentSubmission.findUnique).not.toHaveBeenCalled();
  });

  // =========================================================================
  // 9. TỆP ĐƯỢC ĐÁNH DẤU GIỮ LẠI (isKeepForever = true) KHÔNG BỊ XÓA
  // =========================================================================
  describe('9. Ngoại lệ lưu giữ (isKeepForever = true)', () => {
    it('bộ lọc findMany luôn loại trừ tệp có isKeepForever = true', async () => {
      await retentionService.runRetentionCleanup();

      expect(prismaMock.assignmentAttachment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isKeepForever: false,
          }),
        }),
      );
    });

    it('giáo viên đánh dấu giữ tệp vĩnh viễn thành công', async () => {
      prismaMock.assignmentAttachment.findUnique.mockResolvedValueOnce({
        id: 'att-1',
        assignment: { class: { teacherId: 't1' } },
      });
      prismaMock.assignmentAttachment.update.mockResolvedValueOnce({
        id: 'att-1',
        isKeepForever: true,
      });

      const res = await retentionService.toggleAttachmentKeepForever(
        'att-1',
        true,
        { id: 't1', role: UserRole.TEACHER },
      );

      expect(res.isKeepForever).toBe(true);
      expect(prismaMock.assignmentAttachment.update).toHaveBeenCalledWith({
        where: { id: 'att-1' },
        data: { isKeepForever: true },
      });
    });
  });
});
