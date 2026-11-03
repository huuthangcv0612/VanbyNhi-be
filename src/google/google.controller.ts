import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service.js';
import { GoogleConnectQueryDto } from './dto/google-connect-query.dto.js';
import { GoogleCallbackQueryDto } from './dto/google-callback-query.dto.js';
import { GoogleExchangeDto } from './dto/google-exchange.dto.js';
import { GoogleLinkDto } from './dto/google-link.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

export const OAUTH_ERROR_CODES = {
  ACCESS_DENIED: 'oauth_access_denied',
  INVALID_STATE: 'oauth_invalid_state',
  EXPIRED_STATE: 'oauth_expired_state',
  FAILED: 'oauth_failed',
  CONFIGURATION_ERROR: 'google_configuration_error',
} as const;

@Controller('google')
export class GoogleController {
  private readonly logger = new Logger(GoogleController.name);

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

  /**
   * Kiểm tra sơ bộ xem state có thuộc luồng đăng nhập (Google Login) hay không
   */
  private isLoginState(state?: string): boolean {
    if (!state || typeof state !== 'string') return false;
    try {
      const parts = state.split('.');
      if (parts.length !== 2) return false;
      const payload = Buffer.from(parts[0], 'base64url').toString('utf8');
      return payload.startsWith('login:anon:');
    } catch {
      return false;
    }
  }

