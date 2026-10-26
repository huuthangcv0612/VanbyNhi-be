import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationsGateway } from './notifications.gateway.js';
import { UserRole } from '../../generated/prisma/client.js';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let jwtServiceMock: any;
  let configServiceMock: any;
  let prismaMock: any;
  let serverMock: any;

  beforeEach(() => {
    jwtServiceMock = {
      verifyAsync: vi.fn(),
    };
    configServiceMock = {
      get: vi.fn().mockReturnValue('mock-secret'),
    };
    prismaMock = {
      user: {
        findUnique: vi.fn(),
      },
    };
    serverMock = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };

    gateway = new NotificationsGateway(
      jwtServiceMock,
      configServiceMock,
      prismaMock,
    );
    gateway.server = serverMock;
  });

  describe('handleConnection', () => {
    it('cho phép kết nối và join room user:{userId} khi token hợp lệ và user active', async () => {
      const mockClient: any = {
        id: 'socket-1',
        handshake: {
          auth: { token: 'valid-token' },
          headers: {},
        },
        data: {},
        join: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn(),
      };

      jwtServiceMock.verifyAsync.mockResolvedValue({
        sub: 'user-123',
        role: UserRole.TEACHER,
      });

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        isActive: true,
        role: UserRole.TEACHER,
      });

      await gateway.handleConnection(mockClient);

      expect(mockClient.join).toHaveBeenCalledWith('user:user-123');
      expect(mockClient.data.user).toEqual({
        id: 'user-123',
        role: UserRole.TEACHER,
      });
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('từ chối và ngắt kết nối nếu không có token trong handshake', async () => {
      const mockClient: any = {
        id: 'socket-no-token',
        handshake: { auth: {}, headers: {} },
        data: {},
        join: vi.fn(),
        disconnect: vi.fn(),
      };

      await gateway.handleConnection(mockClient);

      expect(mockClient.disconnect).toHaveBeenCalledWith(true);
      expect(mockClient.join).not.toHaveBeenCalled();
    });

    it('từ chối và ngắt kết nối nếu token không hợp lệ hoặc hết hạn', async () => {
      const mockClient: any = {
        id: 'socket-expired',
        handshake: {
          auth: { token: 'expired-token' },
          headers: {},
        },
        data: {},
        join: vi.fn(),
        disconnect: vi.fn(),
      };

      jwtServiceMock.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await gateway.handleConnection(mockClient);

      expect(mockClient.disconnect).toHaveBeenCalledWith(true);
      expect(mockClient.join).not.toHaveBeenCalled();
    });

    it('từ chối và ngắt kết nối nếu user bị khóa (isActive = false)', async () => {
      const mockClient: any = {
        id: 'socket-locked-user',
        handshake: {
          auth: { token: 'Bearer locked-token' },
          headers: {},
        },
        data: {},
        join: vi.fn(),
        disconnect: vi.fn(),
      };

      jwtServiceMock.verifyAsync.mockResolvedValue({
        sub: 'user-locked',
        role: UserRole.STUDENT,
      });

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-locked',
        isActive: false,
        role: UserRole.STUDENT,
      });

      await gateway.handleConnection(mockClient);

      expect(mockClient.disconnect).toHaveBeenCalledWith(true);
      expect(mockClient.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('ghi nhận ngắt kết nối an toàn', () => {
      const mockClient: any = {
        id: 'socket-1',
        data: { user: { id: 'user-123' } },
      };

      expect(() => gateway.handleDisconnect(mockClient)).not.toThrow();
    });
  });

  describe('phát events realtime', () => {
    it('sendNotificationToUser phát đúng event notification.created vào room user:{userId}', () => {
      const payload: any = {
        id: 'notif-1',
        title: 'Nhắc lịch',
        content: 'Buổi học sắp bắt đầu',
      };

      gateway.sendNotificationToUser('user-123', payload);

      expect(serverMock.to).toHaveBeenCalledWith('user:user-123');
      expect(serverMock.emit).toHaveBeenCalledWith(
        'notification.created',
        payload,
      );
    });

    it('sendNotificationReadToUser phát event notification.read vào room user:{userId}', () => {
      const data = {
        id: 'notif-1',
        isRead: true,
        readAt: new Date(),
      };

      gateway.sendNotificationReadToUser('user-123', data);

      expect(serverMock.to).toHaveBeenCalledWith('user:user-123');
      expect(serverMock.emit).toHaveBeenCalledWith('notification.read', data);
    });

    it('sendNotificationReadAllToUser phát event notification.read_all vào room user:{userId}', () => {
      const data = { readAt: new Date() };

      gateway.sendNotificationReadAllToUser('user-123', data);

      expect(serverMock.to).toHaveBeenCalledWith('user:user-123');
      expect(serverMock.emit).toHaveBeenCalledWith(
        'notification.read_all',
        data,
      );
    });
  });
});
