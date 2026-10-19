import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TeacherClassesService } from './teacher-classes.service.js';
import {
  UserRole,
  ClassStatus,
  GoogleConnectionStatus,
  MeetSpaceStatus,
} from '../../generated/prisma/client.js';

describe('TeacherClassesService — Google Meet Integration', () => {
  let service: TeacherClassesService;
  let prismaMock: any;
  let googleAuthServiceMock: any;
  let googleMeetServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: vi.fn(),
      },
      class: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      userGoogleAccount: {
        findUnique: vi.fn(),
      },
      classMeetSpace: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn((actions) => Promise.all(actions)),
    };

    googleAuthServiceMock = {
      getValidAccessToken: vi.fn(),
    };

    googleMeetServiceMock = {
      createSpace: vi.fn(),
    };

    service = new TeacherClassesService(
      prismaMock,
      googleAuthServiceMock,
      googleMeetServiceMock,
    );
  });

  describe('Tạo lớp và tự động tạo phòng Meet (Test Case 1, 8, 9)', () => {
    it('chưa liên kết Google thì không tạo phòng được và bị từ chối (Test Case 1)', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        role: UserRole.TEACHER,
        isActive: true,
      });

      // Chưa liên kết Google (userGoogleAccount null)
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue(null);

      await expect(
        service.createClass('teacher-1', { name: 'Lớp Văn 10' }),
      ).rejects.toThrow(BadRequestException);

      expect(prismaMock.class.create).not.toHaveBeenCalled();
      expect(googleMeetServiceMock.createSpace).not.toHaveBeenCalled();
    });

    it('tạo lớp thành công thì tạo và lưu đúng một phòng READY (Test Case 8)', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        role: UserRole.TEACHER,
        isActive: true,
      });

      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: 'valid-encrypted-token',
      });

      prismaMock.class.findUnique.mockResolvedValue(null); // joinCode unique
      prismaMock.class.create.mockResolvedValue({
        id: 'class-1',
        name: 'Lớp Văn 10',
        joinCode: 'CODE1234',
        status: ClassStatus.ACTIVE,
        teacherId: 'teacher-1',
      });

      prismaMock.classMeetSpace.create.mockResolvedValue({
        id: 'space-record-1',
        classId: 'class-1',
        status: MeetSpaceStatus.PENDING,
      });

      googleAuthServiceMock.getValidAccessToken.mockResolvedValue('valid-access-token');
      googleMeetServiceMock.createSpace.mockResolvedValue({
        name: 'spaces/xyz-123',
        meetingUri: 'https://meet.google.com/abc-defg-hij',
        meetingCode: 'abc-defg-hij',
      });

      prismaMock.classMeetSpace.update.mockResolvedValue({
        id: 'space-record-1',
        classId: 'class-1',
        spaceName: 'spaces/xyz-123',
        meetingUri: 'https://meet.google.com/abc-defg-hij',
        status: MeetSpaceStatus.READY,
      });

      prismaMock.class.update.mockResolvedValue({
        id: 'class-1',
        name: 'Lớp Văn 10',
        defaultMeetUrl: 'https://meet.google.com/abc-defg-hij',
      });

      const result = await service.createClass('teacher-1', {
        name: 'Lớp Văn 10',
      });

      expect(result.class.meetSpace.status).toBe(MeetSpaceStatus.READY);
      expect(result.class.meetSpace.meetingUri).toBe(
        'https://meet.google.com/abc-defg-hij',
      );
      expect(googleMeetServiceMock.createSpace).toHaveBeenCalledTimes(1);
    });

    it('Google API lỗi không làm phòng bị đánh dấu READY và bảo tồn lớp học (Test Case 9)', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        role: UserRole.TEACHER,
        isActive: true,
      });

      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: 'valid-encrypted-token',
      });

      prismaMock.class.findUnique.mockResolvedValue(null);
      prismaMock.class.create.mockResolvedValue({
        id: 'class-1',
        name: 'Lớp Văn 10',
        teacherId: 'teacher-1',
      });

      prismaMock.classMeetSpace.create.mockResolvedValue({
        id: 'space-record-1',
        classId: 'class-1',
        status: MeetSpaceStatus.PENDING,
      });

      googleAuthServiceMock.getValidAccessToken.mockResolvedValue('valid-access-token');
      // Google API trả về lỗi 500 / Timeout
      googleMeetServiceMock.createSpace.mockRejectedValue(
        new Error('Google Meet API timeout'),
      );

      prismaMock.classMeetSpace.update.mockResolvedValue({
        id: 'space-record-1',
        classId: 'class-1',
        status: MeetSpaceStatus.FAILED,
        errorMessage: 'Google Meet API timeout',
      });

      const result = await service.createClass('teacher-1', {
        name: 'Lớp Văn 10',
      });

      // Lớp không bị xóa
      expect(result.class.id).toBe('class-1');
      // Trạng thái phòng Meet là FAILED, KHÔNG PHẢI READY
      expect(result.class.meetSpace.status).toBe(MeetSpaceStatus.FAILED);
      expect(result.class.meetSpace.errorMessage).toContain(
        'Google Meet API timeout',
      );
    });
  });

  describe('Phân quyền và Retry phòng Meet (Test Case 10, 11, 12)', () => {
    it('giáo viên không thể truy cập hoặc quản lý phòng Meet của lớp người khác (Test Case 12)', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-of-teacher-2',
        teacherId: 'teacher-2', // Khác teacher-1
      });

      await expect(
        service.getClassMeetSpace('teacher-1', 'class-of-teacher-2'),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.retryCreateClassMeetSpace('teacher-1', 'class-of-teacher-2'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('retry khi phòng đã READY thì không tạo phòng mới (Test Case 10)', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-1',
        teacherId: 'teacher-1',
      });

      prismaMock.classMeetSpace.findUnique.mockResolvedValue({
        id: 'space-1',
        classId: 'class-1',
        status: MeetSpaceStatus.READY,
        meetingUri: 'https://meet.google.com/existing-code',
      });

      const result = await service.retryCreateClassMeetSpace('teacher-1', 'class-1');

      expect(result.message).toContain('Lớp học đã có phòng Google Meet sẵn sàng');
      expect(googleMeetServiceMock.createSpace).not.toHaveBeenCalled();
    });

    it('request lặp dồn dập khi phòng đang PENDING không tạo trùng ngoài ý muốn (Test Case 11)', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-1',
        teacherId: 'teacher-1',
      });

      // Vừa thử cách đây 2 giây (dưới 10s)
      prismaMock.classMeetSpace.findUnique.mockResolvedValue({
        id: 'space-1',
        classId: 'class-1',
        status: MeetSpaceStatus.PENDING,
        lastAttemptAt: new Date(),
      });

      const result = await service.retryCreateClassMeetSpace('teacher-1', 'class-1');

      expect(result.message).toContain('Yêu cầu tạo phòng đang được xử lý');
      expect(googleMeetServiceMock.createSpace).not.toHaveBeenCalled();
    });

    it('retry thành công khi phòng FAILED sẽ tạo Meet space và cập nhật READY', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-1',
        teacherId: 'teacher-1',
      });

      // Phòng FAILED trước đó
      prismaMock.classMeetSpace.findUnique.mockResolvedValue({
        id: 'space-1',
        classId: 'class-1',
        status: MeetSpaceStatus.FAILED,
        lastAttemptAt: new Date(Date.now() - 60000),
      });

      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: 'valid-token',
      });

      googleAuthServiceMock.getValidAccessToken.mockResolvedValue('valid-access-token');
      googleMeetServiceMock.createSpace.mockResolvedValue({
        name: 'spaces/retry-success',
        meetingUri: 'https://meet.google.com/new-retry-code',
        meetingCode: 'new-retry-code',
      });

      prismaMock.classMeetSpace.update.mockResolvedValue({
        id: 'space-1',
        classId: 'class-1',
        status: MeetSpaceStatus.READY,
        meetingUri: 'https://meet.google.com/new-retry-code',
      });

      const result = await service.retryCreateClassMeetSpace('teacher-1', 'class-1');

      expect(result.message).toContain('Khởi tạo phòng Google Meet thành công');
      expect(result.meetSpace.status).toBe(MeetSpaceStatus.READY);
    });
  });
});
