import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { StudentClassesService } from './student-classes.service.js';
import {
  UserRole,
  ClassStatus,
  MemberStatus,
} from '../../generated/prisma/client.js';

describe('StudentClassesService', () => {
  let service: StudentClassesService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      class: {
        findUnique: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      enrollment: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new StudentClassesService(prismaMock);
  });

  describe('joinClass', () => {
    it('gửi yêu cầu tham gia lớp thành công bằng joinCode', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'stu-1',
        role: UserRole.STUDENT,
        isActive: true,
      });
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        name: 'Lớp 1',
        joinCode: 'JOIN1234',
        status: ClassStatus.ACTIVE,
        maxStudents: 30,
      });
      prismaMock.enrollment.findFirst
        .mockResolvedValueOnce(null) // no active
        .mockResolvedValueOnce(null); // no pending
      prismaMock.enrollment.count.mockResolvedValue(10);
      prismaMock.enrollment.create.mockResolvedValue({
        id: 'mem-1',
        classId: 'c1',
        studentId: 'stu-1',
        status: MemberStatus.PENDING,
      });

      const res = await service.joinClass('stu-1', { joinCode: 'JOIN1234' });
      expect(res.membership.status).toBe(MemberStatus.PENDING);
    });

    it('báo lỗi nếu mã tham gia không tồn tại (404)', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'stu-1',
        role: UserRole.STUDENT,
        isActive: true,
      });
      prismaMock.class.findUnique.mockResolvedValue(null);

      await expect(
        service.joinClass('stu-1', { joinCode: 'WRONG' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('báo lỗi nếu lớp học đã CLOSED (400)', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'stu-1',
        role: UserRole.STUDENT,
        isActive: true,
      });
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        status: ClassStatus.CLOSED,
      });

      await expect(
        service.joinClass('stu-1', { joinCode: 'JOIN1234' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('báo lỗi nếu học sinh đã là thành viên ACTIVE (409)', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'stu-1',
        role: UserRole.STUDENT,
        isActive: true,
      });
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        status: ClassStatus.ACTIVE,
      });
      prismaMock.enrollment.findFirst.mockResolvedValueOnce({
        id: 'active-mem',
        status: MemberStatus.ACTIVE,
      });

      await expect(
        service.joinClass('stu-1', { joinCode: 'JOIN1234' }),
      ).rejects.toThrow(ConflictException);
    });

    it('báo lỗi nếu học sinh đã có yêu cầu PENDING đang chờ (409)', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'stu-1',
        role: UserRole.STUDENT,
        isActive: true,
      });
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        status: ClassStatus.ACTIVE,
      });
      prismaMock.enrollment.findFirst
        .mockResolvedValueOnce(null) // no active
        .mockResolvedValueOnce({
          id: 'pending-mem',
          status: MemberStatus.PENDING,
        });

      await expect(
        service.joinClass('stu-1', { joinCode: 'JOIN1234' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getMyClasses & getClassDetail', () => {
    it('lấy danh sách lớp đã tham gia thành công của học sinh', async () => {
      prismaMock.enrollment.findMany.mockResolvedValue([
        {
          id: 'm1',
          joinedAt: new Date(),
          class: { id: 'c1', name: 'Lớp Văn 10' },
        },
      ]);
      prismaMock.enrollment.count.mockResolvedValue(1);

      const res = await service.getMyClasses('stu-1', { page: 1, limit: 10 });
      expect(res.items).toHaveLength(1);
      expect(res.items[0].membershipId).toBe('m1');
    });

    it('xem chi tiết lớp thành công khi là thành viên ACTIVE', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        name: 'Lớp 1',
      });
      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'm1',
        status: MemberStatus.ACTIVE,
      });

      const res = await service.getClassDetail('stu-1', 'c1');
      expect(res.id).toBe('c1');
    });

    it('không cho học sinh xem chi tiết nếu chưa phải thành viên ACTIVE (403)', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        name: 'Lớp 1',
      });
      prismaMock.enrollment.findFirst.mockResolvedValue(null);

      await expect(service.getClassDetail('stu-1', 'c1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('leaveClass', () => {
    it('học sinh tự rời lớp thành công (LEFT)', async () => {
      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'm1',
        classId: 'c1',
        studentId: 'stu-1',
        status: MemberStatus.ACTIVE,
      });
      prismaMock.enrollment.update.mockResolvedValue({
        id: 'm1',
        status: MemberStatus.LEFT,
      });

      const res = await service.leaveClass('stu-1', 'c1');
      expect(res.membership.status).toBe(MemberStatus.LEFT);
    });

    it('báo lỗi nếu học sinh không phải thành viên ACTIVE (404)', async () => {
      prismaMock.enrollment.findFirst.mockResolvedValue(null);

      await expect(service.leaveClass('stu-1', 'c1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
