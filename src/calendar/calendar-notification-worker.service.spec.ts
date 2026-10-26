import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CalendarNotificationWorkerService } from './calendar-notification-worker.service.js';
import {
  CalendarNotificationStatus,
  NotificationType,
  ScheduleStatus,
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
    const now = Date.now();
    const dueNotification = {
      id: 'notif-1',
      eventId: 'evt-1',
      recipientId: 'rec-1',
      status: CalendarNotificationStatus.PENDING,
      scheduledAt: new Date(now - 60000), // Quá khứ 1 phút (vẫn trong grace period)
      event: {
        id: 'evt-1',
        title: 'Luyện đề đại học',
        startAt: new Date(now + 15 * 60 * 1000), // Sắp diễn ra sau 15p
        endAt: new Date(now + 75 * 60 * 1000),
        address: 'Hà Nội',
        meetUrl: 'https://meet.google.com/test-meet',
        status: ScheduleStatus.SCHEDULED,
      },
      recipient: {
        id: 'rec-1',
        fullName: 'Nguyễn Văn A',
        role: UserRole.STUDENT,
        isActive: true,
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
    expect(result.skipped).toBe(0);
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
      event: {
        id: 'e2',
        title: 'Tập huấn',
        startAt: new Date(Date.now() + 10000),
        endAt: new Date(Date.now() + 60000),
        status: ScheduleStatus.SCHEDULED,
      },
      recipient: { id: 'r2', isActive: true },
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

  it('bỏ qua và chuyển sang CANCELLED nếu buổi học đã bị hủy (CANCELLED)', async () => {
    const cancelledNotification = {
      id: 'notif-cancelled',
      eventId: 'evt-c',
      recipientId: 'rec-c',
      status: CalendarNotificationStatus.PENDING,
      scheduledAt: new Date(Date.now() - 1000),
      event: {
        id: 'evt-c',
        title: 'Lớp hủy',
        startAt: new Date(Date.now() + 10000),
        endAt: new Date(Date.now() + 60000),
        status: ScheduleStatus.CANCELLED,
      },
      recipient: { id: 'rec-c', isActive: true },
    };

    prismaMock.calendarNotification.findMany.mockResolvedValue([
      cancelledNotification,
    ]);
    prismaMock.calendarNotification.updateMany.mockResolvedValue({ count: 1 });

    const result = await worker.processPendingNotifications();

    expect(result.skipped).toBe(1);
    expect(result.sent).toBe(0);
    expect(notificationsServiceMock.createNotification).not.toHaveBeenCalled();
    expect(prismaMock.calendarNotification.update).toHaveBeenCalledWith({
      where: { id: 'notif-cancelled' },
      data: {
        status: CalendarNotificationStatus.CANCELLED,
        error: 'Buổi học đã bị hủy',
      },
    });
  });

  it('bỏ qua và chuyển sang CANCELLED nếu buổi học đã kết thúc', async () => {
    const finishedNotification = {
      id: 'notif-finished',
      eventId: 'evt-f',
      recipientId: 'rec-f',
      status: CalendarNotificationStatus.PENDING,
      scheduledAt: new Date(Date.now() - 120 * 60 * 1000),
      event: {
        id: 'evt-f',
        title: 'Lớp đã xong',
        startAt: new Date(Date.now() - 90 * 60 * 1000),
        endAt: new Date(Date.now() - 30 * 60 * 1000), // Đã kết thúc
        status: ScheduleStatus.SCHEDULED,
      },
      recipient: { id: 'rec-f', isActive: true },
    };

    prismaMock.calendarNotification.findMany.mockResolvedValue([
      finishedNotification,
    ]);
    prismaMock.calendarNotification.updateMany.mockResolvedValue({ count: 1 });

    const result = await worker.processPendingNotifications();

    expect(result.skipped).toBe(1);
    expect(result.sent).toBe(0);
    expect(prismaMock.calendarNotification.update).toHaveBeenCalledWith({
      where: { id: 'notif-finished' },
      data: {
        status: CalendarNotificationStatus.CANCELLED,
        error: 'Bỏ qua do buổi học đã kết thúc',
      },
    });
  });

  it('bỏ qua nếu thời điểm dự kiến gửi vượt quá Grace Period (60 phút)', async () => {
    const expiredNotification = {
      id: 'notif-grace-expired',
      eventId: 'evt-g',
      recipientId: 'rec-g',
      status: CalendarNotificationStatus.PENDING,
      scheduledAt: new Date(Date.now() - 65 * 60 * 1000), // Quá 65 phút
      event: {
        id: 'evt-g',
        title: 'Lớp quá hạn',
        startAt: new Date(Date.now() + 10 * 60 * 1000),
        endAt: new Date(Date.now() + 60 * 60 * 1000),
        status: ScheduleStatus.SCHEDULED,
      },
      recipient: { id: 'rec-g', isActive: true },
    };

    prismaMock.calendarNotification.findMany.mockResolvedValue([
      expiredNotification,
    ]);
    prismaMock.calendarNotification.updateMany.mockResolvedValue({ count: 1 });

    const result = await worker.processPendingNotifications();

    expect(result.skipped).toBe(1);
    expect(result.sent).toBe(0);
    expect(prismaMock.calendarNotification.update).toHaveBeenCalledWith({
      where: { id: 'notif-grace-expired' },
      data: {
        status: CalendarNotificationStatus.CANCELLED,
        error: 'Bỏ qua nhắc nhở do vượt quá Grace Period (60 phút)',
      },
    });
  });

  it('xử lý lỗi khi gửi thông báo: cập nhật status thành FAILED và tăng retryCount', async () => {
    const now = Date.now();
    const dueNotification = {
      id: 'notif-fail',
      status: CalendarNotificationStatus.PENDING,
      scheduledAt: new Date(now - 1000),
      event: {
        id: 'e3',
        title: 'Ca lỗi',
        startAt: new Date(now + 15 * 60 * 1000),
        endAt: new Date(now + 60 * 60 * 1000),
        status: ScheduleStatus.SCHEDULED,
      },
      recipient: { id: 'r3', isActive: true },
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
