import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { SessionStatus, ClassStatus } from '../../generated/prisma/client.js';

describe('SessionsService', () => {
  let sessionsService: SessionsService;
  let prismaMock: any;

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
    };

    const notificationsMock: any = {
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
});
