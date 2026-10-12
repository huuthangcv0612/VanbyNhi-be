import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CalendarNotificationWorkerService } from './calendar-notification-worker.service.js';
import {
  CalendarNotificationStatus,
  NotificationType,
  UserRole,
} from '../../generated/prisma/client.js';

describe('CalendarNotificationWorkerService', () => {
  let worker: CalendarNotificationWorkerService;
  let prismaMock: any;
  let notificationsServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      calendarNotification: {
        findMany: vi.fn(),
        updateMany: vi.fn(),
        update: vi.fn(),
      },
    };

    notificationsServiceMock = {
      createNotification: vi.fn(),
    };

    worker = new CalendarNotificationWorkerService(
      prismaMock,
      notificationsServiceMock,
    );
  });

  afterEach(() => {
    worker.onModuleDestroy();
  });

  it('xử lý và gửi thành công thông báo nhắc lịch đến hạn', async () => {
    const dueNotification = {
      id: 'notif-1',
      eventId: 'evt-1',
      recipientId: 'rec-1',
      status: CalendarNotificationStatus.PENDING,
      scheduledAt: new Date(Date.now() - 60000), // Quá khứ 1 phút
      event: {
        id: 'evt-1',
        title: 'Luyện đề đại học',
        startAt: new Date('2026-10-15T08:00:00Z'),
        endAt: new Date('2026-10-15T10:00:00Z'),
        address: 'Hà Nội',
        meetUrl: 'https://meet.google.com/test-meet',
      },
      recipient: {
        id: 'rec-1',
        fullName: 'Nguyễn Văn A',
        role: UserRole.STUDENT,
      },
    };

    prismaMock.calendarNotification.findMany.mockResolvedValue([
      dueNotification,
    ]);
    // Khóa lạc quan claim thành công
    prismaMock.calendarNotification.updateMany.mockResolvedValue({ count: 1 });
    notificationsServiceMock.createNotification.mockResolvedValue({
      id: 'inapp-1',
    });
    prismaMock.calendarNotification.update.mockResolvedValue({
      id: 'notif-1',
      status: CalendarNotificationStatus.SENT,
    });

    const result = await worker.processPendingNotifications();

    expect(result.processed).toBe(1);
    expect(result.sent).toBe(1);
    expect(result.failed).toBe(0);

    expect(prismaMock.calendarNotification.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'notif-1',
        status: CalendarNotificationStatus.PENDING,
      },
      data: {
        status: CalendarNotificationStatus.PROCESSING,
        updatedAt: expect.any(Date),
      },
    });

    expect(notificationsServiceMock.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: 'rec-1',
        type: NotificationType.CALENDAR,
        referenceId: 'evt-1',
      }),
    );

    expect(prismaMock.calendarNotification.update).toHaveBeenCalledWith({
      where: { id: 'notif-1' },
      data: {
        status: CalendarNotificationStatus.SENT,
        sentAt: expect.any(Date),
        error: null,
      },
    });
  });

  it('bỏ qua an toàn và không gửi trùng khi bị luồng worker khác claim (count = 0)', async () => {
    const dueNotification = {
      id: 'notif-2',
      status: CalendarNotificationStatus.PENDING,
      scheduledAt: new Date(),
      event: { id: 'e2', title: 'Tập huấn', startAt: new Date() },
      recipient: { id: 'r2' },
    };

    prismaMock.calendarNotification.findMany.mockResolvedValue([
      dueNotification,
    ]);
    // Giả lập luồng khác đã đổi status trước -> count = 0
    prismaMock.calendarNotification.updateMany.mockResolvedValue({ count: 0 });

    const result = await worker.processPendingNotifications();

    expect(result.processed).toBe(1);
    expect(result.sent).toBe(0);
    expect(notificationsServiceMock.createNotification).not.toHaveBeenCalled();
    expect(prismaMock.calendarNotification.update).not.toHaveBeenCalled();
  });

  it('xử lý lỗi khi gửi thông báo: cập nhật status thành FAILED và tăng retryCount', async () => {
    const dueNotification = {
      id: 'notif-fail',
      status: CalendarNotificationStatus.PENDING,
      scheduledAt: new Date(),
      event: { id: 'e3', title: 'Ca lỗi', startAt: new Date() },
      recipient: { id: 'r3' },
    };

    prismaMock.calendarNotification.findMany.mockResolvedValue([
      dueNotification,
    ]);
    prismaMock.calendarNotification.updateMany.mockResolvedValue({ count: 1 });
    notificationsServiceMock.createNotification.mockRejectedValue(
      new Error('Mạng bị gián đoạn'),
    );
    prismaMock.calendarNotification.update.mockResolvedValue({
      id: 'notif-fail',
      status: CalendarNotificationStatus.FAILED,
    });

    const result = await worker.processPendingNotifications();

    expect(result.sent).toBe(0);
    expect(result.failed).toBe(1);

    expect(prismaMock.calendarNotification.update).toHaveBeenCalledWith({
      where: { id: 'notif-fail' },
      data: {
        status: CalendarNotificationStatus.FAILED,
        error: 'Mạng bị gián đoạn',
        retryCount: { increment: 1 },
      },
    });
  });

  it('khôi phục các job PROCESSING bị treo (quá 5 phút, retryCount < 3) về PENDING', async () => {
    prismaMock.calendarNotification.updateMany
      .mockResolvedValueOnce({ count: 2 }) // retryCount < 3
      .mockResolvedValueOnce({ count: 1 }); // retryCount >= 3 (chuyển FAILED)

    const count = await worker.recoverStuckProcessingJobs();

    expect(count).toBe(2);
    expect(prismaMock.calendarNotification.updateMany).toHaveBeenCalledTimes(2);
    expect(prismaMock.calendarNotification.updateMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          status: CalendarNotificationStatus.PROCESSING,
          retryCount: { lt: 3 },
        }),
        data: expect.objectContaining({
          status: CalendarNotificationStatus.PENDING,
          retryCount: { increment: 1 },
        }),
      }),
    );
    expect(prismaMock.calendarNotification.updateMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          status: CalendarNotificationStatus.PROCESSING,
          retryCount: { gte: 3 },
        }),
        data: expect.objectContaining({
          status: CalendarNotificationStatus.FAILED,
        }),
      }),
    );
  });

  it('khởi tạo và hủy chu kỳ worker đúng cách', () => {
    expect(() => worker.onModuleInit()).not.toThrow();
    expect(() => worker.onModuleDestroy()).not.toThrow();
  });
});
