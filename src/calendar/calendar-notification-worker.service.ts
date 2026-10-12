import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import {
  CalendarNotificationStatus,
  NotificationType,
} from '../../generated/prisma/client.js';

@Injectable()
export class CalendarNotificationWorkerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(CalendarNotificationWorkerService.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    // Chạy worker mỗi 30 giây để xử lý các thông báo đến hạn
    const intervalMs = 30 * 1000;
    this.timer = setInterval(() => {
      this.processPendingNotifications().catch((err) => {
        this.logger.error('Lỗi khi thực thi worker thông báo lịch:', err);
      });
    }, intervalMs);

    this.logger.log(
      'CalendarNotificationWorker đã được khởi động (chu kỳ 30s)',
    );
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.logger.log('CalendarNotificationWorker đã dừng');
    }
  }

  /**
   * Định dạng thời gian theo múi giờ hiển thị của sản phẩm (Asia/Ho_Chi_Minh)
   */
  private formatVietnamDateTime(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  /**
   * Tự động khôi phục các job PROCESSING bị treo (quá 5 phút chưa hoàn tất do sự cố tiến trình)
   */
  async recoverStuckProcessingJobs(): Promise<number> {
    const stuckThreshold = new Date(Date.now() - 5 * 60 * 1000);

    // 1. Nếu retryCount < 3: đưa về PENDING để worker xử lý lại
    const recovered = await this.prisma.calendarNotification.updateMany({
      where: {
        status: CalendarNotificationStatus.PROCESSING,
        updatedAt: { lte: stuckThreshold },
        retryCount: { lt: 3 },
      },
      data: {
        status: CalendarNotificationStatus.PENDING,
        error: 'Tự động khôi phục do tiến trình trước bị gián đoạn/treo',
        retryCount: { increment: 1 },
      },
    });

    if (recovered.count > 0) {
      this.logger.warn(
        `Đã khôi phục ${recovered.count} thông báo lịch bị treo ở trạng thái PROCESSING`,
      );
    }

    // 2. Nếu retryCount >= 3: chuyển FAILED hẳn
    await this.prisma.calendarNotification.updateMany({
      where: {
        status: CalendarNotificationStatus.PROCESSING,
        updatedAt: { lte: stuckThreshold },
        retryCount: { gte: 3 },
      },
      data: {
        status: CalendarNotificationStatus.FAILED,
        error: 'Tiến trình bị treo và đã vượt quá giới hạn thử lại (3 lần)',
      },
    });

    return recovered.count;
  }

  /**
   * Xử lý các thông báo nhắc lịch đến hạn (Hỗ trợ chống trùng lặp và đa tiến trình)
   */
  async processPendingNotifications(): Promise<{
    processed: number;
    sent: number;
    failed: number;
  }> {
    if (this.isProcessing) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    this.isProcessing = true;
    let sentCount = 0;
    let failedCount = 0;

    try {
      // 1. Khôi phục các job PROCESSING bị treo trước
      await this.recoverStuckProcessingJobs();

      const now = new Date();

      // 2. Tìm tối đa 50 thông báo PENDING hoặc FAILED (cần retry < 3 lần, cách lần thử trước tối thiểu 1 phút và trong vòng 24h)
      const dueNotifications = await this.prisma.calendarNotification.findMany({
        where: {
          OR: [
            {
              status: CalendarNotificationStatus.PENDING,
              scheduledAt: { lte: now },
            },
            {
              status: CalendarNotificationStatus.FAILED,
              retryCount: { lt: 3 },
              updatedAt: { lte: new Date(now.getTime() - 60 * 1000) },
              scheduledAt: {
                lte: now,
                gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
              },
            },
          ],
        },
        take: 50,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startAt: true,
              endAt: true,
              address: true,
              meetUrl: true,
            },
          },
          recipient: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
        },
      });

      for (const item of dueNotifications) {
        // Khóa lạc quan (Optimistic Lock) để chống xử lý trùng lặp giữa các worker / luồng
        const claimed = await this.prisma.calendarNotification.updateMany({
          where: {
            id: item.id,
            status: item.status, // Chỉ nhận nếu status chưa bị đổi bởi luồng khác
          },
          data: {
            status: CalendarNotificationStatus.PROCESSING,
            updatedAt: new Date(),
          },
        });

        if (claimed.count === 0) {
          // Bị luồng khác claim trước đó, bỏ qua an toàn
          continue;
        }

        try {
          const timeFormatted = this.formatVietnamDateTime(item.event.startAt);
          const locationDetails = item.event.meetUrl
            ? `Google Meet: ${item.event.meetUrl}`
            : item.event.address
              ? `Địa điểm: ${item.event.address}`
              : '';

          const content = `Ca dạy "${item.event.title}" sẽ diễn ra vào lúc ${timeFormatted}.${
            locationDetails ? ` (${locationDetails})` : ''
          }`;

          // Tạo thông báo in-app (Trong ứng dụng)
          await this.notificationsService.createNotification({
            recipientId: item.recipientId,
            title: `Nhắc lịch ca dạy: ${item.event.title}`,
            content,
            type: NotificationType.CALENDAR,
            referenceId: item.eventId,
          });

          // Đánh dấu hoàn tất
          await this.prisma.calendarNotification.update({
            where: { id: item.id },
            data: {
              status: CalendarNotificationStatus.SENT,
              sentAt: new Date(),
              error: null,
            },
          });

          sentCount++;
        } catch (error: any) {
          failedCount++;
          this.logger.error(
            `Gửi thông báo lịch ${item.id} thất bại: ${error?.message}`,
          );

          await this.prisma.calendarNotification.update({
            where: { id: item.id },
            data: {
              status: CalendarNotificationStatus.FAILED,
              error: error?.message ?? 'Lỗi không xác định',
              retryCount: {
                increment: 1,
              },
            },
          });
        }
      }

      return {
        processed: dueNotifications.length,
        sent: sentCount,
        failed: failedCount,
      };
    } finally {
      this.isProcessing = false;
    }
  }
}
