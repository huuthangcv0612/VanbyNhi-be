import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service.js';
import {
  AttendanceStatus,
  AttendanceSessionStatus,
  CorrectionRequestStatus,
  SessionStatus,
  MemberStatus,
  UserRole,
} from '../../generated/prisma/client.js';

describe('AttendanceService', () => {
  let attendanceService: AttendanceService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      class: {
        findUnique: vi.fn(),
      },
      classSession: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      enrollment: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        count: vi.fn(),
      },
      attendance: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        groupBy: vi.fn(),
        count: vi.fn(),
      },
      attendanceSession: {
        upsert: vi.fn(),
        findUnique: vi.fn(),
      },
      attendanceChangeLog: {
        create: vi.fn(),
      },
      attendanceCorrectionRequest: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      monthlyAttendanceSummary: {
        findMany: vi.fn(),
        upsert: vi.fn(),
        count: vi.fn(),
      },
      classAttendanceConfig: {
        findUnique: vi.fn(),
        create: vi.fn(),
        upsert: vi.fn(),
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

  describe('AttendanceSession lifecycle (Open, Draft, Close)', () => {
    it('mở phiên điểm danh thành công với trạng thái OPEN', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        status: SessionStatus.SCHEDULED,
      });

      prismaMock.attendanceSession.upsert.mockResolvedValue({
        id: 'as1',
        sessionId: 's1',
        classId: 'c1',
        status: AttendanceSessionStatus.OPEN,
      });

      const res = await attendanceService.openAttendanceSession('s1', 't1');
      expect(res.attendanceSession.status).toBe(AttendanceSessionStatus.OPEN);
      expect(prismaMock.attendanceSession.upsert).toHaveBeenCalled();
    });

    it('chặn mở điểm danh nếu buổi học đã CANCELLED', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        status: SessionStatus.CANCELLED,
      });

      await expect(
        attendanceService.openAttendanceSession('s1', 't1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('chốt điểm danh phiên học (CLOSED) thành công', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
      });

      prismaMock.attendanceSession.upsert.mockResolvedValue({
        id: 'as1',
        sessionId: 's1',
        status: AttendanceSessionStatus.CLOSED,
        closedAt: new Date(),
        closedById: 't1',
      });

      const res = await attendanceService.closeAttendanceSession('s1', 't1', {
        note: 'Đã hoàn tất kiểm diện',
      });
      expect(res.attendanceSession.status).toBe(AttendanceSessionStatus.CLOSED);
    });

    it('chặn lưu bản nháp nếu phiên điểm danh đã CLOSED', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        attendanceSession: { status: AttendanceSessionStatus.CLOSED },
      });

      await expect(
        attendanceService.saveDraftAttendance('s1', 't1', {
          records: [{ studentId: 'stu1', status: AttendanceStatus.PRESENT }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('markAllPresent', () => {
    it('đánh dấu tất cả học sinh là PRESENT và ghi change log nếu có thay đổi', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        status: SessionStatus.COMPLETED,
        attendanceSession: { status: AttendanceSessionStatus.OPEN },
      });

      prismaMock.enrollment.findMany.mockResolvedValue([
        { studentId: 'stu1' },
        { studentId: 'stu2' },
      ]);

      prismaMock.attendance.findMany.mockResolvedValue([
        { id: 'att1', studentId: 'stu1', status: AttendanceStatus.NOT_MARKED },
      ]);

      const res = await attendanceService.markAllPresent('s1', 't1', {
        note: 'Có mặt đầy đủ',
        overrideExisting: true,
      });

      expect(res.count).toBe(2);
      expect(prismaMock.attendance.create).toHaveBeenCalled();
      expect(prismaMock.attendance.update).toHaveBeenCalled();
      expect(prismaMock.attendanceChangeLog.create).toHaveBeenCalled();
    });
  });

  describe('AttendanceCorrectionRequest (Quy trình điều chỉnh điểm danh)', () => {
    it('học sinh gửi yêu cầu điều chỉnh thành công', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue({
        id: 'att1',
        studentId: 'stu1',
      });
      prismaMock.attendanceCorrectionRequest.findFirst.mockResolvedValue(null);
      prismaMock.attendanceCorrectionRequest.create.mockResolvedValue({
        id: 'cr1',
        attendanceId: 'att1',
        studentId: 'stu1',
        requestedStatus: AttendanceStatus.PRESENT,
        status: CorrectionRequestStatus.PENDING,
      });

      const res = await attendanceService.createStudentCorrectionRequest(
        'stu1',
        {
          attendanceId: 'att1',
          requestedStatus: AttendanceStatus.PRESENT,
          reason: 'Em có mặt nhưng do camera lỗi',
        },
      );

      expect(res.request.status).toBe(CorrectionRequestStatus.PENDING);
    });

    it('chống IDOR: học sinh không thể gửi yêu cầu cho bản ghi của học sinh khác', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue({
        id: 'att1',
        studentId: 'other_student',
      });

      await expect(
        attendanceService.createStudentCorrectionRequest('stu1', {
          attendanceId: 'att1',
          requestedStatus: AttendanceStatus.PRESENT,
          reason: 'Xin sửa',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('chống gửi trùng: ném ConflictException nếu đã có yêu cầu PENDING', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue({
        id: 'att1',
        studentId: 'stu1',
      });
      prismaMock.attendanceCorrectionRequest.findFirst.mockResolvedValue({
        id: 'cr_pending',
        status: CorrectionRequestStatus.PENDING,
      });

      await expect(
        attendanceService.createStudentCorrectionRequest('stu1', {
          attendanceId: 'att1',
          requestedStatus: AttendanceStatus.PRESENT,
          reason: 'Gửi lại',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('giáo viên phụ trách duyệt (APPROVED) yêu cầu trong transaction và ghi change log', async () => {
      prismaMock.attendanceCorrectionRequest.findUnique.mockResolvedValue({
        id: 'cr1',
        attendanceId: 'att1',
        requestedStatus: AttendanceStatus.PRESENT,
        reason: 'Lỗi mạng',
        status: CorrectionRequestStatus.PENDING,
        attendance: {
          id: 'att1',
          status: AttendanceStatus.UNEXCUSED_ABSENT,
          checkedInAt: null,
          session: {
            class: { teacherId: 't1', id: 'c1' },
          },
        },
      });

      prismaMock.attendanceCorrectionRequest.update.mockResolvedValue({
        id: 'cr1',
        status: CorrectionRequestStatus.APPROVED,
      });

      const res = await attendanceService.reviewCorrectionRequest(
        'cr1',
        't1',
        UserRole.TEACHER,
        {
          status: CorrectionRequestStatus.APPROVED,
          reviewNote: 'Đã xác nhận minh chứng',
        },
      );

      expect(res.request.status).toBe(CorrectionRequestStatus.APPROVED);
      expect(prismaMock.attendance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'att1' },
          data: expect.objectContaining({ status: AttendanceStatus.PRESENT }),
        }),
      );
      expect(prismaMock.attendanceChangeLog.create).toHaveBeenCalled();
    });

    it('từ chối (REJECTED) yêu cầu bắt buộc phải có reviewNote', async () => {
      prismaMock.attendanceCorrectionRequest.findUnique.mockResolvedValue({
        id: 'cr1',
        attendanceId: 'att1',
        status: CorrectionRequestStatus.PENDING,
        attendance: {
          session: { class: { teacherId: 't1', id: 'c1' } },
        },
      });

      await expect(
        attendanceService.reviewCorrectionRequest(
          'cr1',
          't1',
          UserRole.TEACHER,
          {
            status: CorrectionRequestStatus.REJECTED,
            reviewNote: '',
          },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('chặn giáo viên không phụ trách lớp xử lý yêu cầu (IDOR)', async () => {
      prismaMock.attendanceCorrectionRequest.findUnique.mockResolvedValue({
        id: 'cr1',
        status: CorrectionRequestStatus.PENDING,
        attendance: {
          session: { class: { teacherId: 'other_teacher', id: 'c1' } },
        },
      });

      await expect(
        attendanceService.reviewCorrectionRequest(
          'cr1',
          't1',
          UserRole.TEACHER,
          {
            status: CorrectionRequestStatus.APPROVED,
          },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('MonthlyAttendanceSummary (Chốt học phí và snapshot độc lập)', () => {
    it('chốt tháng thành công, lưu snapshot độc lập không phụ thuộc dữ liệu chi tiết', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        name: 'Lớp Toán 12',
        monthlyTuition: 1000000,
        attendanceConfig: {
          chargePresent: true,
          chargeLate: true,
          chargeExcusedAbsent: false,
          chargeUnexcusedAbsent: false,
        },
      });

      prismaMock.enrollment.findMany.mockResolvedValue([
        { id: 'enr1', studentId: 'stu1', tuitionOverride: null },
      ]);

      prismaMock.classSession.findMany.mockResolvedValue([
        {
          id: 's1',
          attendances: [{ studentId: 'stu1', status: AttendanceStatus.PRESENT }],
        },
        {
          id: 's2',
          attendances: [{ studentId: 'stu1', status: AttendanceStatus.LATE }],
        },
      ]);

      prismaMock.monthlyAttendanceSummary.upsert.mockResolvedValue({
        id: 'sum1',
        classId: 'c1',
        studentId: 'stu1',
        billingYear: 2026,
        billingMonth: 10,
        totalSessions: 2,
        presentCount: 1,
        lateCount: 1,
        chargeableSessions: 2,
        isClosed: true,
      });

      const res = await attendanceService.closeMonthlySummary('c1', 't1', {
        billingYear: 2026,
        billingMonth: 10,
      });

      expect(res.count).toBe(1);
      expect(prismaMock.monthlyAttendanceSummary.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            isClosed: true,
            chargeableSessions: 2,
            presentCount: 1,
            lateCount: 1,
          }),
        }),
      );
    });
  });

  describe('Student Attendance Access (Bảo mật học sinh)', () => {
    it('học sinh chỉ xem dữ liệu của chính mình', async () => {
      prismaMock.attendance.findMany.mockResolvedValue([]);
      prismaMock.attendance.count.mockResolvedValue(0);

      const res = await attendanceService.getStudentAttendanceHistory('stu1', {
        page: 1,
        limit: 10,
      });

      expect(prismaMock.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ studentId: 'stu1' }),
        }),
      );
      expect(res.items).toEqual([]);
    });

    it('chặn học sinh truy cập lớp mình không tham gia', async () => {
      prismaMock.enrollment.findFirst.mockResolvedValue(null);

      await expect(
        attendanceService.getStudentAttendanceHistory('stu1', {
          classId: 'class_not_enrolled',
          page: 1,
          limit: 10,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Transaction Rollback', () => {
    it('rollback transaction khi có lỗi xảy ra trong batchSave', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        status: SessionStatus.COMPLETED,
        attendanceSession: { status: AttendanceSessionStatus.OPEN },
      });

      prismaMock.enrollment.findMany.mockResolvedValue([
        { studentId: 'stu1' },
      ]);

      prismaMock.$transaction.mockRejectedValueOnce(
        new Error('Database lock deadlock'),
      );

      await expect(
        attendanceService.batchSaveAttendance('s1', 't1', {
          records: [{ studentId: 'stu1', status: AttendanceStatus.PRESENT }],
        }),
      ).rejects.toThrow('Database lock deadlock');
    });
  });
});