  /**
   * Lấy URL frontend an toàn được cấu hình từ biến môi trường.
   * Ngăn chặn tuyệt đối open redirect và không chấp nhận URL tùy ý từ query parameter.
   */
  private getFrontendUrl(): string {
    const defaultUrl = 'https://vanby-nhi-fe.vercel.app';
    const configured = this.configService.get<string>('FRONTEND_URL');
    if (!configured || configured.trim() === '') {
      return defaultUrl;
    }

    try {
      const parsed = new URL(configured.trim());
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        this.logger.warn(
          `FRONTEND_URL có giao thức không an toàn (${parsed.protocol}), sử dụng mặc định: ${defaultUrl}`,
        );
        return defaultUrl;
      }
      return parsed.origin;
    } catch {
      this.logger.warn(
        `FRONTEND_URL không đúng định dạng URL (${configured}), sử dụng mặc định: ${defaultUrl}`,
      );
      return defaultUrl;
    }
  }

  /**
   * Chuẩn hóa mã lỗi và thông điệp người dùng an toàn.
   * Tuyệt đối không đưa err.message, stack trace hay lỗi cơ sở dữ liệu vào URL.
   */
  private mapToErrorCode(
    err: any,
    query?: GoogleCallbackQueryDto,
  ): {
    errorCode: string;
    safeMessage: string;
  } {
    const rawError = (query?.error || '').toLowerCase();
    const message = (err?.message || '').toLowerCase();

    // 1. Mã phát hành (issuer RFC 9207) không hợp lệ hoặc bị thiếu
    if (message.includes('issuer')) {
      return {
        errorCode: OAUTH_ERROR_CODES.INVALID_STATE,
        safeMessage: 'Mã xác thực không hợp lệ hoặc đã qua sử dụng. Vui lòng thử lại.',
      };
    }

    // 2. Người dùng từ chối cấp quyền trên màn hình Google Consent
    if (
      rawError === 'access_denied' ||
      message.includes('access_denied') ||
      message.includes('từ chối') ||
      message.includes('denied')
    ) {
      return {
        errorCode: OAUTH_ERROR_CODES.ACCESS_DENIED,
        safeMessage: 'Bạn đã từ chối cấp quyền truy cập Google Workspace',
      };
    }

    // 3. State hết hạn (TTL 10 phút)
    if (message.includes('hết hạn') || message.includes('expired')) {
      return {
        errorCode: OAUTH_ERROR_CODES.EXPIRED_STATE,
        safeMessage: 'Phiên xác thực đã hết hạn. Vui lòng thử lại.',
      };
    }

    // 4. State không hợp lệ / giả mạo / replay attack / thiếu mã code/state
    if (
      message.includes('state') ||
      message.includes('csrf') ||
      !query?.state ||
      !query?.code
    ) {
      return {
        errorCode: OAUTH_ERROR_CODES.INVALID_STATE,
        safeMessage: 'Mã xác thực không hợp lệ hoặc đã qua sử dụng. Vui lòng thử lại.',
      };
    }

    // 5. Lỗi cấu hình hệ thống / credentials
    if (
      message.includes('lỗi cấu hình') ||
      message.includes('google_client') ||
      message.includes('invalid_client')
    ) {
      return {
        errorCode: OAUTH_ERROR_CODES.CONFIGURATION_ERROR,
        safeMessage: 'Lỗi cấu hình hệ thống Google Workspace. Vui lòng liên hệ quản trị viên.',
      };
    }

    // 5. Lỗi mặc định (database timeout, network error, lỗi không xác định)
    return {
      errorCode: OAUTH_ERROR_CODES.FAILED,
      safeMessage: 'Xác thực Google Workspace thất bại. Vui lòng thử lại sau.',
    };
  }

  /**
   * GET /google/login — Khởi tạo luồng Đăng nhập bằng Google (Public)
   */
  @Get('login')
  async googleLogin(
    @Query() query: GoogleConnectQueryDto,
    @Res() res: Response,
    @Req() req?: Request,
  ) {
    const authorizationUrl = await this.googleAuthService.getLoginAuthorizationUrl();

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
   * POST /google/exchange — Đổi vé ticket lấy JWT access token và refresh token của VanbyNhi (Public)
   */
  @Post('exchange')
  @HttpCode(HttpStatus.OK)
  async exchangeTicket(@Body() dto: GoogleExchangeDto) {
    const data = await this.googleAuthService.consumeExchangeTicket(dto.ticket);
    if (!data) {
      throw new UnauthorizedException('Mã xác thực ticket không hợp lệ hoặc đã hết hạn');
    }
    return data;
  }

  /**
   * POST /google/link — Xác minh mật khẩu tài khoản VanbyNhi và hoàn tất liên kết với Google (Public)
   */
  @Post('link')
  @HttpCode(HttpStatus.OK)
  async linkGoogle(@Body() dto: GoogleLinkDto) {
    return this.googleAuthService.linkGoogleAccount(dto);
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
    const authorizationUrl = await this.googleAuthService.getAuthorizationUrl(userId);

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
   * GET /google/callback — Nhận phản hồi chuyển hướng từ Google OAuth (Xử lý cả Login và Linking)
   */
  @Get('callback')
  async googleCallback(
    @Query() query: GoogleCallbackQueryDto,
    @Res() res: Response,
  ) {
    const frontendUrl = this.getFrontendUrl();
    const isLoginFlow = this.isLoginState(query?.state);

    try {
      const result = await this.googleAuthService.handleCallback(query);

      // Trường hợp 1: Phản hồi từ luồng Đăng nhập (Google Login)
      if (result.isLogin) {
        if (result.isLinked && result.ticket) {
          if (frontendUrl && query?.format !== 'json') {
            const redirectUrl = new URL(frontendUrl);
            redirectUrl.pathname = '/auth/google/callback';
            redirectUrl.searchParams.set('ticket', result.ticket);
            redirectUrl.searchParams.set('isLinked', 'true');
            return res.redirect(redirectUrl.toString());
          }
          return res.status(HttpStatus.OK).json(result.loginResult);
        } else if (result.linkTicket) {
          if (frontendUrl && query?.format !== 'json') {
            const redirectUrl = new URL(frontendUrl);
            redirectUrl.pathname = '/auth/google/callback';
            redirectUrl.searchParams.set('linkTicket', result.linkTicket);
            redirectUrl.searchParams.set('isLinked', 'false');
            if (result.email) {
              redirectUrl.searchParams.set('email', result.email);
            }
            return res.redirect(redirectUrl.toString());
          }
          return res.status(HttpStatus.OK).json({
            isLinked: false,
            linkTicket: result.linkTicket,
            email: result.email,
          });
        }
      }

      // Trường hợp 2: Phản hồi từ luồng Liên kết tài khoản (Google Linking trong Cài đặt Giáo viên)
      if (frontendUrl && query?.format !== 'json') {
        const redirectUrl = new URL(frontendUrl);
        redirectUrl.pathname = '/teacher/settings/google';
        redirectUrl.searchParams.set('status', 'success');
        if (result.googleAccount?.email) {
          redirectUrl.searchParams.set('email', result.googleAccount.email);
        }
        return res.redirect(redirectUrl.toString());
      }

      return res.status(HttpStatus.OK).json(result);
    } catch (err: any) {
      const { errorCode, safeMessage } = this.mapToErrorCode(err, query);

      // Server log an toàn: Chỉ log mã lỗi chuẩn hóa, không log token/secret/code
      this.logger.error(`Google OAuth callback thất bại [${errorCode}]`);

      if (frontendUrl && query?.format !== 'json') {
        const redirectUrl = new URL(frontendUrl);
        // Định tuyến trang lỗi theo đúng ngữ cảnh luồng
        redirectUrl.pathname = isLoginFlow
          ? '/auth/google/callback'
          : '/teacher/settings/google';
        redirectUrl.searchParams.set('status', 'error');
        redirectUrl.searchParams.set('error_code', errorCode);
        redirectUrl.searchParams.set('message', safeMessage);
        return res.redirect(redirectUrl.toString());
      }

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error_code: errorCode,
        message: safeMessage,
      });
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
