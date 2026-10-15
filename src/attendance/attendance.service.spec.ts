import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service.js';
import {
  AttendanceStatus,
  SessionStatus,
  MemberStatus,
  UserRole,
} from '../../generated/prisma/client.js';

describe('AttendanceService', () => {
  let attendanceService: AttendanceService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      classSession: {
        findUnique: vi.fn(),
      },
      enrollment: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
      attendance: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        groupBy: vi.fn(),
      },
      attendanceChangeLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => {
        if (typeof cb === 'function') {
          return cb(prismaMock);
        }
        return Promise.all(cb);
      }),
    };

    attendanceService = new AttendanceService(prismaMock);
  });

  describe('getSessionAttendance', () => {
    it('lấy danh sách học sinh và kết quả điểm danh của session', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        title: 'Buổi 1',
        status: SessionStatus.SCHEDULED,
        startTime: new Date(),
        endTime: new Date(),
        class: { id: 'c1', name: 'Lớp 12A' },
      });

      prismaMock.enrollment.findMany.mockResolvedValue([
        {
          studentId: 'stu1',
          status: MemberStatus.ACTIVE,
          student: { id: 'stu1', fullName: 'Học sinh 1' },
        },
      ]);

      prismaMock.attendance.findMany.mockResolvedValue([
        {
          id: 'att1',
          studentId: 'stu1',
          status: AttendanceStatus.PRESENT,
          changeLogs: [],
        },
      ]);

      const result = await attendanceService.getSessionAttendance('s1');

      expect(result.session.id).toBe('s1');
      expect(result.students).toHaveLength(1);
      expect(result.students[0].attendance?.status).toBe(
        AttendanceStatus.PRESENT,
      );
    });

    it('ném NotFoundException nếu session không tồn tại', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue(null);

      await expect(
        attendanceService.getSessionAttendance('s999'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSessionSummary', () => {
    it('trả về tóm tắt thống kê điểm danh', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
      });
      prismaMock.enrollment.count.mockResolvedValue(10);
      prismaMock.attendance.groupBy.mockResolvedValue([
        { status: AttendanceStatus.PRESENT, _count: { _all: 7 } },
        { status: AttendanceStatus.ABSENT, _count: { _all: 2 } },
      ]);

      const result = await attendanceService.getSessionSummary('s1');

      expect(result.totalActiveStudents).toBe(10);
      expect(result.totalMarked).toBe(9);
      expect(result.unmarkedCount).toBe(1);
      expect(result.summary[AttendanceStatus.PRESENT]).toBe(7);
      expect(result.summary[AttendanceStatus.ABSENT]).toBe(2);
      expect(result.summary[AttendanceStatus.LATE]).toBe(0);
    });
  });

  describe('batchSaveAttendance', () => {
    it('chặn điểm danh nếu buổi học bị CANCELLED', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        status: SessionStatus.CANCELLED,
      });

      await expect(
        attendanceService.batchSaveAttendance('s1', 'admin1', {
          records: [{ studentId: 'stu1', status: AttendanceStatus.PRESENT }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối học sinh không thuộc lớp học của session', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        status: SessionStatus.SCHEDULED,
      });

      // Enrollment rỗng -> student không thuộc lớp
      prismaMock.enrollment.findMany.mockResolvedValue([]);

      await expect(
        attendanceService.batchSaveAttendance('s1', 'admin1', {
          records: [
            { studentId: 'stu_unknown', status: AttendanceStatus.PRESENT },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('tạo mới điểm danh lần đầu mà không tạo audit log giả', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        status: SessionStatus.SCHEDULED,
      });

      prismaMock.enrollment.findMany.mockResolvedValue([{ studentId: 'stu1' }]);
      prismaMock.attendance.findMany.mockResolvedValue([]); // Chưa có attendance cũ

      const createdRecord = {
        id: 'att1',
        sessionId: 's1',
        studentId: 'stu1',
        status: AttendanceStatus.PRESENT,
      };
      prismaMock.attendance.create.mockResolvedValue(createdRecord);

      const result = await attendanceService.batchSaveAttendance(
        's1',
        'admin1',
        {
          records: [{ studentId: 'stu1', status: AttendanceStatus.PRESENT }],
        },
      );

      expect(result.count).toBe(1);
      expect(prismaMock.attendance.create).toHaveBeenCalled();
      // Không được gọi attendanceChangeLog.create khi tạo lần đầu
      expect(prismaMock.attendanceChangeLog.create).not.toHaveBeenCalled();
    });

    it('cập nhật bản ghi điểm danh cũ và tạo AttendanceChangeLog nếu thay đổi trạng thái', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        status: SessionStatus.SCHEDULED,
      });

      prismaMock.enrollment.findMany.mockResolvedValue([{ studentId: 'stu1' }]);
      prismaMock.attendance.findMany.mockResolvedValue([
        {
          id: 'att1',
          studentId: 'stu1',
          status: AttendanceStatus.ABSENT,
        },
      ]);

      prismaMock.attendance.update.mockResolvedValue({
        id: 'att1',
        status: AttendanceStatus.PRESENT,
      });

      const result = await attendanceService.batchSaveAttendance(
        's1',
        'admin1',
        {
          records: [{ studentId: 'stu1', status: AttendanceStatus.PRESENT }],
        },
      );

      expect(result.count).toBe(1);
      expect(prismaMock.attendance.update).toHaveBeenCalled();
      expect(prismaMock.attendanceChangeLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            attendanceId: 'att1',
            oldStatus: AttendanceStatus.ABSENT,
            newStatus: AttendanceStatus.PRESENT,
            changedById: 'admin1',
          }),
        }),
      );
    });
  });

  describe('updateAttendance', () => {
    it('cập nhật trạng thái điểm danh và ghi log bằng transaction', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue({
        id: 'att1',
        status: AttendanceStatus.ABSENT,
        checkedInAt: null,
        session: { id: 's1', status: SessionStatus.SCHEDULED },
      });

      prismaMock.attendance.update.mockResolvedValue({
        id: 'att1',
        status: AttendanceStatus.PRESENT,
      });

      const result = await attendanceService.updateAttendance(
        'att1',
        'admin1',
        {
          status: AttendanceStatus.PRESENT,
          reason: 'Học sinh vào muộn có phép',
        },
      );

      expect(result.statusChanged).toBe(true);
      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.attendanceChangeLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            attendanceId: 'att1',
            oldStatus: AttendanceStatus.ABSENT,
            newStatus: AttendanceStatus.PRESENT,
            changedById: 'admin1',
            reason: 'Học sinh vào muộn có phép',
          }),
        }),
      );
    });

    it('chặn cập nhật điểm danh nếu session đã CANCELLED', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue({
        id: 'att1',
        session: { id: 's1', status: SessionStatus.CANCELLED },
      });

      await expect(
        attendanceService.updateAttendance('att1', 'admin1', {
          status: AttendanceStatus.PRESENT,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('ném NotFoundException nếu bản ghi điểm danh không tồn tại', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue(null);

      await expect(
        attendanceService.updateAttendance('att999', 'admin1', {
          status: AttendanceStatus.PRESENT,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('chặn đánh dấu vắng (ABSENT) khi buổi học đang diễn ra (LIVE / IN_PROGRESS)', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue({
        id: 'att1',
        status: AttendanceStatus.PRESENT,
        session: {
          id: 's1',
          status: SessionStatus.IN_PROGRESS,
          endTime: new Date(Date.now() + 3600000),
          class: { teacherId: 't1' },
        },
      });

      await expect(
        attendanceService.updateAttendance('att1', 't1', {
          status: AttendanceStatus.ABSENT,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối giáo viên không phụ trách lớp sửa điểm danh (403)', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue({
        id: 'att1',
        status: AttendanceStatus.PRESENT,
        session: {
          id: 's1',
          status: SessionStatus.COMPLETED,
          endTime: new Date(Date.now() - 3600000),
          class: { teacherId: 't_owner' },
        },
      });

      await expect(
        attendanceService.updateAttendance(
          'att1',
          't_intruder',
          { status: AttendanceStatus.LATE },
          UserRole.TEACHER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('validateTeacherOrAdminAccess', () => {
    it('cho phép ADMIN truy cập bất kỳ buổi học nào', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        class: { id: 'c1', teacherId: 't1' },
      });

      const res = await attendanceService.validateTeacherOrAdminAccess(
        's1',
        'admin1',
        UserRole.ADMIN,
      );
      expect(res.id).toBe('s1');
    });

    it('cho phép TEACHER phụ trách lớp truy cập buổi học của mình', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        class: { id: 'c1', teacherId: 't1' },
      });

      const res = await attendanceService.validateTeacherOrAdminAccess(
        's1',
        't1',
        UserRole.TEACHER,
      );
      expect(res.id).toBe('s1');
    });

    it('từ chối TEACHER không phụ trách lớp (403)', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        class: { id: 'c1', teacherId: 't_owner' },
      });

      await expect(
        attendanceService.validateTeacherOrAdminAccess(
          's1',
          't_other',
          UserRole.TEACHER,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('ném NotFoundException nếu buổi học không tồn tại (404)', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue(null);

      await expect(
        attendanceService.validateTeacherOrAdminAccess(
          's999',
          't1',
          UserRole.TEACHER,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('batchSaveAttendance - Quy tắc không đánh dấu vắng khi buổi học đang diễn ra', () => {
    it('chặn ghi nhận ABSENT trong batch khi buổi học đang diễn ra', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        status: SessionStatus.IN_PROGRESS,
        endTime: new Date(Date.now() + 3600000),
      });

      await expect(
        attendanceService.batchSaveAttendance('s1', 't1', {
          records: [
            { studentId: 'stu1', status: AttendanceStatus.ABSENT },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
