import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MeetAccessService } from './meet-access.service.js';
import {
  SessionStatus,
  MemberStatus,
} from '../../generated/prisma/client.js';

describe('MeetAccessService', () => {
  let service: MeetAccessService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      classSession: {
        findUnique: vi.fn(),
      },
      enrollment: {
        findFirst: vi.fn(),
      },
    };

    service = new MeetAccessService(prismaMock);
  });

  describe('isValidMeetUrl', () => {
    it('nhận diện đúng các URL hợp lệ', () => {
      expect(
        service.isValidMeetUrl('https://meet.google.com/abc-defg-hij'),
      ).toBe(true);
      expect(service.isValidMeetUrl('http://meet.google.com/xyz-uvw-rst')).toBe(
        true,
      );
    });

    it('từ chối URL rỗng, chuỗi trắng hoặc format sai', () => {
      expect(service.isValidMeetUrl(null)).toBe(false);
      expect(service.isValidMeetUrl(undefined)).toBe(false);
      expect(service.isValidMeetUrl('')).toBe(false);
      expect(service.isValidMeetUrl('   ')).toBe(false);
      expect(service.isValidMeetUrl('javascript:alert(1)')).toBe(false);
      expect(service.isValidMeetUrl('invalid-url')).toBe(false);
    });
  });

  describe('checkJoinWindow (Quy tắc 15 phút & trạng thái)', () => {
    const startTime = new Date('2026-10-15T08:00:00Z');
    const endTime = new Date('2026-10-15T10:00:00Z');
    const sessionMeetUrl = 'https://meet.google.com/session-url';
    const classMeetUrl = 'https://meet.google.com/class-default';

    it('mở cửa sổ đúng 15 phút trước startTime (ranh giới biên)', () => {
      const session = {
        startTime,
        endTime,
        status: SessionStatus.SCHEDULED,
        meetUrl: sessionMeetUrl,
      };

      // 16 phút trước: Chưa mở (canJoin: false)
      const tMinus16 = new Date(startTime.getTime() - 16 * 60 * 1000);
      const res16 = service.checkJoinWindow(session, tMinus16);
      expect(res16.canJoin).toBe(false);
      expect(res16.meetUrl).toBeNull();
      expect(res16.reason).toContain('Chưa đến thời gian mở phòng học');

      // Đúng 15 phút trước: Mở thành công (canJoin: true)
      const tMinus15 = new Date(startTime.getTime() - 15 * 60 * 1000);
      const res15 = service.checkJoinWindow(session, tMinus15);
      expect(res15.canJoin).toBe(true);
      expect(res15.meetUrl).toBe(sessionMeetUrl);

      // Trong buổi học (8:30): Mở thành công
      const tMid = new Date(startTime.getTime() + 30 * 60 * 1000);
      const resMid = service.checkJoinWindow(session, tMid);
      expect(resMid.canJoin).toBe(true);

      // Ranh giới kết thúc buổi học (10:00): Mở thành công
      const resEnd = service.checkJoinWindow(session, endTime);
      expect(resEnd.canJoin).toBe(true);

      // Quá endTime 1 giây: Đóng (canJoin: false)
      const tAfter = new Date(endTime.getTime() + 1000);
      const resAfter = service.checkJoinWindow(session, tAfter);
      expect(resAfter.canJoin).toBe(false);
      expect(resAfter.meetUrl).toBeNull();
      expect(resAfter.reason).toContain('Đã quá thời gian kết thúc');
    });

    it('luôn cho phép vào nếu buổi học đang LIVE (IN_PROGRESS) và có link hợp lệ', () => {
      const session = {
        startTime,
        endTime,
        status: SessionStatus.IN_PROGRESS,
        meetUrl: sessionMeetUrl,
      };

      // Trước startTime 30 phút nhưng thầy giáo đã mở phòng sớm (LIVE)
      const tEarly = new Date(startTime.getTime() - 30 * 60 * 1000);
      const res = service.checkJoinWindow(session, tEarly);
      expect(res.canJoin).toBe(true);
      expect(res.isLive).toBe(true);
      expect(res.meetUrl).toBe(sessionMeetUrl);
    });

    it('tuyệt đối không cấp link nếu buổi học đã CANCELLED', () => {
      const session = {
        startTime,
        endTime,
        status: SessionStatus.CANCELLED,
        meetUrl: sessionMeetUrl,
      };

      const res = service.checkJoinWindow(session, startTime);
      expect(res.canJoin).toBe(false);
      expect(res.meetUrl).toBeNull();
      expect(res.reason).toContain('bị hủy');
    });

    it('tuyệt đối không cấp link nếu buổi học đã COMPLETED', () => {
      const session = {
        startTime,
        endTime,
        status: SessionStatus.COMPLETED,
        meetUrl: sessionMeetUrl,
      };

      const res = service.checkJoinWindow(session, startTime);
      expect(res.canJoin).toBe(false);
      expect(res.meetUrl).toBeNull();
      expect(res.reason).toContain('kết thúc');
    });

    it('tự động fallback sang defaultMeetUrl của lớp nếu session.meetUrl null', () => {
      const session = {
        startTime,
        endTime,
        status: SessionStatus.SCHEDULED,
        meetUrl: null,
        class: { defaultMeetUrl: classMeetUrl },
      };

      const res = service.checkJoinWindow(session, startTime);
      expect(res.canJoin).toBe(true);
      expect(res.meetUrl).toBe(classMeetUrl);
    });

    it('từ chối cấp link nếu cả session và class đều không có URL Meet', () => {
      const session = {
        startTime,
        endTime,
        status: SessionStatus.SCHEDULED,
        meetUrl: null,
        class: { defaultMeetUrl: null },
      };

      const res = service.checkJoinWindow(session, startTime);
      expect(res.canJoin).toBe(false);
      expect(res.meetUrl).toBeNull();
      expect(res.reason).toContain('chưa có đường dẫn Google Meet');
    });
  });

  describe('getStudentMeetAccess (Kiểm tra quyền học sinh)', () => {
    const startTime = new Date('2026-10-15T08:00:00Z');
    const endTime = new Date('2026-10-15T10:00:00Z');

    it('cho phép học sinh ACTIVE lấy thông tin tham gia phòng Meet', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        title: 'Buổi học Test',
        startTime,
        endTime,
        status: SessionStatus.IN_PROGRESS,
        meetUrl: 'https://meet.google.com/test-meet',
        class: { id: 'c1', name: 'Lớp 12A', defaultMeetUrl: null },
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'enr1',
        classId: 'c1',
        studentId: 'stu1',
        status: MemberStatus.ACTIVE,
      });

      const res = await service.getStudentMeetAccess('s1', 'stu1', startTime);
      expect(res.canJoin).toBe(true);
      expect(res.meetUrl).toBe('https://meet.google.com/test-meet');
      expect(res.isLive).toBe(true);
    });

    it('chặn học sinh chưa ghi danh hoặc không phải ACTIVE (403)', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        classId: 'c1',
        title: 'Buổi học Test',
        startTime,
        endTime,
        status: SessionStatus.SCHEDULED,
        class: { id: 'c1', name: 'Lớp 12A' },
      });

      prismaMock.enrollment.findFirst.mockResolvedValue(null);

      await expect(
        service.getStudentMeetAccess('s1', 'stu_stranger', startTime),
      ).rejects.toThrow(ForbiddenException);
    });

    it('ném NotFoundException nếu buổi học không tồn tại (404)', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue(null);

      await expect(
        service.getStudentMeetAccess('s999', 'stu1', startTime),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateTeacherSession', () => {
    it('cho phép giáo viên phụ trách của lớp học', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        class: { teacherId: 't1' },
      });

      const res = await service.validateTeacherSession('s1', 't1');
      expect(res.id).toBe('s1');
    });

    it('chặn giáo viên khác lớp (403)', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        class: { teacherId: 't1' },
      });

      await expect(
        service.validateTeacherSession('s1', 't_other'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
