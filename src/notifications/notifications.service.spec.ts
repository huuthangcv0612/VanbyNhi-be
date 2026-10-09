import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { NotificationType } from '../../generated/prisma/client.js';

describe('NotificationsService', () => {
  let notificationsService: NotificationsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      notification: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        create: vi.fn(),
        createMany: vi.fn(),
      },
      enrollment: {
        findMany: vi.fn(),
      },
    };

    notificationsService = new NotificationsService(prismaMock);
  });

  describe('findAll', () => {
    it('lấy danh sách thông báo của user với phân trang', async () => {
      const mockNotifications = [
        { id: 'n1', recipientId: 'u1', title: 'Bài tập mới', isRead: false },
        { id: 'n2', recipientId: 'u1', title: 'Học phí tháng 10', isRead: true },
      ];
      prismaMock.notification.findMany.mockResolvedValue(mockNotifications);
      prismaMock.notification.count.mockResolvedValue(2);

      const result = await notificationsService.findAll('u1', { page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(prismaMock.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ recipientId: 'u1' }),
        }),
      );
    });

    it('trả về danh sách rỗng khi user không có thông báo', async () => {
      prismaMock.notification.findMany.mockResolvedValue([]);
      prismaMock.notification.count.mockResolvedValue(0);

      const result = await notificationsService.findAll('u2', {});

      expect(result.items).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getUnreadCount', () => {
    it('đếm số lượng thông báo chưa đọc của user', async () => {
      prismaMock.notification.count.mockResolvedValue(5);

      const result = await notificationsService.getUnreadCount('u1');

      expect(result.unreadCount).toBe(5);
      expect(prismaMock.notification.count).toHaveBeenCalledWith({
        where: { recipientId: 'u1', isRead: false },
      });
    });
  });

  describe('markAsRead', () => {
    it('đánh dấu một thông báo là đã đọc thành công', async () => {
      const notification = {
        id: 'n1',
        recipientId: 'u1',
        isRead: false,
      };
      prismaMock.notification.findUnique.mockResolvedValue(notification);
      prismaMock.notification.update.mockResolvedValue({
        ...notification,
        isRead: true,
        readAt: new Date(),
      });

      const result = await notificationsService.markAsRead('n1', 'u1');

      expect(result.notification.isRead).toBe(true);
      expect(prismaMock.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'n1' },
          data: expect.objectContaining({ isRead: true }),
        }),
      );
    });

    it('xử lý idempotent khi gọi lặp lại trên thông báo đã đọc', async () => {
      const notification = {
        id: 'n1',
        recipientId: 'u1',
        isRead: true,
        readAt: new Date(),
      };
      prismaMock.notification.findUnique.mockResolvedValue(notification);

      const result = await notificationsService.markAsRead('n1', 'u1');

      expect(result.notification.isRead).toBe(true);
      // Không cần gọi update lại
      expect(prismaMock.notification.update).not.toHaveBeenCalled();
    });

    it('từ chối nếu user cố gắng đánh dấu đọc thông báo của người khác', async () => {
      const notification = {
        id: 'n1',
        recipientId: 'u_other',
        isRead: false,
      };
      prismaMock.notification.findUnique.mockResolvedValue(notification);

      await expect(notificationsService.markAsRead('n1', 'u1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('ném NotFoundException nếu thông báo không tồn tại', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(null);

      await expect(notificationsService.markAsRead('n999', 'u1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('đánh dấu tất cả thông báo chưa đọc của user', async () => {
      prismaMock.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await notificationsService.markAllAsRead('u1');

      expect(result.count).toBe(3);
      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
        where: { recipientId: 'u1', isRead: false },
        data: expect.objectContaining({ isRead: true }),
      });
    });
  });

  describe('Internal helpers (createNotification & notifyClassStudents)', () => {
    it('tạo thông báo đơn lẻ cho một người nhận', async () => {
      const mockNotif = {
        id: 'n1',
        recipientId: 'u1',
        title: 'Chào mừng',
        content: 'Nội dung',
        type: NotificationType.SYSTEM,
      };
      prismaMock.notification.create.mockResolvedValue(mockNotif);

      const result = await notificationsService.createNotification(mockNotif);
      expect(result).toEqual(mockNotif);
    });

    it('gửi thông báo hàng loạt cho học sinh ACTIVE trong lớp', async () => {
      prismaMock.enrollment.findMany.mockResolvedValue([
        { studentId: 'stu1' },
        { studentId: 'stu2' },
      ]);
      prismaMock.notification.createMany.mockResolvedValue({ count: 2 });

      const result = await notificationsService.notifyClassStudents('c1', {
        title: 'Bài tập mới',
        content: 'Có bài tập mới',
        type: NotificationType.ASSIGNMENT,
      });

      expect(result.count).toBe(2);
      expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ recipientId: 'stu1' }),
          expect.objectContaining({ recipientId: 'stu2' }),
        ]),
      });
    });
  });
});
