import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  NotificationType,
  MemberStatus,
} from '../../generated/prisma/client.js';
import type { QueryNotificationsDto } from './dto/query-notifications.dto.js';

export interface CreateNotificationInput {
  recipientId: string;
  title: string;
  content: string;
  type: NotificationType;
  referenceId?: string | null;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách thông báo của người dùng hiện tại (Phân trang, lọc theo isRead, type)
   */
  async findAll(userId: string, query: QueryNotificationsDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: any = { recipientId: userId };

    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }

    if (query.type !== undefined) {
      where.type = query.type;
    }

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Đếm số lượng thông báo chưa đọc của người dùng hiện tại
   */
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  /**
   * Đánh dấu một thông báo là đã đọc (Kiểm tra quyền sở hữu, idempotent)
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(`Không tìm thấy thông báo với ID ${notificationId}`);
    }

    if (notification.recipientId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập thông báo này');
    }

    // Idempotent: Nếu đã đọc rồi thì trả về luôn không cần update lại
    if (notification.isRead) {
      return {
        message: 'Thông báo đã được đánh dấu đọc trước đó',
        notification,
      };
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      message: 'Đánh dấu đã đọc thông báo thành công',
      notification: updated,
    };
  }

  /**
   * Đánh dấu tất cả thông báo của người dùng là đã đọc
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
      count: result.count,
    };
  }

  /**
   * Internal Service: Tạo một thông báo
   */
  async createNotification(input: CreateNotificationInput) {
    return this.prisma.notification.create({
      data: {
        recipientId: input.recipientId,
        title: input.title,
        content: input.content,
        type: input.type,
        referenceId: input.referenceId,
      },
    });
  }

  /**
   * Internal Service: Gửi thông báo đến tất cả học sinh đang ACTIVE trong một lớp học
   */
  async notifyClassStudents(
    classId: string,
    payload: {
      title: string;
      content: string;
      type: NotificationType;
      referenceId?: string;
    },
  ) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        classId,
        status: MemberStatus.ACTIVE,
      },
      select: { studentId: true },
    });

    if (enrollments.length === 0) return { count: 0 };

    const notificationsData = enrollments.map((e) => ({
      recipientId: e.studentId,
      title: payload.title,
      content: payload.content,
      type: payload.type,
      referenceId: payload.referenceId,
    }));

    const result = await this.prisma.notification.createMany({
      data: notificationsData,
    });

    return result;
  }
}
