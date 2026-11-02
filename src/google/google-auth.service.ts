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

  // In-memory state store chống CSRF, TTL 10 phút
  private readonly stateStore = new Map<string, GoogleStateItem>();
  // Bộ lưu trữ state đã tiêu thụ để chống replay attack ngay cả khi có multi-node hoặc signed state
  private readonly consumedStates = new Map<string, number>();
  private readonly cleanupInterval: NodeJS.Timeout;
  private readonly hmacSecret: Buffer;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly googleCryptoService: GoogleCryptoService,
  ) {
    const rawSecret =
      this.configService.get<string>('GOOGLE_TOKEN_ENCRYPTION_KEY') ||
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      'vanbynhi-state-csrf-secret-fallback-key-32b';
    this.hmacSecret = crypto.createHash('sha256').update(rawSecret).digest();

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
    for (const [state, expiresAt] of this.consumedStates.entries()) {
      if (now > expiresAt) {
        this.consumedStates.delete(state);
      }
    }
  }

  /**
   * Lấy URI chuyển hướng callback của Google OAuth.
   * Ưu tiên GOOGLE_REDIRECT_URI; nếu thiếu trên Render, tự động fallback theo RENDER_EXTERNAL_URL.
   */
  getRedirectUri(): string {
    const configured = this.configService.get<string>('GOOGLE_REDIRECT_URI');
    if (configured && configured.trim() !== '') {
      return configured.trim();
    }
    const renderUrl = this.configService.get<string>('RENDER_EXTERNAL_URL');
    if (renderUrl && renderUrl.trim() !== '') {
      return `${renderUrl.replace(/\/+$/, '')}/google/callback`;
    }
    return '';
  }

  /**
   * Sinh state bảo mật ngẫu nhiên chống CSRF gắn chặt với userId của giáo viên,
   * có chữ ký HMAC chống giả mạo kể cả khi server khởi động lại (Render cold restart).
   */
  generateState(userId: string, ttlMs = 10 * 60 * 1000): string {
    if (!userId) {
      throw new BadRequestException('userId là bắt buộc để sinh OAuth state');
    }

    const expiresAt = Date.now() + ttlMs;
    const nonce = crypto.randomBytes(16).toString('hex');
    const payload = `${userId}:${expiresAt}:${nonce}`;
    const signature = crypto
      .createHmac('sha256', this.hmacSecret)
      .update(payload)
      .digest('hex');

    const state = `${Buffer.from(payload, 'utf8').toString('base64url')}.${signature}`;
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

    // 1. Kiểm tra xem state đã bị tiêu thụ trước đó chưa (chống replay attack)
    if (this.consumedStates.has(state)) {
      return null;
    }

    // 2. Kiểm tra trong bộ nhớ in-memory
    const memoryItem = this.stateStore.get(state);
    if (memoryItem) {
      this.stateStore.delete(state);
      this.consumedStates.set(state, memoryItem.expiresAt);
      if (Date.now() > memoryItem.expiresAt) {
        return null;
      }
      return memoryItem.userId;
    }

    // 3. Fallback giải mã và kiểm tra chữ ký HMAC (khi server bị restart hoặc state phân tán)
    const parts = state.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [encodedPayload, receivedSignature] = parts;
    try {
      const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
      const expectedSignature = crypto
        .createHmac('sha256', this.hmacSecret)
        .update(payload)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'hex');
      const receivedBuf = Buffer.from(receivedSignature, 'hex');
      if (
        expectedBuf.length !== receivedBuf.length ||
        !crypto.timingSafeEqual(expectedBuf, receivedBuf)
      ) {
        return null;
      }

      const [userId, expiresAtStr] = payload.split(':');
      const expiresAt = parseInt(expiresAtStr, 10);
      if (!userId || !expiresAt || Date.now() > expiresAt) {
        return null;
      }

      this.consumedStates.set(state, expiresAt);
      return userId;
    } catch {
      return null;
    }
  }

  /**
   * Tạo URL ủy quyền Google OAuth2 Authorization Code Flow
   */
  getAuthorizationUrl(userId: string): string {
    if (!userId) {
      throw new UnauthorizedException(
        'Không tìm thấy thông tin người dùng để khởi tạo kết nối Google',
      );
    }

    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.getRedirectUri();

    if (!clientId) {
      this.logger.error(
        'Lỗi cấu hình: Thiếu GOOGLE_CLIENT_ID trong biến môi trường hệ thống',
      );
      throw new InternalServerErrorException(
        'Lỗi cấu hình hệ thống: Chưa thiết lập GOOGLE_CLIENT_ID',
      );
    }

    if (!redirectUri) {
      this.logger.error(
        'Lỗi cấu hình: Thiếu GOOGLE_REDIRECT_URI hoặc RENDER_EXTERNAL_URL trong biến môi trường',
      );
      throw new InternalServerErrorException(
        'Lỗi cấu hình hệ thống: Chưa thiết lập GOOGLE_REDIRECT_URI',
      );
    }

    const state = this.generateState(userId);

    // Scopes tối thiểu cần thiết cho Google Meet Space và định danh tài khoản giáo viên
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
      access_type: 'offline', // Bắt buộc để Google phát refresh token
      prompt: 'consent', // Đảm bảo Google cấp refresh token
      include_granted_scopes: 'true',
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
    const redirectUri = this.getRedirectUri();

    if (!clientId || !clientSecret || !redirectUri) {
      this.logger.error(
        'Lỗi cấu hình: Thiếu GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET hoặc GOOGLE_REDIRECT_URI trong biến môi trường',
      );
      throw new InternalServerErrorException(
        'Lỗi cấu hình hệ thống: Không thể hoàn tất đổi token Google do thiếu biến môi trường',
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
        this.logger.warn(
          `Google UserInfo thất bại: HTTP ${response.status} - ${data?.error?.message || data?.error || 'Unknown'}`,
        );
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

    // 6. Chống chiếm dụng tài khoản & chống bản ghi trùng:
    // Kiểm tra xem googleSub này đã gắn với user VanbyNhi nào khác chưa
    const existingGoogleOwner = await this.prisma.userGoogleAccount.findUnique({
      where: { googleSub: profile.sub },
    });

    if (existingGoogleOwner && existingGoogleOwner.userId !== userId) {
      if (existingGoogleOwner.status === GoogleConnectionStatus.DISCONNECTED) {
        // Tài khoản cũ đã ngắt liên kết, xóa bản ghi cũ để giải phóng googleSub tránh xung đột unique constraint
        await this.prisma.userGoogleAccount.delete({
          where: { id: existingGoogleOwner.id },
        });
      } else {
        throw new ConflictException(
          'Tài khoản Google Workspace này đã được liên kết với một tài khoản VanbyNhi khác',
        );
      }
    }

    // 7. Xử lý refresh token và mã hóa (tuyệt đối không lưu plaintext)
    let encryptedRefreshToken = user.googleAccount?.encryptedRefreshToken || null;
    if (tokens.refresh_token) {
      encryptedRefreshToken = this.googleCryptoService.encrypt(
        tokens.refresh_token,
      );
    } else if (encryptedRefreshToken) {
      // Giữ lại refresh token cũ khi Google không trả token mới.
      // Nếu dữ liệu cũ là plaintext, tự động mã hóa lại để bảo mật tuyệt đối.
      if (!this.googleCryptoService.isEncrypted(encryptedRefreshToken)) {
        encryptedRefreshToken = this.googleCryptoService.encrypt(
          this.googleCryptoService.decrypt(encryptedRefreshToken),
        );
      }
    } else {
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

      // Tự động nâng cấp mã hóa nếu phát hiện dữ liệu cũ là plaintext
      if (!this.googleCryptoService.isEncrypted(googleAccount.encryptedRefreshToken)) {
        await this.prisma.userGoogleAccount.update({
          where: { userId },
          data: {
            encryptedRefreshToken: this.googleCryptoService.encrypt(refreshToken),
          },
        });
      }
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

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException(
        'Lỗi cấu hình hệ thống: Thiếu GOOGLE_CLIENT_ID hoặc GOOGLE_CLIENT_SECRET để làm mới token Google',
      );
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
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
    if (!userId) {
      return {
        isConnected: false,
        status: GoogleConnectionStatus.DISCONNECTED,
      };
    }

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
