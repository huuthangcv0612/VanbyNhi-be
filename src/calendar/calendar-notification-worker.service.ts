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
  ScheduleStatus,
} from '../../generated/prisma/client.js';

@Injectable()
export class CalendarNotificationWorkerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(CalendarNotificationWorkerService.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  // Cấu hình Grace Period và Concurrency
  // 1. Quá hạn nhắc tối đa 60 phút: Nếu server sập quá lâu, không gửi bù ồ ạt
  static readonly GRACE_PERIOD_MS = 60 * 60 * 1000;
  // 2. Không gửi nếu buổi học đã kết thúc hoặc đã bắt đầu quá 15 phút
  static readonly MAX_LATE_AFTER_START_MS = 15 * 60 * 1000;
  // 3. Khôi phục job bị treo sau 5 phút
  static readonly STUCK_JOB_TIMEOUT_MS = 5 * 60 * 1000;
  // 4. Giới hạn số lần thử lại tối đa
  static readonly MAX_RETRIES = 3;

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
   * Tự động khôi phục các job PROCESSING bị treo (quá 5 phút chưa hoàn tất do sự cố tiến trình / crash)
   */
  async recoverStuckProcessingJobs(): Promise<number> {
    const stuckThreshold = new Date(Date.now() - CalendarNotificationWorkerService.STUCK_JOB_TIMEOUT_MS);

    // 1. Nếu retryCount < MAX_RETRIES: đưa về PENDING để worker xử lý lại
    const recovered = await this.prisma.calendarNotification.updateMany({
      where: {
        status: CalendarNotificationStatus.PROCESSING,
        updatedAt: { lte: stuckThreshold },
        retryCount: { lt: CalendarNotificationWorkerService.MAX_RETRIES },
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

    // 2. Nếu retryCount >= MAX_RETRIES: chuyển FAILED hẳn
    await this.prisma.calendarNotification.updateMany({
      where: {
        status: CalendarNotificationStatus.PROCESSING,
        updatedAt: { lte: stuckThreshold },
        retryCount: { gte: CalendarNotificationWorkerService.MAX_RETRIES },
      },
      data: {
        status: CalendarNotificationStatus.FAILED,
        error: `Tiến trình bị treo và đã vượt quá giới hạn thử lại (${CalendarNotificationWorkerService.MAX_RETRIES} lần)`,
      },
    });

    return recovered.count;
  }

  /**
   * Xử lý các thông báo nhắc lịch đến hạn (Hỗ trợ chống trùng lặp, graceful recovery và đa worker)
   */
  async processPendingNotifications(): Promise<{
    processed: number;
    sent: number;
    skipped: number;
    failed: number;
  }> {
    if (this.isProcessing) {
      return { processed: 0, sent: 0, skipped: 0, failed: 0 };
    }

    this.isProcessing = true;
    let sentCount = 0;
    let skippedCount = 0;
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
              retryCount: { lt: CalendarNotificationWorkerService.MAX_RETRIES },
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
              status: true,
            },
          },
          recipient: {
            select: {
              id: true,
              fullName: true,
              role: true,
              isActive: true,
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
          const event = item.event;
          const recipient = item.recipient;

          // --- KIỂM TRA TÍNH HỢP LỆ VÀ GRACE PERIOD ---
          // 1. Người nhận không còn active hoặc không tồn tại
          if (!recipient || !recipient.isActive) {
            await this.prisma.calendarNotification.update({
              where: { id: item.id },
              data: {
                status: CalendarNotificationStatus.CANCELLED,
                error: 'Người nhận đã bị vô hiệu hóa hoặc không tồn tại',
              },
            });
            skippedCount++;
            continue;
          }

          // 2. Buổi học đã bị hủy (CANCELLED)
          if (event.status === ScheduleStatus.CANCELLED) {
            await this.prisma.calendarNotification.update({
              where: { id: item.id },
              data: {
                status: CalendarNotificationStatus.CANCELLED,
                error: 'Buổi học đã bị hủy',
              },
            });
            skippedCount++;
            continue;
          }

          // 3. Buổi học đã kết thúc
          if (now >= event.endAt) {
            await this.prisma.calendarNotification.update({
              where: { id: item.id },
              data: {
                status: CalendarNotificationStatus.CANCELLED,
                error: 'Bỏ qua do buổi học đã kết thúc',
              },
            });
            skippedCount++;
            continue;
          }

          // 4. Buổi học đã bắt đầu quá 15 phút (nhắc muộn không còn ý nghĩa)
          if (now.getTime() - event.startAt.getTime() > CalendarNotificationWorkerService.MAX_LATE_AFTER_START_MS) {
            await this.prisma.calendarNotification.update({
              where: { id: item.id },
              data: {
                status: CalendarNotificationStatus.CANCELLED,
                error: 'Bỏ qua do buổi học đã diễn ra quá 15 phút',
              },
            });
            skippedCount++;
            continue;
          }

          // 5. Grace period: Thời điểm dự kiến gửi đã quá 60 phút trước (do outage server dài hạn)
          if (now.getTime() - item.scheduledAt.getTime() > CalendarNotificationWorkerService.GRACE_PERIOD_MS) {
            await this.prisma.calendarNotification.update({
              where: { id: item.id },
              data: {
                status: CalendarNotificationStatus.CANCELLED,
                error: 'Bỏ qua nhắc nhở do vượt quá Grace Period (60 phút)',
              },
            });
            skippedCount++;
            continue;
          }

          // --- ĐỊNH DẠNG NỘI DUNG VÀ GỬI THÔNG BÁO ---
          const timeFormatted = this.formatVietnamDateTime(event.startAt);
          const locationDetails = event.meetUrl
            ? `Google Meet: ${event.meetUrl}`
            : event.address
              ? `Địa điểm: ${event.address}`
              : '';

          const content = `Ca dạy "${event.title}" sẽ diễn ra vào lúc ${timeFormatted}.${
            locationDetails ? ` (${locationDetails})` : ''
          }`;

          // Tạo thông báo in-app (Trong DB trước, tự động phát WebSocket tới phòng user:{userId})
          await this.notificationsService.createNotification({
            recipientId: item.recipientId,
            title: `Nhắc lịch ca dạy: ${event.title}`,
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
        skipped: skippedCount,
        failed: failedCount,
      };
    } finally {
      this.isProcessing = false;
    }
  }
}
