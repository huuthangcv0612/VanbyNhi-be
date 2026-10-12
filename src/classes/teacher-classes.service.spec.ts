import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { TeacherClassesService } from './teacher-classes.service.js';
import {
  UserRole,
  ClassStatus,
  MemberStatus,
} from '../../generated/prisma/client.js';

describe('TeacherClassesService', () => {
  let service: TeacherClassesService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      class: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      enrollment: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      classSession: {
        count: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(prismaMock)),
      $queryRaw: vi.fn(),
    };

    service = new TeacherClassesService(prismaMock);
  });

  describe('createClass', () => {
    it('giáo viên tạo lớp học thành công', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        role: UserRole.TEACHER,
        isActive: true,
      });
      prismaMock.class.findUnique.mockResolvedValue(null); // joinCode unique
      prismaMock.class.create.mockResolvedValue({
        id: 'class-1',
        name: 'Lớp Văn 12',
        joinCode: 'CODE1234',
        status: ClassStatus.ACTIVE,
        teacherId: 'teacher-1',
      });

      const result = await service.createClass('teacher-1', {
        name: 'Lớp Văn 12',
        maxStudents: 30,
      });

      expect(result.class.id).toBe('class-1');
      expect(prismaMock.class.create).toHaveBeenCalled();
    });

    it('báo lỗi nếu tài khoản không phải TEACHER', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'student-1',
        role: UserRole.STUDENT,
        isActive: true,
      });

      await expect(
        service.createClass('student-1', { name: 'Lớp 1' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('báo lỗi nếu tài khoản bị vô hiệu hóa', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        role: UserRole.TEACHER,
        isActive: false,
      });

      await expect(
        service.createClass('teacher-1', { name: 'Lớp 1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyClasses & getClassDetail', () => {
    it('lấy danh sách lớp của giáo viên', async () => {
      prismaMock.class.findMany.mockResolvedValue([
        {
          id: 'c1',
          name: 'Lớp 1',
          _count: { members: 5, sessions: 2 },
        },
      ]);
      prismaMock.class.count.mockResolvedValue(1);

      const res = await service.getMyClasses('teacher-1', {
        page: 1,
        limit: 10,
      });
      expect(res.items).toHaveLength(1);
      expect(res.items[0].activeStudentCount).toBe(5);
    });

    it('xem chi tiết lớp của mình thành công', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        name: 'Lớp 1',
        teacherId: 'teacher-1',
      });
      prismaMock.enrollment.count
        .mockResolvedValueOnce(10) // active
        .mockResolvedValueOnce(2); // pending
      prismaMock.classSession.count.mockResolvedValue(4);

      const res = await service.getClassDetail('teacher-1', 'c1');
      expect(res.id).toBe('c1');
      expect(res.activeStudentCount).toBe(10);
      expect(res.pendingRequestsCount).toBe(2);
    });

    it('không cho giáo viên xem lớp của giáo viên khác (403)', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        name: 'Lớp của Teacher 2',
        teacherId: 'teacher-2',
      });

      await expect(service.getClassDetail('teacher-1', 'c1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('báo lỗi 404 nếu lớp không tồn tại', async () => {
      prismaMock.class.findUnique.mockResolvedValue(null);

      await expect(
        service.getClassDetail('teacher-1', 'c-none'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateClass & updateClassStatus', () => {
    it('sửa thông tin lớp thành công', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        teacherId: 'teacher-1',
      });
      prismaMock.class.update.mockResolvedValue({
        id: 'c1',
        name: 'Tên mới',
      });

      const res = await service.updateClass('teacher-1', 'c1', {
        name: 'Tên mới',
      });
      expect(res.class.name).toBe('Tên mới');
    });

    it('báo lỗi nếu giảm maxStudents nhỏ hơn số lượng học sinh ACTIVE hiện tại', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        teacherId: 'teacher-1',
      });
      prismaMock.enrollment.count.mockResolvedValue(15); // Đang có 15 học sinh

      await expect(
        service.updateClass('teacher-1', 'c1', { maxStudents: 10 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('cập nhật trạng thái lớp sang CLOSED', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        teacherId: 'teacher-1',
      });
      prismaMock.class.update.mockResolvedValue({
        id: 'c1',
        status: ClassStatus.CLOSED,
      });

      const res = await service.updateClassStatus('teacher-1', 'c1', {
        status: ClassStatus.CLOSED,
      });
      expect(res.class.status).toBe(ClassStatus.CLOSED);
    });
  });

  describe('regenerateJoinCode', () => {
    it('tạo lại joinCode mới cho lớp', async () => {
      prismaMock.class.findUnique
        .mockResolvedValueOnce({ id: 'c1', teacherId: 'teacher-1' }) // ownership check
        .mockResolvedValueOnce(null); // uniqueness check
      prismaMock.class.update.mockResolvedValue({
        id: 'c1',
        joinCode: 'NEWCODE8',
      });

      const res = await service.regenerateJoinCode('teacher-1', 'c1');
      expect(res.class.joinCode).toBe('NEWCODE8');
    });
  });

  describe('approveJoinRequest', () => {
    it('duyệt yêu cầu tham gia thành công', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        teacherId: 'teacher-1',
      });
      prismaMock.$queryRaw.mockResolvedValue([
        {
          id: 'c1',
          status: ClassStatus.ACTIVE,
          maxStudents: 20,
          teacherId: 'teacher-1',
        },
      ]);
      prismaMock.enrollment.findUnique.mockResolvedValue({
        id: 'mem-1',
        classId: 'c1',
        studentId: 'stu-1',
        status: MemberStatus.PENDING,
        student: { id: 'stu-1', isActive: true },
      });
      prismaMock.enrollment.findFirst.mockResolvedValue(null); // chưa có ACTIVE
      prismaMock.enrollment.count.mockResolvedValue(10); // current < max
      prismaMock.enrollment.update.mockResolvedValue({
        id: 'mem-1',
        status: MemberStatus.ACTIVE,
      });

      const res = await service.approveJoinRequest('teacher-1', 'c1', 'mem-1');
      expect(res.membership.status).toBe(MemberStatus.ACTIVE);
    });

    it('từ chối duyệt nếu lớp đã CLOSED', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        teacherId: 'teacher-1',
      });
      prismaMock.$queryRaw.mockResolvedValue([
        {
          id: 'c1',
          status: ClassStatus.CLOSED,
          maxStudents: 20,
          teacherId: 'teacher-1',
        },
      ]);

      await expect(
        service.approveJoinRequest('teacher-1', 'c1', 'mem-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối duyệt nếu lớp đã đạt maxStudents', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        teacherId: 'teacher-1',
      });
      prismaMock.$queryRaw.mockResolvedValue([
        {
          id: 'c1',
          status: ClassStatus.ACTIVE,
          maxStudents: 10,
          teacherId: 'teacher-1',
        },
      ]);
      prismaMock.enrollment.findUnique.mockResolvedValue({
        id: 'mem-1',
        classId: 'c1',
        studentId: 'stu-1',
        status: MemberStatus.PENDING,
        student: { id: 'stu-1', isActive: true },
      });
      prismaMock.enrollment.findFirst.mockResolvedValue(null);
      prismaMock.enrollment.count.mockResolvedValue(10); // Đã đầy 10/10

      await expect(
        service.approveJoinRequest('teacher-1', 'c1', 'mem-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối duyệt nếu học sinh đã là thành viên ACTIVE (409)', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        teacherId: 'teacher-1',
      });
      prismaMock.$queryRaw.mockResolvedValue([
        {
          id: 'c1',
          status: ClassStatus.ACTIVE,
          maxStudents: 20,
          teacherId: 'teacher-1',
        },
      ]);
      prismaMock.enrollment.findUnique.mockResolvedValue({
        id: 'mem-1',
        classId: 'c1',
        studentId: 'stu-1',
        status: MemberStatus.PENDING,
        student: { id: 'stu-1', isActive: true },
      });
      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'mem-existing-active',
      });

      await expect(
        service.approveJoinRequest('teacher-1', 'c1', 'mem-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('rejectJoinRequest & removeMember', () => {
    it('từ chối yêu cầu tham gia (REJECTED)', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        teacherId: 'teacher-1',
      });
      prismaMock.enrollment.findUnique.mockResolvedValue({
        id: 'mem-1',
        classId: 'c1',
        status: MemberStatus.PENDING,
      });
      prismaMock.enrollment.update.mockResolvedValue({
        id: 'mem-1',
        status: MemberStatus.REJECTED,
      });

      const res = await service.rejectJoinRequest('teacher-1', 'c1', 'mem-1');
      expect(res.membership.status).toBe(MemberStatus.REJECTED);
    });

    it('xóa học sinh khỏi lớp (REMOVED)', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        teacherId: 'teacher-1',
      });
      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'mem-1',
        classId: 'c1',
        studentId: 'stu-1',
        status: MemberStatus.ACTIVE,
      });
      prismaMock.enrollment.update.mockResolvedValue({
        id: 'mem-1',
        status: MemberStatus.REMOVED,
      });

      const res = await service.removeMember('teacher-1', 'c1', 'stu-1');
      expect(res.membership.status).toBe(MemberStatus.REMOVED);
    });

    it('báo lỗi khi xóa học sinh không thuộc lớp hoặc không ACTIVE', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        teacherId: 'teacher-1',
      });
      prismaMock.enrollment.findFirst.mockResolvedValue(null);

      await expect(
        service.removeMember('teacher-1', 'c1', 'stu-none'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
