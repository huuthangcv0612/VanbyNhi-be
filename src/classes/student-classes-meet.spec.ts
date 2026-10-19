import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { StudentClassesService } from './student-classes.service.js';
import { MemberStatus, MeetSpaceStatus } from '../../generated/prisma/client.js';

describe('StudentClassesService — Google Meet Link Access (Test Cases 13, 14)', () => {
  let service: StudentClassesService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      class: {
        findUnique: vi.fn(),
      },
      enrollment: {
        findFirst: vi.fn(),
      },
    };

    service = new StudentClassesService(prismaMock);
  });

  it('học sinh không có quyền (không phải thành viên ACTIVE) không lấy được link (Test Case 13)', async () => {
    prismaMock.class.findUnique.mockResolvedValue({
      id: 'class-1',
      name: 'Lớp Toán 10',
      meetSpace: {
        meetingUri: 'https://meet.google.com/abc-mnop-xyz',
        status: MeetSpaceStatus.READY,
      },
    });

    // Học sinh không có enrollment hoặc trạng thái PENDING / REJECTED
    prismaMock.enrollment.findFirst.mockResolvedValue(null);

    await expect(
      service.getClassMeetAccess('unauthorized-student', 'class-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('học sinh đủ quyền (thành viên ACTIVE) lấy được link Meet (Test Case 14)', async () => {
    prismaMock.class.findUnique.mockResolvedValue({
      id: 'class-1',
      name: 'Lớp Toán 10',
      meetSpace: {
        meetingUri: 'https://meet.google.com/abc-mnop-xyz',
        status: MeetSpaceStatus.READY,
      },
    });

    // Thành viên ACTIVE
    prismaMock.enrollment.findFirst.mockResolvedValue({
      id: 'membership-1',
      studentId: 'student-1',
      classId: 'class-1',
      status: MemberStatus.ACTIVE,
    });

    const result = await service.getClassMeetAccess('student-1', 'class-1');

    expect(result).toEqual({
      classId: 'class-1',
      className: 'Lớp Toán 10',
      meetingUri: 'https://meet.google.com/abc-mnop-xyz',
      status: MeetSpaceStatus.READY,
      instructions: expect.stringContaining('Lưu ý: Nếu bạn tham gia bằng tài khoản Google cá nhân'),
    });
  });

  it('báo lỗi khi lớp học chưa có đường dẫn Google Meet sẵn sàng', async () => {
    prismaMock.class.findUnique.mockResolvedValue({
      id: 'class-1',
      name: 'Lớp Toán 10',
      meetSpace: null,
      defaultMeetUrl: null,
    });

    prismaMock.enrollment.findFirst.mockResolvedValue({
      id: 'membership-1',
      studentId: 'student-1',
      classId: 'class-1',
      status: MemberStatus.ACTIVE,
    });

    await expect(
      service.getClassMeetAccess('student-1', 'class-1'),
    ).rejects.toThrow(BadRequestException);
  });
});
