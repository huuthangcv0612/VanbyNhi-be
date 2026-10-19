import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { GoogleCryptoService } from './google-crypto.service.js';
import { GoogleConnectionStatus } from '../../generated/prisma/client.js';
import type { GoogleCallbackQueryDto } from './dto/google-callback-query.dto.js';

interface GoogleStateItem {
  userId: string;
  expiresAt: number;
}

export interface GoogleUserProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

@Injectable()
export class GoogleAuthService implements OnModuleDestroy {
  private readonly logger = new Logger(GoogleAuthService.name);

  // In-memory state store chống CSRF, có TTL 10 phút
  private readonly stateStore = new Map<string, GoogleStateItem>();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly googleCryptoService: GoogleCryptoService,
  ) {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredStates();
    }, 3 * 60 * 1000);
    this.cleanupInterval.unref?.();
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private cleanupExpiredStates() {
    const now = Date.now();
    for (const [state, item] of this.stateStore.entries()) {
      if (now > item.expiresAt) {
        this.stateStore.delete(state);
      }
    }
  }

  /**
   * Sinh state bảo mật ngẫu nhiên chống CSRF và gắn chặt với userId của giáo viên
   */
  generateState(userId: string, ttlMs = 10 * 60 * 1000): string {
    const state = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + ttlMs;
    this.stateStore.set(state, { userId, expiresAt });
    return state;
  }

  /**
   * Xác thực và tiêu thụ state một lần (single-use)
   */
  validateAndConsumeState(state: string): string | null {
    if (!state) {
      return null;
    }
    const item = this.stateStore.get(state);
    if (!item) {
      return null;
    }
    // Tiêu thụ ngay lập tức để chống replay attack
    this.stateStore.delete(state);

    if (Date.now() > item.expiresAt) {
      return null;
    }
    return item.userId;
  }

  /**
   * Tạo URL ủy quyền Google OAuth2 Authorization Code Flow
   */
  getAuthorizationUrl(userId: string): string {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientId || !redirectUri) {
      this.logger.error(
        'Lỗi cấu hình: Thiếu GOOGLE_CLIENT_ID hoặc GOOGLE_REDIRECT_URI trong biến môi trường (.env)',
      );
      throw new InternalServerErrorException(
        'Lỗi cấu hình hệ thống: Không thể khởi tạo xác thực Google',
      );
    }

    const state = this.generateState(userId);

    // Scope tối thiểu cần thiết cho Google Meet Space và định danh người dùng
    const scopes = [
      'openid',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/meetings.space.created',
    ];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline', // Bắt buộc để nhận refresh token
      prompt: 'consent', // Đảm bảo Google luôn trả về refresh token
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Đổi Authorization Code lấy Google Tokens
   */
  async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    id_token?: string;
  }> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      this.logger.error(
        'Lỗi cấu hình: Thiếu GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET hoặc GOOGLE_REDIRECT_URI trong (.env)',
      );
      throw new InternalServerErrorException(
        'Lỗi cấu hình hệ thống: Không thể hoàn tất đổi token Google',
      );
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: AbortSignal.timeout(10000),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        this.logger.warn(
          `Google đổi mã token thất bại: ${data.error_description || data.error || response.statusText}`,
        );
        throw new BadRequestException(
          `Không thể đổi mã xác thực Google: ${data.error_description || data.error || 'Lỗi không xác định'}`,
        );
      }

      return data;
    } catch (err: any) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.error(`Lỗi kết nối tới Google Token Endpoint: ${err.message}`);
      throw new InternalServerErrorException(
        'Không thể kết nối tới máy chủ Google để xác thực mã',
      );
    }
  }

  /**
   * Lấy thông tin người dùng từ Google UserInfo API
   */
  async fetchUserProfile(accessToken: string): Promise<GoogleUserProfile> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(10000),
      });

      const data = await response.json();

      if (!response.ok || !data.sub) {
        this.logger.warn(`Google UserInfo thất bại: ${JSON.stringify(data)}`);
        throw new BadRequestException(
          'Không thể lấy thông tin định danh người dùng từ Google',
        );
      }

      return {
        sub: data.sub,
        email: data.email,
        email_verified: Boolean(data.email_verified),
        name: data.name,
        picture: data.picture,
      };
    } catch (err: any) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.error(`Lỗi khi gọi Google UserInfo API: ${err.message}`);
      throw new InternalServerErrorException(
        'Không thể xác thực thông tin tài khoản Google',
      );
    }
  }

  /**
   * Kiểm tra chính sách miền email (GOOGLE_ALLOWED_EMAIL_DOMAINS)
   */
  validateEmailDomain(email: string): void {
    const rawAllowedDomains = this.configService.get<string>(
      'GOOGLE_ALLOWED_EMAIL_DOMAINS',
    );
    if (!rawAllowedDomains || rawAllowedDomains.trim() === '') {
      return; // Không giới hạn miền
    }

    const allowedDomains = rawAllowedDomains
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    if (allowedDomains.length === 0) {
      return;
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain || !allowedDomains.includes(domain)) {
      throw new BadRequestException(
        `Miền email "${domain || 'không xác định'}" không nằm trong danh sách miền Google Workspace được trường học cho phép (${allowedDomains.join(', ')})`,
      );
    }
  }

  /**
   * Xử lý callback OAuth từ Google
   */
  async handleCallback(query: GoogleCallbackQueryDto) {
    if (query.error) {
      this.logger.warn(
        `Google OAuth bị từ chối hoặc lỗi: ${query.error_description || query.error}`,
      );
      throw new BadRequestException(
        `Xác thực Google bị từ chối: ${query.error_description || query.error}`,
      );
    }

    if (!query.code || !query.state) {
      throw new BadRequestException(
        'Thiếu mã code hoặc state từ phản hồi của Google',
      );
    }

    // 1. Xác thực và tiêu thụ state chống CSRF
    const userId = this.validateAndConsumeState(query.state);
    if (!userId) {
      throw new BadRequestException(
        'Mã state không hợp lệ hoặc đã hết hạn (CSRF verification failed)',
      );
    }

    // Kiểm tra tài khoản VanbyNhi có tồn tại và đang hoạt động không
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { googleAccount: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Tài khoản người dùng không tồn tại hoặc đã bị khóa',
      );
    }

    // 2. Đổi mã code lấy tokens
    const tokens = await this.exchangeCodeForTokens(query.code);

    // 3. Lấy thông tin danh tính từ Google
    const profile = await this.fetchUserProfile(tokens.access_token);

    // 4. Kiểm tra email_verified
    if (!profile.email_verified) {
      throw new BadRequestException(
        'Địa chỉ email Google chưa được xác minh (email_verified: false). Vui lòng xác minh với Google trước.',
      );
    }

    // 5. Kiểm tra chính sách miền email cấu hình
    this.validateEmailDomain(profile.email);

    // 6. Chống chiếm dụng tài khoản: Không cho phép Google account (sub) đã gắn với user VanbyNhi khác
    const existingGoogleOwner = await this.prisma.userGoogleAccount.findUnique({
      where: { googleSub: profile.sub },
    });

    if (existingGoogleOwner && existingGoogleOwner.userId !== userId) {
      throw new ConflictException(
        'Tài khoản Google Workspace này đã được liên kết với một tài khoản VanbyNhi khác',
      );
    }

    // 7. Xử lý refresh token và mã hóa
    let encryptedRefreshToken = user.googleAccount?.encryptedRefreshToken || null;
    if (tokens.refresh_token) {
      encryptedRefreshToken = this.googleCryptoService.encrypt(
        tokens.refresh_token,
      );
    } else if (!encryptedRefreshToken) {
      // Trường hợp Google không trả refresh token và trong DB chưa từng có
      throw new BadRequestException(
        'Google không trả về Refresh Token. Vui lòng ngắt quyền ứng dụng trên tài khoản Google và thực hiện liên kết lại.',
      );
    }

    // 8. Lưu hoặc cập nhật UserGoogleAccount trong database
    const savedAccount = await this.prisma.userGoogleAccount.upsert({
      where: { userId },
      update: {
        googleSub: profile.sub,
        email: profile.email,
        emailVerified: true,
        encryptedRefreshToken,
        status: GoogleConnectionStatus.CONNECTED,
        lastConnectedAt: new Date(),
      },
      create: {
        userId,
        googleSub: profile.sub,
        email: profile.email,
        emailVerified: true,
        encryptedRefreshToken,
        status: GoogleConnectionStatus.CONNECTED,
        lastConnectedAt: new Date(),
      },
    });

    // Không trả về tokens hay secrets
    return {
      message: 'Liên kết tài khoản Google thành công',
      googleAccount: {
        email: savedAccount.email,
        googleSub: savedAccount.googleSub,
        status: savedAccount.status,
        lastConnectedAt: savedAccount.lastConnectedAt,
      },
    };
  }

  /**
   * Lấy Access Token hợp lệ của giáo viên (tự động làm mới khi hết hạn)
   */
  async getValidAccessToken(userId: string): Promise<string> {
    const googleAccount = await this.prisma.userGoogleAccount.findUnique({
      where: { userId },
    });

    if (
      !googleAccount ||
      googleAccount.status !== GoogleConnectionStatus.CONNECTED ||
      !googleAccount.encryptedRefreshToken
    ) {
      throw new BadRequestException(
        'Tài khoản giáo viên chưa liên kết Google Workspace hoặc cần xác thực lại',
      );
    }

    let refreshToken: string;
    try {
      refreshToken = this.googleCryptoService.decrypt(
        googleAccount.encryptedRefreshToken,
      );
    } catch {
      await this.prisma.userGoogleAccount.update({
        where: { userId },
        data: { status: GoogleConnectionStatus.NEEDS_REAUTH },
      });
      throw new UnauthorizedException(
        'Không thể giải mã refresh token. Vui lòng liên kết lại tài khoản Google.',
      );
    }

    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    const body = new URLSearchParams({
      client_id: clientId || '',
      client_secret: clientSecret || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: AbortSignal.timeout(10000),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        // Xử lý token bị thu hồi (invalid_grant)
        if (data.error === 'invalid_grant' || response.status === 400 || response.status === 401) {
          this.logger.warn(
            `Google refresh token của user ${userId} bị từ chối/thu hồi: ${data.error_description || data.error}`,
          );
          await this.prisma.userGoogleAccount.update({
            where: { userId },
            data: { status: GoogleConnectionStatus.NEEDS_REAUTH },
          });
          throw new UnauthorizedException(
            'Quyền truy cập Google đã bị thu hồi hoặc hết hạn. Vui lòng liên kết lại tài khoản Google Workspace.',
          );
        }

        throw new InternalServerErrorException(
          `Không thể làm mới token Google: ${data.error_description || data.error}`,
        );
      }

      return data.access_token;
    } catch (err: any) {
      if (err instanceof UnauthorizedException || err instanceof BadRequestException) {
        throw err;
      }
      this.logger.error(`Lỗi khi gọi làm mới token Google: ${err.message}`);
      throw new InternalServerErrorException(
        'Không thể làm mới phiên xác thực Google',
      );
    }
  }

  /**
   * Xem trạng thái liên kết Google của giáo viên
   */
  async getConnectionStatus(userId: string) {
    const googleAccount = await this.prisma.userGoogleAccount.findUnique({
      where: { userId },
      select: {
        email: true,
        googleSub: true,
        status: true,
        lastConnectedAt: true,
      },
    });

    if (!googleAccount || googleAccount.status === GoogleConnectionStatus.DISCONNECTED) {
      return {
        isConnected: false,
        status: GoogleConnectionStatus.DISCONNECTED,
      };
    }

    return {
      isConnected: googleAccount.status === GoogleConnectionStatus.CONNECTED,
      status: googleAccount.status,
      email: googleAccount.email,
      lastConnectedAt: googleAccount.lastConnectedAt,
    };
  }

  /**
   * Ngắt liên kết tài khoản Google
   */
  async disconnect(userId: string) {
    const googleAccount = await this.prisma.userGoogleAccount.findUnique({
      where: { userId },
    });

    if (!googleAccount || googleAccount.status === GoogleConnectionStatus.DISCONNECTED) {
      throw new BadRequestException('Tài khoản chưa được liên kết với Google');
    }

    await this.prisma.userGoogleAccount.update({
      where: { userId },
      data: {
        status: GoogleConnectionStatus.DISCONNECTED,
        encryptedRefreshToken: null,
      },
    });

    return {
      message: 'Ngắt liên kết tài khoản Google thành công',
    };
  }
}
