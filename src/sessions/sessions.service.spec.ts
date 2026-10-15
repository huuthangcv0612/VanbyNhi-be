import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import {
  SessionStatus,
  ClassStatus,
  UserRole,
  MemberStatus,
  AttendanceStatus,
} from '../../generated/prisma/client.js';

describe('SessionsService', () => {
  let sessionsService: SessionsService;
  let prismaMock: any;
  let notificationsMock: any;

  beforeEach(() => {
    prismaMock = {
      classSession: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      class: {
        findUnique: vi.fn(),
      },
      lessonRecord: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      enrollment: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      attendance: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
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

    notificationsMock = {
      createNotification: vi.fn().mockResolvedValue({ id: 'notif1' }),
      notifyClassStudents: vi.fn().mockResolvedValue({ count: 1 }),
    };

    sessionsService = new SessionsService(prismaMock, notificationsMock);
  });

  describe('create', () => {
    const baseDto = {
      title: 'Buổi 1: Ôn tập Văn học hiện đại',
      startTime: new Date('2026-10-15T08:00:00Z'),
      endTime: new Date('2026-10-15T10:00:00Z'),
      meetUrl: 'https://meet.google.com/session-url',
    };

    it('tạo buổi học hợp lệ thành công', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        teacherId: 't1',
        status: ClassStatus.ACTIVE,
        defaultMeetUrl: 'https://meet.google.com/class-default',
      });

      prismaMock.classSession.findFirst.mockResolvedValue(null);

      const created = {
        id: 's1',
        ...baseDto,
        status: SessionStatus.SCHEDULED,
        class: {
          id: 'c1',
          name: 'Lớp 12A',
          defaultMeetUrl: 'https://meet.google.com/class-default',
        },
      };
      prismaMock.classSession.create.mockResolvedValue(created);

      const result = await sessionsService.create('c1', 'admin1', baseDto);

      expect(result.session.id).toBe('s1');
      expect(result.session.effectiveMeetUrl).toBe(
        'https://meet.google.com/session-url',
      );
    });

    it('ném NotFoundException nếu lớp không tồn tại', async () => {
      prismaMock.class.findUnique.mockResolvedValue(null);

      await expect(
        sessionsService.create('c999', 'admin1', baseDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('ném BadRequestException nếu lớp không ở trạng thái ACTIVE', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        status: ClassStatus.COMPLETED,
      });

      await expect(
        sessionsService.create('c1', 'admin1', baseDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('ném BadRequestException nếu endTime <= startTime', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        status: ClassStatus.ACTIVE,
      });

      const invalidTimeDto = {
        ...baseDto,
        startTime: new Date('2026-10-15T10:00:00Z'),
        endTime: new Date('2026-10-15T08:00:00Z'),
      };

      await expect(
        sessionsService.create('c1', 'admin1', invalidTimeDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('ném ConflictException nếu giáo viên bị trùng lịch dạy', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        teacherId: 't1',
        status: ClassStatus.ACTIVE,
      });

      prismaMock.classSession.findFirst.mockResolvedValue({
        id: 's_other',
        class: { name: 'Lớp 11B' },
      });

      await expect(
        sessionsService.create('c1', 'admin1', baseDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByClass & fallback Meet URL', () => {
    it('sử dụng defaultMeetUrl của lớp nếu session không có meetUrl', async () => {
      prismaMock.class.findUnique.mockResolvedValue({ id: 'c1' });

      prismaMock.classSession.findMany.mockResolvedValue([
        {
          id: 's1',
          meetUrl: null,
          class: {
            id: 'c1',
            name: 'Lớp 12A',
            defaultMeetUrl: 'https://meet.google.com/class-default',
          },
        },
      ]);
      prismaMock.classSession.count.mockResolvedValue(1);

      const result = await sessionsService.findByClass('c1', {
        page: 1,
        limit: 10,
      });

      expect(result.items[0].effectiveMeetUrl).toBe(
        'https://meet.google.com/class-default',
      );
    });
  });

  describe('findOne', () => {
    it('trả về chi tiết buổi học và effectiveMeetUrl', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        meetUrl: 'https://meet.google.com/session-specific',
        class: {
          defaultMeetUrl: 'https://meet.google.com/class-default',
        },
      });

      const result = await sessionsService.findOne('s1');
      expect(result.effectiveMeetUrl).toBe(
        'https://meet.google.com/session-specific',
      );
    });

    it('ném NotFoundException nếu buổi học không tồn tại', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue(null);

      await expect(sessionsService.findOne('s999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('cập nhật buổi học mà không làm thay đổi defaultMeetUrl của lớp', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        startTime: new Date('2026-10-15T08:00:00Z'),
        endTime: new Date('2026-10-15T10:00:00Z'),
        class: {
          teacherId: 't1',
          defaultMeetUrl: 'https://meet.google.com/class-default',
        },
      });

      prismaMock.classSession.update.mockResolvedValue({
        id: 's1',
        title: 'Tiêu đề cập nhật',
        meetUrl: 'https://meet.google.com/new-session-url',
        class: {
          defaultMeetUrl: 'https://meet.google.com/class-default',
        },
      });

      const result = await sessionsService.update('s1', {
        title: 'Tiêu đề cập nhật',
        meetUrl: 'https://meet.google.com/new-session-url',
      });

      expect(result.session.title).toBe('Tiêu đề cập nhật');
      expect(result.session.effectiveMeetUrl).toBe(
        'https://meet.google.com/new-session-url',
      );
      expect(prismaMock.classSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Tiêu đề cập nhật',
            meetUrl: 'https://meet.google.com/new-session-url',
          }),
        }),
      );
    });

    it('ném ConflictException nếu cập nhật giờ làm trùng lịch giáo viên', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        startTime: new Date('2026-10-15T08:00:00Z'),
        endTime: new Date('2026-10-15T10:00:00Z'),
        class: { teacherId: 't1' },
      });

      prismaMock.classSession.findFirst.mockResolvedValue({
        id: 's_conflict',
        class: { name: 'Lớp 11A' },
      });

      await expect(
        sessionsService.update('s1', {
          startTime: new Date('2026-10-15T09:00:00Z'),
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStatus', () => {
    it('cập nhật trạng thái buổi học thành công', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        class: { defaultMeetUrl: null },
      });

      prismaMock.classSession.update.mockResolvedValue({
        id: 's1',
        status: SessionStatus.COMPLETED,
        class: { defaultMeetUrl: null },
      });

      const result = await sessionsService.updateStatus('s1', {
        status: SessionStatus.COMPLETED,
      });

      expect(result.session.status).toBe(SessionStatus.COMPLETED);
    });
  });

  describe('LessonRecord (upsert & get)', () => {
    it('ném NotFoundException khi getLessonRecord trên session không tồn tại', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue(null);

      await expect(sessionsService.getLessonRecord('s999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('ném NotFoundException khi session chưa có lessonRecord', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({ id: 's1' });
      prismaMock.lessonRecord.findUnique.mockResolvedValue(null);

      await expect(sessionsService.getLessonRecord('s1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('upsert tạo mới hoặc cập nhật LessonRecord mà không tạo bản ghi trùng lặp', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({ id: 's1' });

      const mockRecord = {
        id: 'lr1',
        sessionId: 's1',
        content: 'Bài giảng Chiếc thuyền ngoài xa',
        homeworkSummary: 'Làm đề số 1',
        teacherNotes: 'Lớp học chăm chỉ',
      };

      prismaMock.lessonRecord.upsert.mockResolvedValue(mockRecord);

      const result = await sessionsService.upsertLessonRecord('s1', {
        content: 'Bài giảng Chiếc thuyền ngoài xa',
        homeworkSummary: 'Làm đề số 1',
        teacherNotes: 'Lớp học chăm chỉ',
      });

      expect(result.lessonRecord).toEqual(mockRecord);
      expect(prismaMock.lessonRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { sessionId: 's1' },
          create: expect.objectContaining({
            sessionId: 's1',
            content: 'Bài giảng Chiếc thuyền ngoài xa',
          }),
          update: expect.objectContaining({
            content: 'Bài giảng Chiếc thuyền ngoài xa',
          }),
        }),
      );
    });
  });

  describe('startSession & endSession (Giáo viên bắt đầu / kết thúc buổi học)', () => {
    it('giáo viên phụ trách bắt đầu buổi học thành công (LIVE)', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        title: 'Buổi 1',
        status: SessionStatus.SCHEDULED,
        class: { id: 'c1', name: 'Lớp 12A', teacherId: 't1', defaultMeetUrl: null },
      });

      prismaMock.classSession.update.mockResolvedValue({
        id: 's1',
        status: SessionStatus.IN_PROGRESS,
        class: { defaultMeetUrl: null },
      });

      const res = await sessionsService.startSession('s1', 't1', UserRole.TEACHER);
      expect(res.session.status).toBe(SessionStatus.IN_PROGRESS);
      expect(notificationsMock.notifyClassStudents).toHaveBeenCalled();
    });

    it('từ chối giáo viên không phụ trách lớp bắt đầu buổi học (403)', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        status: SessionStatus.SCHEDULED,
        class: { id: 'c1', teacherId: 't_owner' },
      });

      await expect(
        sessionsService.startSession('s1', 't_other', UserRole.TEACHER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('từ chối bắt đầu buổi học đã bị CANCELLED hoặc COMPLETED (400)', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        status: SessionStatus.CANCELLED,
        class: { id: 'c1', teacherId: 't1' },
      });

      await expect(
        sessionsService.startSession('s1', 't1', UserRole.TEACHER),
      ).rejects.toThrow(BadRequestException);
    });

    it('giáo viên phụ trách kết thúc buổi học thành công (COMPLETED)', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        status: SessionStatus.IN_PROGRESS,
        class: { id: 'c1', teacherId: 't1', defaultMeetUrl: null },
      });

      prismaMock.classSession.update.mockResolvedValue({
        id: 's1',
        status: SessionStatus.COMPLETED,
        class: { defaultMeetUrl: null },
      });

      const res = await sessionsService.endSession('s1', 't1', UserRole.TEACHER);
      expect(res.session.status).toBe(SessionStatus.COMPLETED);
    });

    it('từ chối giáo viên không phụ trách kết thúc buổi học (403)', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        status: SessionStatus.IN_PROGRESS,
        class: { id: 'c1', teacherId: 't_owner' },
      });

      await expect(
        sessionsService.endSession('s1', 't_other', UserRole.TEACHER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getStudentClassSessions (Học sinh xem danh sách buổi học)', () => {
    it('chặn học sinh không phải ACTIVE trong lớp (403)', async () => {
      prismaMock.enrollment.findFirst.mockResolvedValue(null);

      await expect(
        sessionsService.getStudentClassSessions('stu1', 'c1', {}),
      ).rejects.toThrow(ForbiddenException);
    });

    it('trả về danh sách buổi học và ẩn meetUrl nếu chưa đến giờ mở phòng', async () => {
      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'mem1',
        status: MemberStatus.ACTIVE,
      });

      // Buổi học diễn ra vào ngày mai
      const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const futureEnd = new Date(futureStart.getTime() + 2 * 60 * 60 * 1000);

      prismaMock.classSession.findMany.mockResolvedValue([
        {
          id: 's_future',
          title: 'Buổi tương lai',
          description: 'Nội dung',
          startTime: futureStart,
          endTime: futureEnd,
          status: SessionStatus.SCHEDULED,
          meetUrl: 'https://meet.google.com/secret-url',
          class: { id: 'c1', name: 'Lớp 12A', defaultMeetUrl: null },
          lessonRecord: null,
          materials: [],
          assignments: [],
          attendances: [],
        },
      ]);
      prismaMock.classSession.count.mockResolvedValue(1);

      const res = await sessionsService.getStudentClassSessions('stu1', 'c1', {});
      expect(res.items).toHaveLength(1);
      expect(res.items[0].canJoinMeet).toBe(false);
      // meetUrl phải là null để bảo mật
      expect(res.items[0].meetUrl).toBeNull();
      expect(res.items[0].joinWindow.isOpen).toBe(false);
    });
  });

  describe('getStudentSessionDetail', () => {
    it('trả về chi tiết buổi học kèm thông tin tài liệu và điểm danh cá nhân', async () => {
      const now = new Date();
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        title: 'Buổi 1',
        startTime: now,
        endTime: new Date(now.getTime() + 3600000),
        status: SessionStatus.IN_PROGRESS,
        meetUrl: 'https://meet.google.com/live-url',
        class: {
          id: 'c1',
          name: 'Lớp 12A',
          teacher: { id: 't1', fullName: 'Thầy Giáo' },
        },
        lessonRecord: { content: 'Nội dung bài học' },
        materials: [{ id: 'm1', title: 'Đề cương' }],
        assignments: [],
        attendances: [{ id: 'att1', status: AttendanceStatus.PRESENT }],
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'mem1',
        status: MemberStatus.ACTIVE,
      });

      const res = await sessionsService.getStudentSessionDetail('stu1', 's1');
      expect(res.id).toBe('s1');
      expect(res.meetAccess.canJoin).toBe(true);
      expect(res.meetAccess.meetUrl).toBe('https://meet.google.com/live-url');
      expect(res.myAttendance?.status).toBe(AttendanceStatus.PRESENT);
      expect(res.materials).toHaveLength(1);
    });
  });

  describe('getMeetJoinUrl (Học sinh xin link Meet có kiểm tra quyền)', () => {
    it('cho phép lấy link khi buổi học đang LIVE', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        title: 'Buổi 1',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        status: SessionStatus.IN_PROGRESS,
        meetUrl: 'https://meet.google.com/live-url',
        class: { id: 'c1', name: 'Lớp 12A' },
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        status: MemberStatus.ACTIVE,
      });

      const res = await sessionsService.getMeetJoinUrl('stu1', 's1');
      expect(res.canJoin).toBe(true);
      expect(res.meetUrl).toBe('https://meet.google.com/live-url');
    });

    it('từ chối cấp link nếu chưa đến cửa sổ 15 phút (403)', async () => {
      const futureTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        startTime: futureTime,
        endTime: new Date(futureTime.getTime() + 3600000),
        status: SessionStatus.SCHEDULED,
        meetUrl: 'https://meet.google.com/test-url',
        class: { id: 'c1', name: 'Lớp 12A' },
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        status: MemberStatus.ACTIVE,
      });

      await expect(
        sessionsService.getMeetJoinUrl('stu1', 's1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('studentCheckIn (Học sinh tự điểm danh)', () => {
    it('điểm danh đúng giờ (PRESENT) khi check-in trong vòng 15 phút đầu', async () => {
      const now = new Date();
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        startTime: now,
        endTime: new Date(now.getTime() + 3600000),
        status: SessionStatus.IN_PROGRESS,
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        status: MemberStatus.ACTIVE,
      });

      prismaMock.attendance.findUnique.mockResolvedValue(null);
      prismaMock.attendance.create.mockResolvedValue({
        id: 'att1',
        sessionId: 's1',
        studentId: 'stu1',
        status: AttendanceStatus.PRESENT,
      });

      const res = await sessionsService.studentCheckIn('stu1', 's1', {
        note: 'Có mặt đúng giờ',
      });

      expect(res.alreadyCheckedIn).toBe(false);
      expect(res.attendance.status).toBe(AttendanceStatus.PRESENT);
      expect(prismaMock.attendance.create).toHaveBeenCalled();
    });

    it('điểm danh muộn (LATE) khi check-in sau 15 phút kể từ startTime', async () => {
      // Buổi học bắt đầu cách đây 30 phút
      const startTime = new Date(Date.now() - 30 * 60 * 1000);
      const endTime = new Date(Date.now() + 60 * 60 * 1000);

      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        startTime,
        endTime,
        status: SessionStatus.IN_PROGRESS,
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        status: MemberStatus.ACTIVE,
      });

      prismaMock.attendance.findUnique.mockResolvedValue(null);
      prismaMock.attendance.create.mockResolvedValue({
        id: 'att1',
        sessionId: 's1',
        studentId: 'stu1',
        status: AttendanceStatus.LATE,
      });

      const res = await sessionsService.studentCheckIn('stu1', 's1');
      expect(res.attendance.status).toBe(AttendanceStatus.LATE);
    });

    it('ngăn chặn điểm danh trùng lặp (trả về trạng thái đã có)', async () => {
      const now = new Date();
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        startTime: now,
        endTime: new Date(now.getTime() + 3600000),
        status: SessionStatus.IN_PROGRESS,
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        status: MemberStatus.ACTIVE,
      });

      prismaMock.attendance.findUnique.mockResolvedValue({
        id: 'att_existing',
        sessionId: 's1',
        studentId: 'stu1',
        status: AttendanceStatus.PRESENT,
      });

      const res = await sessionsService.studentCheckIn('stu1', 's1');
      expect(res.alreadyCheckedIn).toBe(true);
      expect(prismaMock.attendance.create).not.toHaveBeenCalled();
    });
  });
});
