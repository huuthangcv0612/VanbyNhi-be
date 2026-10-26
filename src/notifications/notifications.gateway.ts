import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: Date | string;
  isRead: boolean;
  readAt: Date | string | null;
  referenceId: string | null;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Xác thực JWT token khi client kết nối qua handshake.
   * Chỉ đưa socket vào phòng user:{authenticatedUserId}.
   * Không tin userId do client tự gửi.
   */
  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} bị từ chối: Không có auth token`);
        client.disconnect(true);
        return;
      }

      const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
      if (!secret) {
        this.logger.error('JWT_ACCESS_SECRET chưa được cấu hình');
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, isActive: true, role: true },
      });

      if (!user || !user.isActive) {
        this.logger.warn(
          `Client ${client.id} bị từ chối: User ${payload.sub} không tồn tại hoặc bị khóa`,
        );
        client.disconnect(true);
        return;
      }

      // Lưu thông tin người dùng đã xác thực vào socket data
      client.data.user = {
        id: user.id,
        role: user.role,
      };

      // Tham gia phòng riêng của chính user đó: user:{authenticatedUserId}
      const room = `user:${user.id}`;
      await client.join(room);

      this.logger.log(`Client ${client.id} (User: ${user.id}) đã kết nối và vào phòng ${room}`);
    } catch (err: any) {
      this.logger.warn(`Client ${client.id} xác thực thất bại: ${err?.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.user?.id;
    this.logger.log(`Client ${client.id} (User: ${userId ?? 'anonymous'}) đã ngắt kết nối`);
  }

  /**
   * Trích xuất token từ handshake auth hoặc authorization header
   */
  private extractToken(client: Socket): string | null {
    // 1. Từ client auth option: io('/notifications', { auth: { token: '...' } })
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) {
      return authToken.startsWith('Bearer ') ? authToken.slice(7).trim() : authToken.trim();
    }

    // 2. Từ authorization header: headers: { authorization: 'Bearer ...' }
    const authHeader = client.handshake.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.trim()) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1].trim();
      }
      return authHeader.trim();
    }

    // 3. Từ query parameters: ?token=...
    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string' && queryToken.trim()) {
      return queryToken.trim();
    }

    return null;
  }

  /**
   * Phát event thông báo mới đến đúng phòng riêng của người nhận
   */
  sendNotificationToUser(userId: string, notification: NotificationPayload) {
    if (!this.server) {
      this.logger.warn(`WebSocketServer chưa sẵn sàng để gửi thông báo cho user ${userId}`);
      return;
    }
    const room = `user:${userId}`;
    this.server.to(room).emit('notification.created', notification);
    this.logger.debug(`Đã phát notification.created tới ${room}: ${notification.id}`);
  }

  /**
   * Phát event cập nhật đã đọc cho một thông báo
   */
  sendNotificationReadToUser(
    userId: string,
    data: { id: string; isRead: boolean; readAt: Date | string | null },
  ) {
    if (!this.server) return;
    const room = `user:${userId}`;
    this.server.to(room).emit('notification.read', data);
  }

  /**
   * Phát event cập nhật đã đọc tất cả
   */
  sendNotificationReadAllToUser(userId: string, data: { readAt: Date | string }) {
    if (!this.server) return;
    const room = `user:${userId}`;
    this.server.to(room).emit('notification.read_all', data);
  }
}
