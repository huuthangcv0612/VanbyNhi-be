import {
  Injectable,
  UnauthorizedException,
  Logger,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { JwtPayload } from '../interfaces/jwt-payload.interface.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Yêu cầu xác thực: Token không được cung cấp');
    }

    const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      this.logger.error(
        'Lỗi cấu hình: JWT_ACCESS_SECRET chưa được cấu hình trong biến môi trường (.env)',
      );
      throw new UnauthorizedException('Lỗi cấu hình xác thực máy chủ');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });

      // Kiểm tra trạng thái tài khoản thực tế từ database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, isActive: true, role: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị vô hiệu hóa');
      }

      // Cập nhật lại role mới nhất nếu có thay đổi từ DB
      payload.role = user.role;

      (request as any).user = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : undefined;
  }
}
