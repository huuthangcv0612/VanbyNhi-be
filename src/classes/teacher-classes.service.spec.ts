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
  SessionStatus,
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
        findFirst: vi.fn(),
        findMany: vi.fn(),
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
    it('lấy danh sách lớp của giáo viên với nextSession và số lượng học sinh', async () => {
      prismaMock.$queryRaw
        .mockResolvedValueOnce([{ count: 1 }]) // count query
        .mockResolvedValueOnce([
          {
            id: 'c1',
            name: 'Lớp 1',
            description: 'Mô tả lớp 1',
            classCode: 'CODE1',
            joinCode: 'JOIN1',
            maxStudents: 30,
            defaultMeetUrl: 'https://meet.google.com/c1',
            monthlyTuition: 1500000,
            status: ClassStatus.ACTIVE,
            createdById: 'teacher-1',
            teacherId: 'teacher-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            activeStudentCount: 5,
            totalSessionsCount: 2,
            nextSession_id: 's1',
            nextSession_title: 'Buổi 1',
            nextSession_description: 'Mô tả buổi 1',
            nextSession_startTime: new Date('2026-10-20T08:00:00Z'),
            nextSession_endTime: new Date('2026-10-20T10:00:00Z'),
            nextSession_status: SessionStatus.SCHEDULED,
          },
        ]); // data query

      const res = await service.getMyClasses('teacher-1', {
        page: 1,
        limit: 10,
      });

      expect(res.items).toHaveLength(1);
      expect(res.items[0].activeStudentCount).toBe(5);
      expect(res.items[0].nextSession).toBeDefined();
      expect(res.items[0].nextSession?.id).toBe('s1');
      expect(res.items[0].nextSession?.status).toBe(SessionStatus.SCHEDULED);
      expect(res.pagination.total).toBe(1);
    });

    it('ưu tiên lớp có buổi LIVE (IN_PROGRESS) lên trước lớp có buổi SCHEDULED và lớp không có lịch', async () => {
      // Mock rows trả về đúng thứ tự do database order by priority_score
      const rows = [
        {
          id: 'c-live',
          name: 'Lớp Đang Diễn Ra',
          status: ClassStatus.ACTIVE,
          activeStudentCount: 10,
          totalSessionsCount: 5,
          nextSession_id: 'sess-live',
          nextSession_title: 'Buổi Đang Dạy',
          nextSession_startTime: new Date('2026-10-15T09:00:00Z'),
          nextSession_endTime: new Date('2026-10-15T11:00:00Z'),
          nextSession_status: SessionStatus.IN_PROGRESS,
          priority_score: 1,
        },
        {
          id: 'c-upcoming-1',
          name: 'Lớp Sắp Diễn Ra Sớm Nhất',
          status: ClassStatus.ACTIVE,
          activeStudentCount: 8,
          totalSessionsCount: 3,
          nextSession_id: 'sess-up-1',
          nextSession_title: 'Buổi Ngày Mai Sáng',
          nextSession_startTime: new Date('2026-10-16T08:00:00Z'),
          nextSession_endTime: new Date('2026-10-16T10:00:00Z'),
          nextSession_status: SessionStatus.SCHEDULED,
          priority_score: 2,
        },
        {
          id: 'c-upcoming-2',
          name: 'Lớp Sắp Diễn Ra Chiều Mai',
          status: ClassStatus.ACTIVE,
          activeStudentCount: 12,
          totalSessionsCount: 4,
          nextSession_id: 'sess-up-2',
          nextSession_title: 'Buổi Ngày Mai Chiều',
          nextSession_startTime: new Date('2026-10-16T14:00:00Z'),
          nextSession_endTime: new Date('2026-10-16T16:00:00Z'),
          nextSession_status: SessionStatus.SCHEDULED,
          priority_score: 2,
        },
        {
          id: 'c-no-session',
          name: 'Lớp Chưa Có Lịch',
          status: ClassStatus.ACTIVE,
          activeStudentCount: 0,
          totalSessionsCount: 0,
          nextSession_id: null,
          nextSession_status: null,
          priority_score: 3,
        },
      ];

      prismaMock.$queryRaw
        .mockResolvedValueOnce([{ count: 4 }])
        .mockResolvedValueOnce(rows);

      const res = await service.getMyClasses('teacher-1', {});
      expect(res.items).toHaveLength(4);
      expect(res.items[0].id).toBe('c-live');
      expect(res.items[0].nextSession?.status).toBe(SessionStatus.IN_PROGRESS);
      expect(res.items[1].id).toBe('c-upcoming-1');
      expect(res.items[2].id).toBe('c-upcoming-2');
      expect(res.items[3].id).toBe('c-no-session');
      expect(res.items[3].nextSession).toBeNull();
    });

    it('xem chi tiết lớp của mình thành công và trả về nextSession', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        name: 'Lớp 1',
        teacherId: 'teacher-1',
      });
      prismaMock.enrollment.count
        .mockResolvedValueOnce(10) // active
        .mockResolvedValueOnce(2); // pending
      prismaMock.classSession.count.mockResolvedValue(4);
      prismaMock.classSession.findFirst
        .mockResolvedValueOnce(null) // liveSession
        .mockResolvedValueOnce({
          id: 's-next',
          title: 'Buổi Tiếp Theo',
          startTime: new Date('2026-10-25T08:00:00Z'),
          endTime: new Date('2026-10-25T10:00:00Z'),
          status: SessionStatus.SCHEDULED,
        });

      const res = await service.getClassDetail('teacher-1', 'c1');
      expect(res.id).toBe('c1');
      expect(res.activeStudentCount).toBe(10);
      expect(res.pendingRequestsCount).toBe(2);
      expect(res.totalSessionsCount).toBe(4);
      expect(res.nextSession).toBeDefined();
      expect(res.nextSession?.id).toBe('s-next');
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
