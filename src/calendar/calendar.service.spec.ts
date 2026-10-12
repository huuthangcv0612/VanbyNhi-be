import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CalendarService } from './calendar.service.js';
import {
  UserRole,
  CalendarNotificationStatus,
} from '../../generated/prisma/client.js';

describe('CalendarService', () => {
  let calendarService: CalendarService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      teacherCalendarEvent: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      teacherCalendarLabel: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      calendarEventParticipant: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        createMany: vi.fn(),
        delete: vi.fn(),
      },
      calendarNotification: {
        createMany: vi.fn(),
        updateMany: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(prismaMock)),
    };

    calendarService = new CalendarService(prismaMock);
  });

  describe('createTeacherEvent', () => {
    const validDto = {
      title: 'Luyện thi THPT Quốc Gia - Nghị luận văn học',
      address: 'Phòng 204, Tòa A',
      meetUrl: 'https://meet.google.com/abc-defg-hij',
      startAt: '2026-10-15T08:00:00.000Z',
      endAt: '2026-10-15T10:00:00.000Z',
      labelId: 'label-1',
      reminderMinutes: 30,
      note: 'Học sinh mang theo tài liệu văn học 12',
      studentIds: ['stu-1', 'stu-2'],
    };

    it('tạo ca dạy hợp lệ thành công đầy đủ thông tin (Meet, label, reminder, note, students)', async () => {
      prismaMock.teacherCalendarLabel.findUnique.mockResolvedValue({
        id: 'label-1',
        teacherId: 'teacher-1',
        name: 'Lớp VIP',
      });

      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'stu-1',
          fullName: 'Nguyễn Văn A',
          role: UserRole.STUDENT,
          isActive: true,
        },
        {
          id: 'stu-2',
          fullName: 'Trần Thị B',
          role: UserRole.STUDENT,
          isActive: true,
        },
      ]);

      prismaMock.teacherCalendarEvent.findMany.mockResolvedValue([]); // Không trùng lịch

      const createdEvent = {
        id: 'event-1',
        ...validDto,
        startAt: new Date(validDto.startAt),
        endAt: new Date(validDto.endAt),
        teacherId: 'teacher-1',
      };
      prismaMock.teacherCalendarEvent.create.mockResolvedValue(createdEvent);
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        ...createdEvent,
        participants: [],
      });

      const result = await calendarService.createTeacherEvent(
        'teacher-1',
        validDto,
      );

      expect(result.message).toBe('Tạo ca dạy thành công');
      expect(result.hasConflict).toBe(false);
      expect(prismaMock.teacherCalendarEvent.create).toHaveBeenCalled();
      expect(
        prismaMock.calendarEventParticipant.createMany,
      ).toHaveBeenCalledWith({
        data: [
          { eventId: 'event-1', studentId: 'stu-1' },
          { eventId: 'event-1', studentId: 'stu-2' },
        ],
      });
      expect(prismaMock.calendarNotification.createMany).toHaveBeenCalled();
    });

    it('tạo ca dạy tối giản thành công (không Meet, label, reminder, note, students)', async () => {
      const minimalDto = {
        title: 'Ca dạy 1-1',
        startAt: '2026-10-15T14:00:00.000Z',
        endAt: '2026-10-15T15:30:00.000Z',
      };

      prismaMock.teacherCalendarEvent.findMany.mockResolvedValue([]);
      prismaMock.teacherCalendarEvent.create.mockResolvedValue({
        id: 'event-min',
        ...minimalDto,
        teacherId: 'teacher-1',
      });
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'event-min',
        ...minimalDto,
        teacherId: 'teacher-1',
      });

      const result = await calendarService.createTeacherEvent(
        'teacher-1',
        minimalDto,
      );

      expect(result.message).toBe('Tạo ca dạy thành công');
      expect(result.hasConflict).toBe(false);
      expect(
        prismaMock.calendarEventParticipant.createMany,
      ).not.toHaveBeenCalled();
      expect(prismaMock.calendarNotification.createMany).not.toHaveBeenCalled();
    });

    it('phát hiện trùng lịch và trả về cảnh báo hasConflict: true nhưng không chặn', async () => {
      const minimalDto = {
        title: 'Ca dạy trùng giờ',
        startAt: '2026-10-15T08:00:00.000Z',
        endAt: '2026-10-15T10:00:00.000Z',
      };

      const existingConflict = {
        id: 'conflict-1',
        title: 'Ca dạy đã có từ trước',
        startAt: new Date('2026-10-15T09:00:00.000Z'),
        endAt: new Date('2026-10-15T11:00:00.000Z'),
      };
      prismaMock.teacherCalendarEvent.findMany.mockResolvedValue([
        existingConflict,
      ]);

      prismaMock.teacherCalendarEvent.create.mockResolvedValue({
        id: 'event-new',
        ...minimalDto,
        teacherId: 'teacher-1',
      });
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'event-new',
        ...minimalDto,
        teacherId: 'teacher-1',
      });

      const result = await calendarService.createTeacherEvent(
        'teacher-1',
        minimalDto,
      );

      expect(result.hasConflict).toBe(true);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].id).toBe('conflict-1');
    });

    it('ném BadRequestException nếu startAt >= endAt', async () => {
      const invalidDto = {
        ...validDto,
        startAt: '2026-10-15T10:00:00.000Z',
        endAt: '2026-10-15T08:00:00.000Z',
      };

      await expect(
        calendarService.createTeacherEvent('teacher-1', invalidDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('ném ForbiddenException nếu sử dụng nhãn của giáo viên khác', async () => {
      prismaMock.teacherCalendarLabel.findUnique.mockResolvedValue({
        id: 'label-other',
        teacherId: 'teacher-2',
        name: 'Nhãn giáo viên khác',
      });

      await expect(
        calendarService.createTeacherEvent('teacher-1', {
          ...validDto,
          labelId: 'label-other',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('ném NotFoundException nếu labelId không tồn tại', async () => {
      prismaMock.teacherCalendarLabel.findUnique.mockResolvedValue(null);

      await expect(
        calendarService.createTeacherEvent('teacher-1', {
          ...validDto,
          labelId: 'non-existent',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('ném BadRequestException nếu học sinh không tồn tại', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'stu-1',
          fullName: 'Học sinh 1',
          role: UserRole.STUDENT,
          isActive: true,
        },
      ]);

      await expect(
        calendarService.createTeacherEvent('teacher-1', {
          ...validDto,
          labelId: undefined,
          studentIds: ['stu-1', 'stu-ghost'],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('ném BadRequestException nếu học sinh bị vô hiệu hóa (isActive = false)', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'stu-1',
          fullName: 'Học sinh inactive',
          role: UserRole.STUDENT,
          isActive: false,
        },
      ]);

      await expect(
        calendarService.createTeacherEvent('teacher-1', {
          ...validDto,
          labelId: undefined,
          studentIds: ['stu-1'],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('ném BadRequestException nếu người dùng không phải là role STUDENT', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 'teacher-3',
          fullName: 'Giáo viên khác',
          role: UserRole.TEACHER,
          isActive: true,
        },
      ]);

      await expect(
        calendarService.createTeacherEvent('teacher-1', {
          ...validDto,
          labelId: undefined,
          studentIds: ['teacher-3'],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTeacherEvents & getTeacherEventById', () => {
    it('lấy danh sách ca dạy lọc theo from và to thành công', async () => {
      prismaMock.teacherCalendarEvent.findMany.mockResolvedValue([
        { id: 'e1', title: 'Ca 1', startAt: new Date('2026-10-15T08:00:00Z') },
      ]);

      const result = await calendarService.getTeacherEvents('teacher-1', {
        from: '2026-10-01T00:00:00Z',
        to: '2026-10-31T23:59:59Z',
      });

      expect(result.total).toBe(1);
      expect(result.events[0].id).toBe('e1');
    });

    it('ném BadRequestException nếu from > to', async () => {
      await expect(
        calendarService.getTeacherEvents('teacher-1', {
          from: '2026-10-31T00:00:00Z',
          to: '2026-10-01T00:00:00Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('giáo viên xem chi tiết ca dạy của mình thành công', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'e1',
        teacherId: 'teacher-1',
        title: 'Ca 1',
      });

      const event = await calendarService.getTeacherEventById(
        'teacher-1',
        'e1',
      );
      expect(event.id).toBe('e1');
    });

    it('ném ForbiddenException nếu giáo viên truy cập ca dạy của giáo viên khác', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'e1',
        teacherId: 'teacher-2',
        title: 'Ca 1 của teacher 2',
      });

      await expect(
        calendarService.getTeacherEventById('teacher-1', 'e1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('ném NotFoundException nếu ca dạy không tồn tại', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue(null);

      await expect(
        calendarService.getTeacherEventById('teacher-1', 'ghost-event'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTeacherEvent & deleteTeacherEvent', () => {
    it('cập nhật ca dạy và hủy/lên lịch lại thông báo khi đổi giờ', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'e1',
        teacherId: 'teacher-1',
        startAt: new Date('2026-10-15T08:00:00Z'),
        endAt: new Date('2026-10-15T10:00:00Z'),
        reminderMinutes: 15,
        participants: [{ studentId: 'stu-1' }],
      });

      prismaMock.teacherCalendarEvent.findMany.mockResolvedValue([]); // Không trùng lịch mới
      prismaMock.teacherCalendarEvent.update.mockResolvedValue({
        id: 'e1',
        title: 'Tên mới',
      });

      await calendarService.updateTeacherEvent('teacher-1', 'e1', {
        title: 'Tên mới',
        startAt: '2026-10-15T09:00:00Z',
        endAt: '2026-10-15T11:00:00Z',
      });

      expect(prismaMock.calendarNotification.updateMany).toHaveBeenCalledWith({
        where: {
          eventId: 'e1',
          status: CalendarNotificationStatus.PENDING,
        },
        data: {
          status: CalendarNotificationStatus.CANCELLED,
        },
      });
      expect(prismaMock.calendarNotification.createMany).toHaveBeenCalled();
    });

    it('ném ForbiddenException nếu sửa ca dạy của giáo viên khác', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'e1',
        teacherId: 'teacher-2',
      });

      await expect(
        calendarService.updateTeacherEvent('teacher-1', 'e1', {
          title: 'Hack',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('xóa ca dạy thành công', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'e1',
        teacherId: 'teacher-1',
      });
      prismaMock.teacherCalendarEvent.delete.mockResolvedValue({ id: 'e1' });

      const result = await calendarService.deleteTeacherEvent(
        'teacher-1',
        'e1',
      );
      expect(result.message).toBe('Xóa ca dạy thành công');
      expect(prismaMock.teacherCalendarEvent.delete).toHaveBeenCalledWith({
        where: { id: 'e1' },
      });
    });

    it('ném ForbiddenException nếu xóa ca dạy của giáo viên khác', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'e1',
        teacherId: 'teacher-2',
      });

      await expect(
        calendarService.deleteTeacherEvent('teacher-1', 'e1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Nhãn (Labels)', () => {
    it('tạo nhãn mới thành công', async () => {
      prismaMock.teacherCalendarLabel.findUnique.mockResolvedValue(null);
      prismaMock.teacherCalendarLabel.create.mockResolvedValue({
        id: 'l1',
        name: 'VIP',
        color: '#FF5733',
        teacherId: 'teacher-1',
      });

      const res = await calendarService.createTeacherLabel('teacher-1', {
        name: 'VIP',
        color: '#FF5733',
      });

      expect(res.label.name).toBe('VIP');
    });

    it('ném ConflictException nếu tên nhãn trùng lặp cho cùng giáo viên', async () => {
      prismaMock.teacherCalendarLabel.findUnique.mockResolvedValue({
        id: 'l1',
        name: 'VIP',
        teacherId: 'teacher-1',
      });

      await expect(
        calendarService.createTeacherLabel('teacher-1', {
          name: 'VIP',
          color: '#FF5733',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('hai giáo viên khác nhau có thể tạo nhãn cùng tên', async () => {
      prismaMock.teacherCalendarLabel.findUnique.mockResolvedValue(null);
      prismaMock.teacherCalendarLabel.create.mockResolvedValue({
        id: 'l2',
        name: 'VIP',
        teacherId: 'teacher-2',
      });

      const res = await calendarService.createTeacherLabel('teacher-2', {
        name: 'VIP',
        color: '#00FF00',
      });

      expect(res.label.teacherId).toBe('teacher-2');
    });

    it('giáo viên không thể xóa nhãn của giáo viên khác', async () => {
      prismaMock.teacherCalendarLabel.findUnique.mockResolvedValue({
        id: 'l1',
        teacherId: 'teacher-2',
      });

      await expect(
        calendarService.deleteTeacherLabel('teacher-1', 'l1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Quản lý người tham gia (Participants)', () => {
    it('thêm học sinh vào ca dạy thành công', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'e1',
        teacherId: 'teacher-1',
        startAt: new Date('2026-10-15T08:00:00Z'),
        reminderMinutes: 30,
      });

      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 's1',
          fullName: 'Học sinh 1',
          role: UserRole.STUDENT,
          isActive: true,
        },
      ]);
      prismaMock.calendarEventParticipant.findMany.mockResolvedValue([]); // Chưa có trong ca

      const res = await calendarService.addEventParticipants(
        'teacher-1',
        'e1',
        {
          studentId: 's1',
        },
      );

      expect(res.addedStudentIds).toEqual(['s1']);
      expect(prismaMock.calendarEventParticipant.createMany).toHaveBeenCalled();
      expect(prismaMock.calendarNotification.createMany).toHaveBeenCalled();
    });

    it('ném ConflictException nếu học sinh đã tham gia ca dạy trước đó', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'e1',
        teacherId: 'teacher-1',
      });

      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 's1',
          fullName: 'Học sinh 1',
          role: UserRole.STUDENT,
          isActive: true,
        },
      ]);
      prismaMock.calendarEventParticipant.findMany.mockResolvedValue([
        { student: { fullName: 'Học sinh 1' } },
      ]);

      await expect(
        calendarService.addEventParticipants('teacher-1', 'e1', {
          studentId: 's1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('xóa học sinh khỏi ca dạy thành công và hủy nhắc lịch của học sinh đó', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'e1',
        teacherId: 'teacher-1',
      });
      prismaMock.calendarEventParticipant.findUnique.mockResolvedValue({
        id: 'p1',
        eventId: 'e1',
        studentId: 's1',
      });

      const res = await calendarService.removeEventParticipant(
        'teacher-1',
        'e1',
        's1',
      );

      expect(res.message).toBe('Đã xóa học sinh khỏi ca dạy thành công');
      expect(prismaMock.calendarEventParticipant.delete).toHaveBeenCalled();
      expect(prismaMock.calendarNotification.updateMany).toHaveBeenCalledWith({
        where: {
          eventId: 'e1',
          recipientId: 's1',
          status: CalendarNotificationStatus.PENDING,
        },
        data: {
          status: CalendarNotificationStatus.CANCELLED,
        },
      });
    });

    it('ném NotFoundException nếu học sinh không thuộc ca dạy khi xóa', async () => {
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'e1',
        teacherId: 'teacher-1',
      });
      prismaMock.calendarEventParticipant.findUnique.mockResolvedValue(null);

      await expect(
        calendarService.removeEventParticipant('teacher-1', 'e1', 's99'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Student Calendar', () => {
    it('học sinh chỉ thấy các ca dạy mà mình là participant', async () => {
      prismaMock.teacherCalendarEvent.findMany.mockResolvedValue([
        {
          id: 'e1',
          title: 'Ca của học sinh',
          teacher: { id: 't1', fullName: 'Cô Lan' },
          label: { name: 'Văn 12', color: '#123456' },
        },
      ]);

      const res = await calendarService.getStudentEvents('stu-1', {});

      expect(res.total).toBe(1);
      expect(res.events[0].id).toBe('e1');
      expect(prismaMock.teacherCalendarEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            participants: { some: { studentId: 'stu-1' } },
          }),
        }),
      );
    });

    it('học sinh xem chi tiết ca dạy thành công nếu là participant', async () => {
      prismaMock.calendarEventParticipant.findUnique.mockResolvedValue({
        id: 'p1',
        eventId: 'e1',
        studentId: 'stu-1',
      });
      prismaMock.teacherCalendarEvent.findUnique.mockResolvedValue({
        id: 'e1',
        title: 'Ca 1',
      });

      const res = await calendarService.getStudentEventById('stu-1', 'e1');
      expect(res.id).toBe('e1');
    });

    it('ném NotFoundException nếu học sinh xem ca dạy mà mình không tham gia', async () => {
      prismaMock.calendarEventParticipant.findUnique.mockResolvedValue(null);

      await expect(
        calendarService.getStudentEventById('stu-1', 'e-other'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
