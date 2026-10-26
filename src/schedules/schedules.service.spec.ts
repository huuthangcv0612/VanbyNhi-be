import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service.js';
import {
  UserRole,
  ScheduleStatus,
  MeetingType,
  CalendarNotificationStatus,
} from '../../generated/prisma/client.js';
import { ScheduleRecurrence } from './utils/recurrence.util.js';

describe('SchedulesService', () => {
  let service: SchedulesService;
  let prismaMock: any;
  let notificationsServiceMock: any;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-15T00:00:00.000Z'));

    prismaMock = {
      teacherCalendarEvent: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      teacherCalendarLabel: {
        findUnique: vi.fn(),
      },
      class: {
        findUnique: vi.fn(),
      },
      calendarEventParticipant: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        createMany: vi.fn(),
        deleteMany: vi.fn(),
      },
      calendarNotification: {
        createMany: vi.fn(),
        updateMany: vi.fn(),
      },
      notification: {
        createMany: vi.fn(),
      },
      enrollment: {
        findMany: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(prismaMock)),
    };

    notificationsServiceMock = {
      createNotification: vi.fn(),
    };

    service = new SchedulesService(prismaMock, notificationsServiceMock);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // =========================================================================
  // CREATE SCHEDULE
  // =========================================================================
  describe('createSchedule', () => {
    const validDto = {
      title: 'Luyện đề tốt nghiệp THPT',
      description: 'Chuyên đề ôn tập phần đọc hiểu',
      startAt: '2026-10-20T08:00:00.000Z',
      endAt: '2026-10-20T10:00:00.000Z',
      timezone: 'Asia/Ho_Chi_Minh',
      meetingType: MeetingType.ONLINE_MEET,
      meetingUrl: 'https://meet.google.com/abc-xyz',
      location: 'Phòng học trực tuyến',
      reminderMinutes: 30,
    };

    it('Tạo lịch học cho học sinh cụ thể thành công', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        { id: 'student-1', fullName: 'Học sinh 1', role: UserRole.STUDENT, isActive: true },
      ]);
      prismaMock.teacherCalendarEvent.findMany.mockResolvedValue([]); // không xung đột
      prismaMock.teacherCalendarEvent.create.mockResolvedValue({ id: 'schedule-1' });
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'schedule-1',
        title: validDto.title,
        teacherId: 'teacher-1',
        startAt: new Date(validDto.startAt),
        endAt: new Date(validDto.endAt),
        status: ScheduleStatus.SCHEDULED,
        participants: [{ studentId: 'student-1' }],
      });

      const result = await service.createSchedule('teacher-1', {
        ...validDto,
        studentIds: ['student-1'],
      });

      expect(result.message).toBe('Tạo lịch học thành công');
      expect(result.schedule.id).toBe('schedule-1');
      expect(result.hasConflict).toBe(false);
      expect(prismaMock.calendarEventParticipant.createMany).toHaveBeenCalledWith({
        data: [{ eventId: 'schedule-1', studentId: 'student-1' }],
      });
      expect(prismaMock.calendarNotification.createMany).toHaveBeenCalled();
    });

    it('Tạo lịch học cho một lớp thành công khi giáo viên là chủ nhiệm/phụ trách lớp', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-1',
        teacherId: 'teacher-1',
      });
      prismaMock.teacherCalendarEvent.findMany.mockResolvedValue([]);
      prismaMock.teacherCalendarEvent.create.mockResolvedValue({ id: 'schedule-2' });
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'schedule-2',
        title: validDto.title,
        classId: 'class-1',
        status: ScheduleStatus.SCHEDULED,
      });
      prismaMock.enrollment.findMany.mockResolvedValue([
        { studentId: 'student-1' },
        { studentId: 'student-2' },
      ]);

      const result = await service.createSchedule('teacher-1', {
        ...validDto,
        classId: 'class-1',
      });

      expect(result.schedule.id).toBe('schedule-2');
      expect(prismaMock.class.findUnique).toHaveBeenCalledWith({ where: { id: 'class-1' } });
    });

    it('Ném lỗi BadRequestException nếu startAt >= endAt', async () => {
      await expect(
        service.createSchedule('teacher-1', {
          ...validDto,
          startAt: '2026-10-20T10:00:00.000Z',
          endAt: '2026-10-20T08:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Ném lỗi NotFoundException nếu classId không tồn tại', async () => {
      prismaMock.class.findUnique.mockResolvedValue(null);

      await expect(
        service.createSchedule('teacher-1', {
          ...validDto,
          classId: 'class-not-found',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('Ném lỗi ForbiddenException nếu giáo viên không sở hữu lớp học', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-1',
        teacherId: 'other-teacher',
      });

      await expect(
        service.createSchedule('teacher-1', {
          ...validDto,
          classId: 'class-1',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Ném lỗi BadRequestException nếu học sinh được chỉ định không tồn tại', async () => {
      prismaMock.user.findMany.mockResolvedValue([]); // không tìm thấy học sinh nào

      await expect(
        service.createSchedule('teacher-1', {
          ...validDto,
          studentIds: ['non-existent-student'],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Ném lỗi BadRequestException nếu học sinh bị vô hiệu hóa (isActive = false)', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        { id: 'student-inactive', fullName: 'Học sinh khóa', role: UserRole.STUDENT, isActive: false },
      ]);

      await expect(
        service.createSchedule('teacher-1', {
          ...validDto,
          studentIds: ['student-inactive'],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Ném lỗi BadRequestException nếu người dùng không có vai trò STUDENT', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        { id: 'teacher-2', fullName: 'Đồng nghiệp', role: UserRole.TEACHER, isActive: true },
      ]);

      await expect(
        service.createSchedule('teacher-1', {
          ...validDto,
          studentIds: ['teacher-2'],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Phát hiện và cảnh báo khi giáo viên có lịch trùng giờ', async () => {
      prismaMock.teacherCalendarEvent.findMany.mockResolvedValue([
        {
          id: 'conflict-1',
          title: 'Ca trùng giờ',
          startAt: new Date('2026-10-20T08:30:00Z'),
          endAt: new Date('2026-10-20T09:30:00Z'),
        },
      ]);
      prismaMock.teacherCalendarEvent.create.mockResolvedValue({ id: 'schedule-3' });
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'schedule-3',
        title: validDto.title,
        status: ScheduleStatus.SCHEDULED,
      });

      const result = await service.createSchedule('teacher-1', validDto);

      expect(result.hasConflict).toBe(true);
      expect(result.conflicts).toHaveLength(1);
    });

    it('Tạo chuỗi lịch lặp lại hàng tuần trong một tháng thành công (5 buổi độc lập)', async () => {
      // 27/10/2026 thứ Ba -> tạo 5 buổi: 27/10, 03/11, 10/11, 17/11, 24/11
      const recurringDto = {
        title: 'Chuyên đề ôn thi Đại học hàng tuần',
        startAt: '2026-10-27T08:00:00.000Z',
        endAt: '2026-10-27T10:00:00.000Z',
        timezone: 'Asia/Ho_Chi_Minh',
        meetingType: MeetingType.ONLINE_MEET,
        meetingUrl: 'https://meet.google.com/rep-123',
        location: 'Phòng học trực tuyến',
        recurrence: ScheduleRecurrence.WEEKLY_FOR_MONTH,
      };

      prismaMock.teacherCalendarEvent.findMany.mockResolvedValue([]); // không xung đột
      let createdCounter = 0;
      prismaMock.teacherCalendarEvent.create.mockImplementation(() => {
        createdCounter++;
        return Promise.resolve({ id: `rec-schedule-${createdCounter}` });
      });
      prismaMock.teacherCalendarEvent.findUnique.mockImplementation(({ where }: any) => {
        return Promise.resolve({
          id: where.id,
          title: recurringDto.title,
          teacherId: 'teacher-1',
          startAt: new Date(recurringDto.startAt),
          endAt: new Date(recurringDto.endAt),
          status: ScheduleStatus.SCHEDULED,
        });
      });

      const result = await service.createSchedule('teacher-1', recurringDto);

      expect(result.message).toBe('Tạo chuỗi lịch học lặp lại thành công');
      expect(result.totalOccurrences).toBe(5);
      expect(result.schedules).toHaveLength(5);
      expect(result.schedule.id).toBe('rec-schedule-1');
      expect(result.hasConflict).toBe(false);
      expect(prismaMock.teacherCalendarEvent.create).toHaveBeenCalledTimes(5);
    });

    it('Tạo chuỗi lịch lặp lại hàng tuần: phát hiện xung đột của bất kỳ buổi nào', async () => {
      const recurringDto = {
        title: 'Lớp bồi dưỡng học sinh giỏi',
        startAt: '2026-10-27T08:00:00.000Z',
        endAt: '2026-10-27T10:00:00.000Z',
        timezone: 'Asia/Ho_Chi_Minh',
        recurrence: ScheduleRecurrence.WEEKLY_FOR_MONTH,
      };

      // Giả lập xung đột ở buổi thứ 2
      prismaMock.teacherCalendarEvent.findMany.mockResolvedValue([
        {
          id: 'conflict-event-1',
          title: 'Ca dạy trùng',
          startAt: new Date('2026-11-03T08:00:00.000Z'),
          endAt: new Date('2026-11-03T10:00:00.000Z'),
        },
      ]);
      prismaMock.teacherCalendarEvent.create.mockResolvedValue({ id: 's-conflict' });
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 's-conflict',
        title: recurringDto.title,
        startAt: new Date(recurringDto.startAt),
        endAt: new Date(recurringDto.endAt),
        status: ScheduleStatus.SCHEDULED,
      });

      const result = await service.createSchedule('teacher-1', recurringDto);

      expect(result.hasConflict).toBe(true);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].id).toBe('conflict-event-1');
    });

    it('Tạo chuỗi lịch lặp lại: rollback transaction khi có một occurrence bị lỗi DB', async () => {
      const recurringDto = {
        title: 'Lớp học bị lỗi DB',
        startAt: '2026-10-27T08:00:00.000Z',
        endAt: '2026-10-27T10:00:00.000Z',
        timezone: 'Asia/Ho_Chi_Minh',
        recurrence: ScheduleRecurrence.WEEKLY_FOR_MONTH,
      };

      prismaMock.teacherCalendarEvent.findMany.mockResolvedValue([]);
      prismaMock.teacherCalendarEvent.create
        .mockResolvedValueOnce({ id: 'ok-1' })
        .mockRejectedValueOnce(new Error('DB Connection Dropped on second occurrence'));

      await expect(
        service.createSchedule('teacher-1', recurringDto),
      ).rejects.toThrow('DB Connection Dropped on second occurrence');
    });
  });

  // =========================================================================
  // GET TEACHER SCHEDULES
  // =========================================================================
  describe('getTeacherSchedules', () => {
    it('Lấy danh sách lịch học của giáo viên kèm phân trang và lọc', async () => {
      prismaMock.teacherCalendarEvent.findMany.mockResolvedValue([
        { id: 's-1', title: 'Lịch 1', teacherId: 'teacher-1' },
      ]);
      prismaMock.teacherCalendarEvent.count.mockResolvedValue(1);

      const result = await service.getTeacherSchedules('teacher-1', {
        page: 1,
        limit: 10,
        status: ScheduleStatus.SCHEDULED,
      });

      expect(result.total).toBe(1);
      expect(result.schedules).toHaveLength(1);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.totalPages).toBe(1);
    });

    it('Ném lỗi BadRequestException nếu from > to', async () => {
      await expect(
        service.getTeacherSchedules('teacher-1', {
          from: '2026-10-25T00:00:00.000Z',
          to: '2026-10-20T00:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // =========================================================================
  // GET TEACHER SCHEDULE BY ID
  // =========================================================================
  describe('getTeacherScheduleById', () => {
    it('Lấy chi tiết lịch học thành công khi là chủ sở hữu', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 's-1',
        title: 'Chi tiết lịch',
        teacherId: 'teacher-1',
        participants: [],
      });

      const result = await service.getTeacherScheduleById('teacher-1', 's-1');
      expect(result.id).toBe('s-1');
    });

    it('Ném lỗi NotFoundException khi lịch không tồn tại', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue(null);

      await expect(
        service.getTeacherScheduleById('teacher-1', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('Ném lỗi ForbiddenException khi giáo viên không phải người sở hữu', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 's-1',
        teacherId: 'other-teacher',
      });

      await expect(
        service.getTeacherScheduleById('teacher-1', 's-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // =========================================================================
  // UPDATE TEACHER SCHEDULE
  // =========================================================================
  describe('updateTeacherSchedule', () => {
    it('Cập nhật thông tin lịch học thành công', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 's-1',
        teacherId: 'teacher-1',
        title: 'Tiêu đề cũ',
        startAt: new Date('2026-10-20T08:00:00Z'),
        endAt: new Date('2026-10-20T10:00:00Z'),
        reminderMinutes: 15,
        participants: [{ studentId: 'student-1' }],
      });
      prismaMock.teacherCalendarEvent.findMany.mockResolvedValue([]); // không xung đột
      prismaMock.teacherCalendarEvent.update.mockResolvedValue({ id: 's-1' });

      const result = await service.updateTeacherSchedule('teacher-1', 's-1', {
        title: 'Tiêu đề mới',
        meetingUrl: 'https://new-meet.google.com/xyz',
      });

      expect(result.message).toBe('Cập nhật lịch học thành công');
      expect(prismaMock.teacherCalendarEvent.update).toHaveBeenCalled();
    });

    it('Ném lỗi ForbiddenException khi cố sửa lịch của giáo viên khác', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 's-1',
        teacherId: 'other-teacher',
        participants: [],
      });

      await expect(
        service.updateTeacherSchedule('teacher-1', 's-1', { title: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // =========================================================================
  // CANCEL TEACHER SCHEDULE
  // =========================================================================
  describe('cancelTeacherSchedule', () => {
    it('Hủy lịch học thành công, giữ lại bản ghi với trạng thái CANCELLED', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 's-1',
        title: 'Buổi học chuẩn bị hủy',
        teacherId: 'teacher-1',
        startAt: new Date('2026-10-20T08:00:00Z'),
        participants: [{ studentId: 'student-1' }],
      });
      prismaMock.teacherCalendarEvent.update.mockResolvedValue({
        id: 's-1',
        status: ScheduleStatus.CANCELLED,
      });

      const result = await service.cancelTeacherSchedule('teacher-1', 's-1');

      expect(result.message).toBe('Hủy lịch học thành công');
      expect(prismaMock.teacherCalendarEvent.update).toHaveBeenCalledWith({
        where: { id: 's-1' },
        data: { status: ScheduleStatus.CANCELLED },
        include: expect.any(Object),
      });
      expect(prismaMock.calendarNotification.updateMany).toHaveBeenCalledWith({
        where: {
          eventId: 's-1',
          status: CalendarNotificationStatus.PENDING,
        },
        data: {
          status: CalendarNotificationStatus.CANCELLED,
        },
      });
    });

    it('Ném lỗi ForbiddenException khi hủy lịch của giáo viên khác', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 's-1',
        teacherId: 'other-teacher',
        participants: [],
      });

      await expect(
        service.cancelTeacherSchedule('teacher-1', 's-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // =========================================================================
  // STUDENT SCHEDULES
  // =========================================================================
  describe('getStudentSchedules', () => {
    it('Học sinh xem lịch tổng hợp: chỉ trả về các lịch được quyền xem', async () => {
      const mockEvent = {
        id: 's-class-1',
        title: 'Lịch lớp 12A1',
        description: 'Ôn tập học kỳ',
        startAt: new Date('2026-10-20T08:00:00Z'),
        endAt: new Date('2026-10-20T10:00:00Z'),
        timezone: 'Asia/Ho_Chi_Minh',
        meetingType: MeetingType.ONLINE_MEET,
        meetingUrl: 'https://meet.google.com/12a1',
        location: null,
        status: ScheduleStatus.SCHEDULED,
        teacher: { id: 'teacher-1', fullName: 'Thầy Văn', email: 'v@e.com', phone: '0901', avatarUrl: null },
        class: { id: 'class-1', name: 'Lớp 12A1', classCode: 'c-12a1' },
      };

      prismaMock.teacherCalendarEvent.findMany.mockResolvedValue([mockEvent]);
      prismaMock.teacherCalendarEvent.count.mockResolvedValue(1);

      const result = await service.getStudentSchedules('student-1', {
        page: 1,
        limit: 10,
      });

      expect(result.total).toBe(1);
      expect(result.schedules[0].id).toBe('s-class-1');
      // Không để lộ danh sách học sinh khác (participants) cho học sinh
      expect(result.schedules[0].participants).toBeUndefined();
    });

    it('Ném lỗi BadRequestException nếu học sinh truyền from > to', async () => {
      await expect(
        service.getStudentSchedules('student-1', {
          from: '2026-10-25T00:00:00.000Z',
          to: '2026-10-20T00:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // =========================================================================
  // GET STUDENT SCHEDULE BY ID
  // =========================================================================
  describe('getStudentScheduleById', () => {
    it('Học sinh xem chi tiết lịch học được phép truy cập', async () => {
      prismaMock.teacherCalendarEvent.findFirst.mockResolvedValue({
        id: 's-1',
        title: 'Lịch học chi tiết',
        teacher: { id: 'teacher-1', fullName: 'Thầy Văn' },
        class: { id: 'class-1', name: 'Lớp 12A1' },
      });

      const result = await service.getStudentScheduleById('student-1', 's-1');
      expect(result.id).toBe('s-1');
      expect(result.participants).toBeUndefined();
    });

    it('Ném lỗi NotFoundException khi học sinh không có quyền truy cập lịch học', async () => {
      prismaMock.teacherCalendarEvent.findFirst.mockResolvedValue(null);

      await expect(
        service.getStudentScheduleById('student-unauthorized', 's-secret'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
