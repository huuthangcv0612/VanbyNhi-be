import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service.js';
import {
  UserRole,
  ClassStatus,
  MemberStatus,
  AssignmentStatus,
  NotificationType,
  Prisma,
} from '../../generated/prisma/client.js';

describe('AssignmentsService', () => {
  let assignmentsService: AssignmentsService;
  let prismaMock: any;
  let notificationsMock: any;

  beforeEach(() => {
    prismaMock = {
      assignment: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      assignmentSubmission: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      class: {
        findUnique: vi.fn(),
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

    assignmentsService = new AssignmentsService(prismaMock, notificationsMock);
  });

  describe('create', () => {
    const baseDto = {
      classId: 'c1',
      title: 'Phân tích nhân vật Tràng',
      description: 'Đoạn trích Vợ nhặt',
      dueDate: new Date(2026, 11, 1),
    };

    it('tạo bài tập thành công cho lớp ACTIVE', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        status: ClassStatus.ACTIVE,
      });

      const created = {
        id: 'a1',
        ...baseDto,
        createdById: 'admin1',
        class: { id: 'c1', name: 'Lớp 12A' },
      };
      prismaMock.assignment.create.mockResolvedValue(created);

      const result = await assignmentsService.create('admin1', baseDto);

      expect(result.assignment).toEqual(created);
      expect(notificationsMock.notifyClassStudents).toHaveBeenCalledWith(
        'c1',
        expect.objectContaining({
          type: NotificationType.ASSIGNMENT,
          referenceId: 'a1',
        }),
      );
    });

    it('ném NotFoundException nếu lớp không tồn tại', async () => {
      prismaMock.class.findUnique.mockResolvedValue(null);

      await expect(
        assignmentsService.create('admin1', baseDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('ném BadRequestException nếu lớp không ở trạng thái ACTIVE', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        status: ClassStatus.COMPLETED,
      });

      await expect(
        assignmentsService.create('admin1', baseDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll & findOne permissions', () => {
    it('STUDENT chỉ được xem bài tập của lớp mình tham gia', async () => {
      prismaMock.enrollment.findMany.mockResolvedValue([{ classId: 'c1' }]);
      prismaMock.assignment.findMany.mockResolvedValue([]);
      prismaMock.assignment.count.mockResolvedValue(0);

      await assignmentsService.findAll(
        { id: 's1', role: UserRole.STUDENT },
        { classId: 'c1' },
      );

      expect(prismaMock.assignment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            classId: { in: ['c1'] },
          }),
        }),
      );
    });

    it('STUDENT bị chặn khi cố xem bài tập của lớp không tham gia', async () => {
      prismaMock.enrollment.findMany.mockResolvedValue([{ classId: 'c1' }]);

      await expect(
        assignmentsService.findAll(
          { id: 's1', role: UserRole.STUDENT },
          { classId: 'c2' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('submitAssignment (attemptNumber & permissions)', () => {
    const submitDto = {
      content: 'Bài làm phân tích tác phẩm',
      externalUrl: 'https://docs.google.com/document/d/123',
    };

    it('nộp bài thành công và tự tăng attemptNumber = 1 lần đầu', async () => {
      prismaMock.assignment.findUnique.mockResolvedValue({
        id: 'a1',
        classId: 'c1',
        dueDate: new Date(2026, 11, 1),
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'enr1',
        status: MemberStatus.ACTIVE,
      });

      prismaMock.assignmentSubmission.findFirst.mockResolvedValue(null); // Chưa nộp lần nào

      const createdSubmission = {
        id: 'sub1',
        assignmentId: 'a1',
        studentId: 's1',
        attemptNumber: 1,
        ...submitDto,
      };
      prismaMock.assignmentSubmission.create.mockResolvedValue(
        createdSubmission,
      );

      const result = await assignmentsService.submitAssignment(
        'a1',
        's1',
        submitDto,
      );

      expect(result.submission.attemptNumber).toBe(1);
      expect(prismaMock.assignmentSubmission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            attemptNumber: 1,
          }),
        }),
      );
    });

    it('nộp bài lại thành công và tự tăng attemptNumber lên 2', async () => {
      prismaMock.assignment.findUnique.mockResolvedValue({
        id: 'a1',
        classId: 'c1',
        dueDate: new Date(2026, 11, 1),
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'enr1',
        status: MemberStatus.ACTIVE,
      });

      prismaMock.assignmentSubmission.findFirst.mockResolvedValue({
        attemptNumber: 1,
      });

      const createdSubmission = {
        id: 'sub2',
        assignmentId: 'a1',
        studentId: 's1',
        attemptNumber: 2,
        ...submitDto,
      };
      prismaMock.assignmentSubmission.create.mockResolvedValue(
        createdSubmission,
      );

      const result = await assignmentsService.submitAssignment(
        'a1',
        's1',
        submitDto,
      );

      expect(result.submission.attemptNumber).toBe(2);
      expect(prismaMock.assignmentSubmission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            attemptNumber: 2,
          }),
        }),
      );
    });

    it('từ chối nộp bài nếu đã quá hạn dueDate', async () => {
      prismaMock.assignment.findUnique.mockResolvedValue({
        id: 'a1',
        classId: 'c1',
        dueDate: new Date(2020, 1, 1), // Quá hạn
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'enr1',
        status: MemberStatus.ACTIVE,
      });

      await expect(
        assignmentsService.submitAssignment('a1', 's1', submitDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('chặn học sinh nộp bài nếu không thuộc lớp', async () => {
      prismaMock.assignment.findUnique.mockResolvedValue({
        id: 'a1',
        classId: 'c1',
      });

      prismaMock.enrollment.findFirst.mockResolvedValue(null);

      await expect(
        assignmentsService.submitAssignment('a1', 's_stranger', submitDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getSubmission (Student isolation)', () => {
    it('chặn học sinh xem bài nộp của học sinh khác', async () => {
      prismaMock.assignmentSubmission.findUnique.mockResolvedValue({
        id: 'sub1',
        studentId: 'student_A',
      });

      await expect(
        assignmentsService.getSubmission('sub1', {
          id: 'student_B',
          role: UserRole.STUDENT,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('cho phép học sinh xem bài nộp của chính mình', async () => {
      const mockSub = {
        id: 'sub1',
        studentId: 'student_A',
      };
      prismaMock.assignmentSubmission.findUnique.mockResolvedValue(mockSub);

      const result = await assignmentsService.getSubmission('sub1', {
        id: 'student_A',
        role: UserRole.STUDENT,
      });

      expect(result).toEqual(mockSub);
    });
  });

  describe('gradeSubmission (0 - 10 check)', () => {
    it('chấm điểm hợp lệ thành công', async () => {
      prismaMock.assignmentSubmission.findUnique.mockResolvedValue({
        id: 'sub1',
        attemptNumber: 1,
      });

      const updated = {
        id: 'sub1',
        score: new Prisma.Decimal(8.5),
        feedback: 'Bài làm phân tích sâu sắc',
        status: AssignmentStatus.GRADED,
        student: { id: 's1', fullName: 'Học sinh 1' },
        assignment: { id: 'a1', title: 'Bài tập 1' },
      };
      prismaMock.assignmentSubmission.update.mockResolvedValue(updated);

      const result = await assignmentsService.gradeSubmission(
        'sub1',
        'admin1',
        {
          score: 8.5,
          feedback: 'Bài làm phân tích sâu sắc',
        },
      );

      expect(result.submission.score).toEqual(new Prisma.Decimal(8.5));
      expect(notificationsMock.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 's1',
          type: NotificationType.ASSIGNMENT,
          referenceId: 'sub1',
        }),
      );
    });

    it('từ chối điểm số ngoài khoảng 0 - 10', async () => {
      prismaMock.assignmentSubmission.findUnique.mockResolvedValue({
        id: 'sub1',
      });

      await expect(
        assignmentsService.gradeSubmission('sub1', 'admin1', { score: 10.5 }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        assignmentsService.gradeSubmission('sub1', 'admin1', { score: -1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
