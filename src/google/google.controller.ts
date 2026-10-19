import {
  Controller,
  Get,
  Delete,
  Query,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
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

  /**
   * GET /google/connection — Xem trạng thái liên kết Google Workspace của người dùng
   */
  @Get('connection')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getConnectionStatus(@CurrentUser('sub') userId: string) {
    return this.googleAuthService.getConnectionStatus(userId);
  }

  /**
   * GET /google/connect — Khởi tạo luồng OAuth 2.0 Authorization Code Flow
   */
  @Get('connect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async connectGoogle(
    @CurrentUser('sub') userId: string,
    @Query() query: GoogleConnectQueryDto,
    @Res() res: Response,
  ) {
    const authorizationUrl = this.googleAuthService.getAuthorizationUrl(userId);

    if (query?.format === 'json') {
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
    const result = await this.googleAuthService.handleCallback(query);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (frontendUrl && query?.format !== 'json') {
      const redirectUrl = new URL(frontendUrl);
      redirectUrl.pathname = '/teacher/settings/google';
      redirectUrl.searchParams.set('status', 'success');
      redirectUrl.searchParams.set('email', result.googleAccount.email);
      return res.redirect(redirectUrl.toString());
    }

    return res.status(HttpStatus.OK).json(result);
  }

  /**
   * DELETE /google/connection — Ngắt liên kết tài khoản Google
   */
  @Delete('connection')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async disconnectGoogle(@CurrentUser('sub') userId: string) {
    return this.googleAuthService.disconnect(userId);
  }
}
