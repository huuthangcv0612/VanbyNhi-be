import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service.js';
import {
  UserRole,
  ClassStatus,
  MemberStatus,
  AssignmentStatus,
  ReviewStatus,
  UploadTargetType,
  NotificationType,
  Prisma,
} from '../../generated/prisma/client.js';

describe('AssignmentsService', () => {
  let assignmentsService: AssignmentsService;
  let prismaMock: any;
  let notificationsMock: any;
  let r2StorageMock: any;

  beforeEach(() => {
    prismaMock = {
      assignment: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      assignmentSubmission: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      submissionReview: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      assignmentAttachment: {
        createMany: vi.fn(),
        findUnique: vi.fn(),
        updateMany: vi.fn(),
        update: vi.fn(),
      },
      submissionAttachment: {
        createMany: vi.fn(),
        findUnique: vi.fn(),
        updateMany: vi.fn(),
        update: vi.fn(),
      },
      reviewAttachment: {
        createMany: vi.fn(),
        findUnique: vi.fn(),
        updateMany: vi.fn(),
        update: vi.fn(),
      },
      uploadSession: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      class: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      classSession: {
        findUnique: vi.fn(),
      },
      enrollment: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => {
        if (typeof cb === 'function') {
          return cb(prismaMock);
        }
        return Promise.all(cb);
      }),
    };

    notificationsMock = {
      createNotification: vi.fn().mockResolvedValue({ id: 'notif1' }),
      notifyClassStudents: vi.fn().mockResolvedValue({ count: 1 }),
    };

    r2StorageMock = {
      generateStorageKey: vi.fn((prefix) => `${prefix}/test-uuid`),
      createPresignedPutUrl: vi.fn().mockResolvedValue({
        uploadUrl: 'https://r2.test/upload',
        storageKey: 'assignments/test-uuid',
        expiresInSeconds: 300,
        requiredHeaders: { 'Content-Type': 'application/pdf' },
      }),
      createPresignedGetUrl: vi.fn().mockResolvedValue({
        downloadUrl: 'https://r2.test/download',
        expiresInSeconds: 300,
      }),
      getObjectMetadata: vi.fn().mockResolvedValue({
        sizeBytes: 1024,
        contentType: 'application/pdf',
      }),
      deleteObjects: vi.fn().mockResolvedValue(1),
      getMaxUploadSizeBytes: vi.fn().mockReturnValue(104857600),
    };

    const retentionMock: any = {
      calculateRetentionExpiresAt: vi.fn((date) =>
        date ? new Date(new Date(date).getTime() + 14 * 86400000) : null,
      ),
      getAssignmentAttachmentExpiration: vi.fn((date) =>
        date ? new Date(new Date(date).getTime() + 14 * 86400000) : null,
      ),
      getSubmissionAttachmentExpiration: vi.fn((date) =>
        date ? new Date(new Date(date).getTime() + 14 * 86400000) : null,
      ),
      getReviewAttachmentExpiration: vi.fn((status, date) =>
        status === ReviewStatus.RETURNED && date
          ? new Date(new Date(date).getTime() + 14 * 86400000)
          : null,
      ),
      toggleAttachmentKeepForever: vi
        .fn()
        .mockResolvedValue({ message: 'OK', isKeepForever: true }),
    };

    assignmentsService = new AssignmentsService(
      prismaMock,
      notificationsMock,
      r2StorageMock,
      retentionMock,
    );
  });

  // ==========================================
  // 1. TẠO BÀI TẬP (CREATE ASSIGNMENT)
  // ==========================================
  describe('create', () => {
    const baseDto = {
      classId: 'c1',
      title: 'Phân tích nhân vật Tràng',
      description: 'Đoạn trích Vợ nhặt',
      dueDate: new Date(2026, 11, 1),
      maxScore: 10,
      allowResubmission: true,
    };

    it('giáo viên tạo bài tập thành công cho lớp mình phụ trách', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        name: 'Lớp 12A',
        teacherId: 'teacher-1',
        status: ClassStatus.ACTIVE,
      });

      const created = {
        id: 'a1',
        ...baseDto,
        maxScore: new Prisma.Decimal(10),
        createdById: 'teacher-1',
        class: { id: 'c1', name: 'Lớp 12A', classCode: 'L12A' },
        createdBy: { id: 'teacher-1', fullName: 'Cô Vân', role: UserRole.TEACHER },
        session: null,
        attachments: [],
      };
      prismaMock.assignment.create.mockResolvedValue(created);
      prismaMock.assignment.findUnique.mockResolvedValue(created);

      const result = await assignmentsService.create(
        'teacher-1',
        UserRole.TEACHER,
        baseDto,
      );

      expect(result.assignment.id).toBe('a1');
      expect(result.assignment.maxScore).toBe(10);
      expect(notificationsMock.notifyClassStudents).toHaveBeenCalledWith(
        'c1',
        expect.objectContaining({
          type: NotificationType.ASSIGNMENT,
          referenceId: 'a1',
        }),
      );
    });

    it('ném ForbiddenException nếu giáo viên tạo bài tập cho lớp của người khác', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        name: 'Lớp 12A',
        teacherId: 'teacher-other',
        status: ClassStatus.ACTIVE,
      });

      await expect(
        assignmentsService.create('teacher-1', UserRole.TEACHER, baseDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('ném NotFoundException nếu lớp không tồn tại', async () => {
      prismaMock.class.findUnique.mockResolvedValue(null);

      await expect(
        assignmentsService.create('admin-1', UserRole.ADMIN, baseDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('ném BadRequestException nếu lớp đang không hoạt động (INACTIVE)', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        teacherId: 'teacher-1',
        status: ClassStatus.INACTIVE,
      });

      await expect(
        assignmentsService.create('teacher-1', UserRole.TEACHER, baseDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('tạo bài tập kèm tệp đính kèm và kiểm tra upload session', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        name: 'Lớp 12A',
        teacherId: 'teacher-1',
        status: ClassStatus.ACTIVE,
      });

      prismaMock.uploadSession.findMany.mockResolvedValue([
        {
          id: 's1',
          storageKey: 'assignments/test-key',
          originalName: 'de_bai.pdf',
          mimeType: 'application/pdf',
          sizeBytes: BigInt(2048),
          userId: 'teacher-1',
          targetType: UploadTargetType.ASSIGNMENT,
        },
      ]);
      prismaMock.uploadSession.update.mockResolvedValue({});

      const created = {
        id: 'a1',
        ...baseDto,
        maxScore: new Prisma.Decimal(10),
        createdById: 'teacher-1',
        class: { id: 'c1', name: 'Lớp 12A', classCode: 'L12A' },
        createdBy: { id: 'teacher-1', fullName: 'Cô Vân', role: UserRole.TEACHER },
        session: null,
        attachments: [
          {
            id: 'att-1',
            storageKey: 'assignments/test-key',
            originalName: 'de_bai.pdf',
            mimeType: 'application/pdf',
            sizeBytes: BigInt(2048),
            uploadedById: 'teacher-1',
            createdAt: new Date(),
          },
        ],
      };
      prismaMock.assignment.create.mockResolvedValue(created);
      prismaMock.assignment.findUnique.mockResolvedValue(created);

      const result = await assignmentsService.create(
        'teacher-1',
        UserRole.TEACHER,
        {
          ...baseDto,
          attachmentKeys: ['assignments/test-key'],
        },
      );

      expect(prismaMock.assignmentAttachment.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            assignmentId: 'a1',
            storageKey: 'assignments/test-key',
            originalName: 'de_bai.pdf',
          }),
        ],
      });
      expect(result.assignment.attachments[0].sizeBytes).toBe(2048);
    });
  });

  // ==========================================
  // 2. DANH SÁCH BÀI TẬP (FIND ALL)
  // ==========================================
  describe('findAll', () => {
    it('admin xem được tất cả bài tập', async () => {
      prismaMock.assignment.findMany.mockResolvedValue([]);
      prismaMock.assignment.count.mockResolvedValue(0);

      const result = await assignmentsService.findAll(
        { id: 'admin1', role: UserRole.ADMIN },
        { page: 1, limit: 10 },
      );

      expect(result.items).toEqual([]);
      expect(prismaMock.assignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it('giáo viên chỉ xem được bài tập của các lớp do mình dạy', async () => {
      prismaMock.class.findMany.mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]);
      prismaMock.assignment.findMany.mockResolvedValue([]);
      prismaMock.assignment.count.mockResolvedValue(0);

      await assignmentsService.findAll(
        { id: 't1', role: UserRole.TEACHER },
        { page: 1, limit: 10 },
      );

      expect(prismaMock.assignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { classId: { in: ['c1', 'c2'] } },
        }),
      );
    });

    it('học sinh chỉ xem được bài tập của các lớp đang học (ACTIVE)', async () => {
      prismaMock.enrollment.findMany.mockResolvedValue([{ classId: 'c1' }]);
      prismaMock.assignment.findMany.mockResolvedValue([]);
      prismaMock.assignment.count.mockResolvedValue(0);

      await assignmentsService.findAll(
        { id: 's1', role: UserRole.STUDENT },
        { page: 1, limit: 10 },
      );

      expect(prismaMock.assignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { classId: { in: ['c1'] } },
        }),
      );
    });

    it('học sinh ném ForbiddenException nếu truy vấn lớp không tham gia', async () => {
      prismaMock.enrollment.findMany.mockResolvedValue([{ classId: 'c1' }]);

      await expect(
        assignmentsService.findAll(
          { id: 's1', role: UserRole.STUDENT },
          { classId: 'c2_other' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ==========================================
  // 3. THỐNG KÊ HỌC SINH ĐỦ ĐIỀU KIỆN (ELIGIBLE & STATS)
  // ==========================================
  describe('getEligibleStudents & getAssignmentStats', () => {
    it('thống kê chính xác học sinh ACTIVE và các trạng thái nộp/chấm', async () => {
      const assignment = {
        id: 'a1',
        classId: 'c1',
        title: 'Bài tập 1',
        dueDate: new Date(2026, 9, 20), // Quá hạn so với hôm nay
        maxScore: new Prisma.Decimal(10),
        class: { id: 'c1', teacherId: 't1', name: 'Lớp 12A' },
      };
      prismaMock.assignment.findUnique.mockResolvedValue(assignment);

      // 3 học sinh ACTIVE trong lớp
      prismaMock.enrollment.findMany.mockResolvedValue([
        {
          studentId: 's1',
          status: MemberStatus.ACTIVE,
          student: { id: 's1', fullName: 'Nguyễn Văn A', phone: '0901' },
        },
        {
          studentId: 's2',
          status: MemberStatus.ACTIVE,
          student: { id: 's2', fullName: 'Trần Thị B', phone: '0902' },
        },
        {
          studentId: 's3',
          status: MemberStatus.ACTIVE,
          student: { id: 's3', fullName: 'Lê Văn C', phone: '0903' },
        },
      ]);

      // s1 đã được trả bài, s2 nộp muộn chờ chấm, s3 chưa nộp
      prismaMock.assignmentSubmission.findMany.mockResolvedValue([
        {
          id: 'sub-1',
          studentId: 's1',
          attemptNumber: 1,
          isLate: false,
          submittedAt: new Date(2026, 9, 15),
          review: {
            id: 'rev-1',
            status: ReviewStatus.RETURNED,
            score: new Prisma.Decimal(9.5),
          },
        },
        {
          id: 'sub-2',
          studentId: 's2',
          attemptNumber: 1,
          isLate: true,
          submittedAt: new Date(2026, 9, 22),
          review: null,
        },
      ]);

      const result = await assignmentsService.getEligibleStudents('a1', {
        id: 't1',
        role: UserRole.TEACHER,
      });

      expect(result.totalEligible).toBe(3);
      expect(result.students).toHaveLength(3);

      const s1Res = result.students.find((s) => s.studentId === 's1');
      expect(s1Res?.status).toBe('RETURNED');
      expect(s1Res?.score).toBe(9.5);

      const s2Res = result.students.find((s) => s.studentId === 's2');
      expect(s2Res?.status).toBe('LATE');

      const s3Res = result.students.find((s) => s.studentId === 's3');
      expect(s3Res?.status).toBe('NOT_SUBMITTED');

      // Test stats endpoint
      const stats = await assignmentsService.getAssignmentStats('a1', {
        id: 't1',
        role: UserRole.TEACHER,
      });

      expect(stats.totalEligible).toBe(3);
      expect(stats.submittedCount).toBe(2);
      expect(stats.notSubmittedCount).toBe(1);
      expect(stats.lateCount).toBe(1);
      expect(stats.returnedCount).toBe(1);
      expect(stats.averageScore).toBe(9.5);
    });
  });

  // ==========================================
  // 4. HỌC SINH NỘP BÀI (SUBMISSION & RESUBMISSION)
  // ==========================================
  describe('submitAssignment', () => {
    it('học sinh ACTIVE nộp bài lần đầu thành công', async () => {
      prismaMock.assignment.findUnique.mockResolvedValue({
        id: 'a1',
        classId: 'c1',
        title: 'Bài tập 1',
        dueDate: new Date(2026, 11, 1),
        allowResubmission: true,
        maxAttempts: null,
        class: { id: 'c1', name: 'Lớp 12A' },
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'enr1',
        classId: 'c1',
        studentId: 's1',
        status: MemberStatus.ACTIVE,
      });

      prismaMock.assignmentSubmission.findMany.mockResolvedValue([]);
      prismaMock.assignmentSubmission.create.mockResolvedValue({
        id: 'sub1',
        assignmentId: 'a1',
        studentId: 's1',
        attemptNumber: 1,
        content: 'Bài làm của em',
        isLate: false,
      });
      prismaMock.assignmentSubmission.findUnique.mockResolvedValue({
        id: 'sub1',
        assignmentId: 'a1',
        studentId: 's1',
        attemptNumber: 1,
        content: 'Bài làm của em',
        isLate: false,
        score: null,
        attachments: [],
      });

      const res = await assignmentsService.submitAssignment('a1', 's1', {
        content: 'Bài làm của em',
      });

      expect(res.message).toContain('Lần nộp thứ 1');
      expect(res.submission.attemptNumber).toBe(1);
      expect(res.submission.isLate).toBe(false);
    });

    it('nộp muộn được đánh dấu isLate = true nếu sau dueDate', async () => {
      prismaMock.assignment.findUnique.mockResolvedValue({
        id: 'a1',
        classId: 'c1',
        title: 'Bài tập 1',
        dueDate: new Date(2026, 9, 1), // Trong quá khứ
        allowResubmission: true,
        maxAttempts: null,
        class: { id: 'c1', name: 'Lớp 12A' },
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'enr1',
        status: MemberStatus.ACTIVE,
      });

      prismaMock.assignmentSubmission.findMany.mockResolvedValue([]);
      prismaMock.assignmentSubmission.create.mockResolvedValue({
        id: 'sub1',
        isLate: true,
      });
      prismaMock.assignmentSubmission.findUnique.mockResolvedValue({
        id: 'sub1',
        isLate: true,
        attachments: [],
      });

      const res = await assignmentsService.submitAssignment('a1', 's1', {
        content: 'Nộp muộn',
      });

      expect(res.message).toContain('(Nộp muộn)');
      expect(res.submission.isLate).toBe(true);
    });

    it('chặn nộp lại nếu allowResubmission = false', async () => {
      prismaMock.assignment.findUnique.mockResolvedValue({
        id: 'a1',
        classId: 'c1',
        allowResubmission: false,
        maxAttempts: null,
        class: { id: 'c1' },
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'enr1',
        status: MemberStatus.ACTIVE,
      });

      prismaMock.assignmentSubmission.findMany.mockResolvedValue([
        { id: 'sub-prev', attemptNumber: 1 },
      ]);

      await expect(
        assignmentsService.submitAssignment('a1', 's1', {
          content: 'Nộp lần 2',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('chặn nộp lại nếu vượt quá maxAttempts', async () => {
      prismaMock.assignment.findUnique.mockResolvedValue({
        id: 'a1',
        classId: 'c1',
        allowResubmission: true,
        maxAttempts: 2,
        class: { id: 'c1' },
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'enr1',
        status: MemberStatus.ACTIVE,
      });

      prismaMock.assignmentSubmission.findMany.mockResolvedValue([
        { id: 'sub-2', attemptNumber: 2 },
        { id: 'sub-1', attemptNumber: 1 },
      ]);

      await expect(
        assignmentsService.submitAssignment('a1', 's1', {
          content: 'Nộp lần 3',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('chặn nộp nếu học sinh không thuộc lớp hoặc không ACTIVE', async () => {
      prismaMock.assignment.findUnique.mockResolvedValue({
        id: 'a1',
        classId: 'c1',
        class: { id: 'c1' },
      });

      prismaMock.enrollment.findFirst.mockResolvedValue(null);

      await expect(
        assignmentsService.submitAssignment('a1', 's-stranger', {
          content: 'Em muốn nộp',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ==========================================
  // 5. BẢO MẬT REVIEW DRAFT VÀ TRẢ BÀI (DRAFT/RETURN & IDOR)
  // ==========================================
  describe('reviewSubmission & returnSubmissionReview', () => {
    it('giáo viên lưu bản nháp (DRAFT) thành công, không gửi thông báo cho học sinh', async () => {
      prismaMock.assignmentSubmission.findUnique.mockResolvedValue({
        id: 'sub1',
        assignment: {
          id: 'a1',
          title: 'Bài tập 1',
          maxScore: new Prisma.Decimal(10),
          class: { teacherId: 't1' },
        },
        student: { id: 's1', fullName: 'Học sinh 1' },
        review: null,
      });

      prismaMock.submissionReview.findUnique.mockResolvedValue(null);
      prismaMock.submissionReview.create.mockResolvedValue({
        id: 'rev1',
        submissionId: 'sub1',
        reviewerId: 't1',
        score: new Prisma.Decimal(8.5),
        feedback: 'Cần chú ý dẫn chứng',
        status: ReviewStatus.DRAFT,
      });

      prismaMock.assignmentSubmission.update.mockResolvedValue({
        id: 'sub1',
        score: new Prisma.Decimal(8.5),
        feedback: 'Cần chú ý dẫn chứng',
        review: {
          id: 'rev1',
          status: ReviewStatus.DRAFT,
          score: new Prisma.Decimal(8.5),
          feedback: 'Cần chú ý dẫn chứng',
          attachments: [],
        },
      });

      const res = await assignmentsService.reviewSubmission(
        'sub1',
        't1',
        UserRole.TEACHER,
        {
          score: 8.5,
          feedback: 'Cần chú ý dẫn chứng',
          status: ReviewStatus.DRAFT,
        },
      );

      expect(res.message).toBe('Đã lưu bản nháp chấm bài');
      expect(res.review.status).toBe(ReviewStatus.DRAFT);
      expect(notificationsMock.createNotification).not.toHaveBeenCalled();
    });

    it('ném BadRequestException nếu điểm vượt quá maxScore', async () => {
      prismaMock.assignmentSubmission.findUnique.mockResolvedValue({
        id: 'sub1',
        assignment: {
          maxScore: new Prisma.Decimal(10),
          class: { teacherId: 't1' },
        },
      });

      await expect(
        assignmentsService.reviewSubmission(
          'sub1',
          't1',
          UserRole.TEACHER,
          { score: 12 },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('trả bài (RETURN) thành công và gửi thông báo cho học sinh', async () => {
      prismaMock.assignmentSubmission.findUnique.mockResolvedValue({
        id: 'sub1',
        attemptNumber: 1,
        assignment: {
          id: 'a1',
          title: 'Bài tập 1',
          maxScore: new Prisma.Decimal(10),
          class: { teacherId: 't1' },
        },
        student: { id: 's1', fullName: 'Học sinh 1' },
        review: {
          id: 'rev1',
          score: new Prisma.Decimal(9),
          feedback: 'Tốt',
          status: ReviewStatus.DRAFT,
        },
      });

      prismaMock.submissionReview.update.mockResolvedValue({
        id: 'rev1',
        status: ReviewStatus.RETURNED,
        score: new Prisma.Decimal(9),
        feedback: 'Tốt',
        returnedAt: new Date(),
        reviewer: { id: 't1', fullName: 'Cô Vân' },
        attachments: [],
      });
      prismaMock.assignmentSubmission.update.mockResolvedValue({});

      const res = await assignmentsService.returnSubmissionReview(
        'sub1',
        't1',
        UserRole.TEACHER,
      );

      expect(res.message).toContain('Trả bài thành công');
      expect(res.review.status).toBe(ReviewStatus.RETURNED);
      expect(notificationsMock.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 's1',
          type: NotificationType.ASSIGNMENT,
        }),
      );
    });

    it('Học sinh xem bài nộp: DRAFT review bị ẩn hoàn toàn', async () => {
      prismaMock.assignmentSubmission.findUnique.mockResolvedValue({
        id: 'sub1',
        assignmentId: 'a1',
        studentId: 's1',
        attemptNumber: 1,
        status: AssignmentStatus.GRADED,
        score: new Prisma.Decimal(8),
        feedback: 'Nhận xét nháp',
        assignment: {
          id: 'a1',
          title: 'Bài tập 1',
          maxScore: new Prisma.Decimal(10),
          class: { teacherId: 't1' },
        },
        student: { id: 's1', fullName: 'Học sinh 1' },
        attachments: [],
        review: {
          id: 'rev1',
          score: new Prisma.Decimal(8),
          feedback: 'Nhận xét nháp',
          status: ReviewStatus.DRAFT,
          attachments: [],
        },
      });

      const res = await assignmentsService.getSubmission('sub1', {
        id: 's1',
        role: UserRole.STUDENT,
      });

      // Học sinh KHÔNG THẤY review draft, điểm hiển thị là null
      expect(res.review).toBeNull();
      expect(res.score).toBeNull();
      expect(res.feedback).toBeNull();
      expect(res.status).toBe(AssignmentStatus.SUBMITTED);
    });

    it('Học sinh xem bài nộp: RETURNED review được hiển thị đầy đủ', async () => {
      prismaMock.assignmentSubmission.findUnique.mockResolvedValue({
        id: 'sub1',
        assignmentId: 'a1',
        studentId: 's1',
        attemptNumber: 1,
        status: AssignmentStatus.RETURNED,
        score: new Prisma.Decimal(9.5),
        feedback: 'Bài làm xuất sắc',
        assignment: {
          id: 'a1',
          title: 'Bài tập 1',
          maxScore: new Prisma.Decimal(10),
          class: { teacherId: 't1' },
        },
        student: { id: 's1', fullName: 'Học sinh 1' },
        attachments: [],
        review: {
          id: 'rev1',
          score: new Prisma.Decimal(9.5),
          feedback: 'Bài làm xuất sắc',
          status: ReviewStatus.RETURNED,
          attachments: [],
        },
      });

      const res = await assignmentsService.getSubmission('sub1', {
        id: 's1',
        role: UserRole.STUDENT,
      });

      expect(res.review).not.toBeNull();
      expect(res.score).toBe(9.5);
      expect(res.feedback).toBe('Bài làm xuất sắc');
      expect(res.status).toBe(AssignmentStatus.RETURNED);
    });

    it('IDOR: Học sinh không thể xem bài nộp của học sinh khác', async () => {
      prismaMock.assignmentSubmission.findUnique.mockResolvedValue({
        id: 'sub1',
        studentId: 's-other',
        assignment: { class: { teacherId: 't1' } },
      });

      await expect(
        assignmentsService.getSubmission('sub1', {
          id: 's-attacker',
          role: UserRole.STUDENT,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ==========================================
  // 6. BẢO MẬT ATTACHMENTS & TẢI XUỐNG TỆP
  // ==========================================
  describe('getAttachmentDownloadUrl & initUpload', () => {
    it('học sinh không được phép tải bài chữa đính kèm khi review còn là DRAFT', async () => {
      prismaMock.assignmentAttachment.findUnique.mockResolvedValue(null);
      prismaMock.submissionAttachment.findUnique.mockResolvedValue(null);
      prismaMock.reviewAttachment.findUnique.mockResolvedValue({
        id: 'rev-att-1',
        storageKey: 'reviews/key1',
        originalName: 'chua_bai.pdf',
        review: {
          status: ReviewStatus.DRAFT,
          submission: {
            studentId: 's1',
            assignment: { class: { teacherId: 't1' } },
          },
        },
      });

      await expect(
        assignmentsService.getAttachmentDownloadUrl('rev-att-1', {
          id: 's1',
          role: UserRole.STUDENT,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('học sinh được phép tải bài chữa đính kèm khi review đã RETURNED', async () => {
      prismaMock.assignmentAttachment.findUnique.mockResolvedValue(null);
      prismaMock.submissionAttachment.findUnique.mockResolvedValue(null);
      prismaMock.reviewAttachment.findUnique.mockResolvedValue({
        id: 'rev-att-1',
        storageKey: 'reviews/key1',
        originalName: 'chua_bai.pdf',
        mimeType: 'application/pdf',
        review: {
          status: ReviewStatus.RETURNED,
          submission: {
            studentId: 's1',
            assignment: { class: { teacherId: 't1' } },
          },
        },
      });

      const res = await assignmentsService.getAttachmentDownloadUrl('rev-att-1', {
        id: 's1',
        role: UserRole.STUDENT,
      });

      expect(res.downloadUrl).toBe('https://r2.test/download');
      expect(res.originalName).toBe('chua_bai.pdf');
    });

    it('học sinh không thể khởi tạo upload đề bài (targetType = ASSIGNMENT)', async () => {
      await expect(
        assignmentsService.initUpload('s1', UserRole.STUDENT, {
          targetType: UploadTargetType.ASSIGNMENT,
          originalName: 'de_bai.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1024,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('giáo viên không thể khởi tạo upload bài nộp học sinh (targetType = SUBMISSION)', async () => {
      await expect(
        assignmentsService.initUpload('t1', UserRole.TEACHER, {
          targetType: UploadTargetType.SUBMISSION,
          originalName: 'bai_lam.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1024,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
