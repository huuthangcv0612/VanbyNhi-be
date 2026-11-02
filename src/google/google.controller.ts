import {
  Controller,
  Get,
  Delete,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service.js';
import { GoogleConnectQueryDto } from './dto/google-connect-query.dto.js';
import { GoogleCallbackQueryDto } from './dto/google-callback-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('google')
export class GoogleController {
  constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly configService: ConfigService,
  ) {}

  private extractUserId(user: any): string {
    const userId = typeof user === 'string' ? user : (user?.sub || user?.id);
    if (!userId) {
      throw new UnauthorizedException(
        'Không tìm thấy thông tin định danh người dùng từ token xác thực',
      );
    }
    return userId;
  }

  private getFrontendUrl(): string {
    const configured = this.configService.get<string>('FRONTEND_URL');
    if (configured && configured.trim() !== '') {
      return configured.trim();
    }
    return 'https://vanby-nhi-fe.vercel.app';
  }

  /**
   * GET /google/connection — Xem trạng thái liên kết Google Workspace của người dùng
   */
  @Get('connection')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getConnectionStatus(@CurrentUser() user: any) {
    const userId = this.extractUserId(user);
    return this.googleAuthService.getConnectionStatus(userId);
  }

  /**
   * GET /google/connect — Khởi tạo luồng OAuth 2.0 Authorization Code Flow
   */
  @Get('connect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async connectGoogle(
    @CurrentUser() user: any,
    @Query() query: GoogleConnectQueryDto,
    @Res() res: Response,
    @Req() req?: Request,
  ) {
    const userId = this.extractUserId(user);
    const authorizationUrl = this.googleAuthService.getAuthorizationUrl(userId);

    const isJsonRequested =
      query?.format === 'json' ||
      Boolean(req?.headers?.['accept']?.includes('application/json'));

    if (isJsonRequested) {
      if (typeof res.status === 'function') {
        res.status(HttpStatus.OK);
      }
      return res.json({ authorizationUrl });
    }

    return res.redirect(authorizationUrl);
  }

  /**
   * GET /google/callback — Nhận phản hồi chuyển hướng từ Google OAuth
   */
  @Get('callback')
  async googleCallback(
    @Query() query: GoogleCallbackQueryDto,
    @Res() res: Response,
  ) {
    const frontendUrl = this.getFrontendUrl();

    try {
      const result = await this.googleAuthService.handleCallback(query);

      if (frontendUrl && query?.format !== 'json') {
        const redirectUrl = new URL(frontendUrl);
        redirectUrl.pathname = '/teacher/settings/google';
        redirectUrl.searchParams.set('status', 'success');
        redirectUrl.searchParams.set('email', result.googleAccount.email);
        return res.redirect(redirectUrl.toString());
      }

      return res.status(HttpStatus.OK).json(result);
    } catch (err: any) {
      if (frontendUrl && query?.format !== 'json') {
        const redirectUrl = new URL(frontendUrl);
        redirectUrl.pathname = '/teacher/settings/google';
        redirectUrl.searchParams.set('status', 'error');
        redirectUrl.searchParams.set(
          'message',
          err.message || 'Xác thực Google Workspace thất bại',
        );
        return res.redirect(redirectUrl.toString());
      }
      throw err;
    }
  }

  /**
   * DELETE /google/connection — Ngắt liên kết tài khoản Google
   */
  @Delete('connection')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async disconnectGoogle(@CurrentUser() user: any) {
    const userId = this.extractUserId(user);
    return this.googleAuthService.disconnect(userId);
  }
}
