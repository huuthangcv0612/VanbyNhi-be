import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  BadGatewayException,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { GoogleCryptoService } from './google-crypto.service.js';
import { GoogleConnectionStatus } from '../../generated/prisma/client.js';
import type { GoogleCallbackQueryDto } from './dto/google-callback-query.dto.js';
import type { GoogleLinkDto } from './dto/google-link.dto.js';
import { AuthService } from '../auth/auth.service.js';

export interface GoogleUserProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

@Injectable()
export class GoogleAuthService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GoogleAuthService.name);

  private readonly cleanupInterval: NodeJS.Timeout;
  private readonly hmacSecret: Buffer;
  private isTableInitialized = false;
  private isTicketTableInitialized = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly googleCryptoService: GoogleCryptoService,
    @Optional() private readonly authService?: AuthService,
  ) {
    const stateSecret = this.configService.get<string>('GOOGLE_OAUTH_STATE_SECRET');
    if (!stateSecret || typeof stateSecret !== 'string' || stateSecret.trim() === '') {
      throw new InternalServerErrorException(
        'Lỗi cấu hình hệ thống: Biến môi trường GOOGLE_OAUTH_STATE_SECRET là bắt buộc để ký HMAC cho OAuth state chống CSRF',
      );
    }

    const encryptionKey = this.configService.get<string>('GOOGLE_TOKEN_ENCRYPTION_KEY');
    if (encryptionKey && stateSecret.trim() === encryptionKey.trim()) {
      throw new InternalServerErrorException(
        'Lỗi cấu hình bảo mật: GOOGLE_OAUTH_STATE_SECRET không được dùng chung giá trị với GOOGLE_TOKEN_ENCRYPTION_KEY',
      );
    }

    this.hmacSecret = crypto.createHash('sha256').update(stateSecret.trim()).digest();

    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredStates().catch((err) => {
        this.logger.warn(this.safeDbErrorMessage('Dọn dẹp OAuth state hết hạn thất bại', err));
      });
    }, 10 * 60 * 1000);
    this.cleanupInterval.unref?.();
  }

  /**
   * Tạo thông báo lỗi database an toàn: trong Production tuyệt đối không in raw err.message
   */
  private safeDbErrorMessage(operation: string, err?: any): string {
    const rawNodeEnv = this.configService.get<string>('NODE_ENV') ?? process.env.NODE_ENV;
    const isProd = typeof rawNodeEnv === 'string' && rawNodeEnv.trim().toLowerCase() === 'production';
    if (isProd) {
      return `${operation} do lỗi cơ sở dữ liệu`;
    }
    return `${operation}: ${err?.message || 'Lỗi không xác định'}`;
  }

  async onModuleInit() {
    await this.ensureStateTable();
    await this.ensureTicketTable();
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Đảm bảo bảng lưu OAuth State trong PostgreSQL tồn tại.
   * Tách CREATE TABLE và CREATE INDEX thành các câu lệnh độc lập.
   * Không nuốt lỗi; nếu lỗi xảy ra, fail closed ngay.
   */
  async ensureStateTable(): Promise<void> {
    if (this.isTableInitialized) return;

    if (!this.prisma || typeof this.prisma.$executeRawUnsafe !== 'function') {
      this.isTableInitialized = false;
      throw new InternalServerErrorException(
        'Dịch vụ cơ sở dữ liệu không sẵn sàng để quản lý OAuth state',
      );
    }

    try {
      // 1. Tạo bảng độc lập
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "google_oauth_states" (
          "state_hash" VARCHAR(64) PRIMARY KEY,
          "user_id" VARCHAR(64) NOT NULL,
          "expires_at" TIMESTAMP(3) NOT NULL,
          "is_consumed" BOOLEAN NOT NULL DEFAULT false,
          "consumed_at" TIMESTAMP(3),
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 2. Tạo index cho expires_at độc lập
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "idx_google_oauth_states_expires_at" ON "google_oauth_states"("expires_at")
      `);

      // 3. Tạo index cho user_id độc lập
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "idx_google_oauth_states_user_id" ON "google_oauth_states"("user_id")
      `);

      this.isTableInitialized = true;
    } catch (err: any) {
      this.isTableInitialized = false;
      this.logger.error(this.safeDbErrorMessage('Khởi tạo bảng google_oauth_states thất bại', err));
      throw new InternalServerErrorException(
        'Không thể khởi tạo bảng lưu trữ OAuth State trong cơ sở dữ liệu (Fail closed)',
      );
    }
  }

  /**
   * Đảm bảo bảng lưu Durable OAuth Tickets trong PostgreSQL tồn tại.
   * Thay thế hoàn toàn in-memory ticket store trong RAM để kháng restart và hỗ trợ multi-instance.
   */
  async ensureTicketTable(): Promise<void> {
    if (this.isTicketTableInitialized) return;

    if (!this.prisma || typeof this.prisma.$executeRawUnsafe !== 'function') {
      this.isTicketTableInitialized = false;
      throw new InternalServerErrorException(
        'Dịch vụ cơ sở dữ liệu không sẵn sàng để quản lý OAuth tickets',
      );
    }

    try {
      // 1. Tạo bảng google_oauth_tickets
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "google_oauth_tickets" (
          "ticket_hash" VARCHAR(64) PRIMARY KEY,
          "ticket_type" VARCHAR(32) NOT NULL,
          "payload" TEXT NOT NULL,
          "expires_at" TIMESTAMP(3) NOT NULL,
          "is_consumed" BOOLEAN NOT NULL DEFAULT false,
          "consumed_at" TIMESTAMP(3),
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 2. Tạo index cho expires_at
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "idx_google_oauth_tickets_expires_at" ON "google_oauth_tickets"("expires_at")
      `);

      // 3. Tạo index cho ticket_type
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "idx_google_oauth_tickets_type" ON "google_oauth_tickets"("ticket_type")
      `);

      this.isTicketTableInitialized = true;
    } catch (err: any) {
      this.isTicketTableInitialized = false;
      this.logger.error(this.safeDbErrorMessage('Khởi tạo bảng google_oauth_tickets thất bại', err));
      throw new InternalServerErrorException(
        'Không thể khởi tạo bảng lưu trữ OAuth Ticket trong cơ sở dữ liệu (Fail closed)',
      );
    }
  }

  /**
   * Định kỳ dọn dẹp các state và ticket đã hết hạn trong PostgreSQL
   */
  private async cleanupExpiredStates(): Promise<void> {
    try {
      if (typeof this.prisma?.$executeRawUnsafe === 'function') {
        await this.prisma.$executeRawUnsafe(
          `DELETE FROM "google_oauth_states" WHERE "expires_at" < NOW() - INTERVAL '1 hour'`,
        );
        await this.prisma.$executeRawUnsafe(
          `DELETE FROM "google_oauth_tickets" WHERE "expires_at" < NOW() - INTERVAL '1 hour'`,
        );
      }
    } catch {
      // Bỏ qua lỗi kết nối tạm thời khi server đang tắt hoặc mạng ngắt
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
   * Lưu trữ Durable OAuth Ticket vào PostgreSQL với mã băm SHA-256 và mã hóa AES-256-GCM payload
   */
  async saveTicket(type: 'EXCHANGE' | 'LINK', payload: any, ttlMs: number): Promise<string> {
    await this.ensureTicketTable();

    const ticket = crypto.randomBytes(32).toString('hex');
    const ticketHash = crypto.createHash('sha256').update(ticket).digest('hex');
    const expiresAt = new Date(Date.now() + ttlMs);

    const serialized = JSON.stringify(payload);
    const encryptedPayload = this.googleCryptoService.encrypt(serialized);

    if (!this.prisma || typeof this.prisma.$executeRawUnsafe !== 'function') {
      throw new InternalServerErrorException('Cơ sở dữ liệu không sẵn sàng để lưu trữ OAuth ticket');
    }

    try {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO "google_oauth_tickets" ("ticket_hash", "ticket_type", "payload", "expires_at", "is_consumed")
         VALUES ($1, $2, $3, $4, false)
         ON CONFLICT ("ticket_hash") DO NOTHING`,
        ticketHash,
        type,
        encryptedPayload,
        expiresAt,
      );
    } catch (err: any) {
      this.logger.error(this.safeDbErrorMessage('Lưu OAuth ticket vào PostgreSQL thất bại', err));
      throw new InternalServerErrorException('Không thể khởi tạo phiên xác thực bảo mật OAuth do lỗi cơ sở dữ liệu');
    }

    return ticket;
  }

  /**
   * Kiểm tra thông tin Durable OAuth Ticket hợp lệ mà không tiêu thụ trước (dùng cho linkTicket khi xác minh mật khẩu)
   */
  async peekTicket<T = any>(type: 'EXCHANGE' | 'LINK', ticket: string): Promise<T | null> {
    if (!ticket || typeof ticket !== 'string') {
      return null;
    }

    try {
      await this.ensureTicketTable();
    } catch {
      return null;
    }

    const ticketHash = crypto.createHash('sha256').update(ticket).digest('hex');
    const now = new Date();

    if (!this.prisma || typeof this.prisma.$queryRawUnsafe !== 'function') {
      return null;
    }

    try {
      const rows: Array<{ payload: string }> = await this.prisma.$queryRawUnsafe(
        `SELECT "payload" FROM "google_oauth_tickets"
         WHERE "ticket_hash" = $1 AND "ticket_type" = $2 AND "is_consumed" = false AND "expires_at" > $3
         LIMIT 1`,
        ticketHash,
        type,
        now,
      );

      if (!rows || rows.length === 0) {
        return null;
      }

      const encryptedPayload = rows[0].payload;
      const decrypted = this.googleCryptoService.decrypt(encryptedPayload);
      return JSON.parse(decrypted) as T;
    } catch (err: any) {
      this.logger.error(this.safeDbErrorMessage('Lỗi khi đọc OAuth ticket từ PostgreSQL', err));
      return null;
    }
  }

  /**
   * Tiêu thụ nguyên tử (atomic consume) Durable OAuth Ticket từ PostgreSQL (single-use, chống race condition & replay)
   */
  async consumeTicket<T = any>(type: 'EXCHANGE' | 'LINK', ticket: string): Promise<T | null> {
    if (!ticket || typeof ticket !== 'string') {
      return null;
    }

    try {
      await this.ensureTicketTable();
    } catch {
      return null;
    }

    const ticketHash = crypto.createHash('sha256').update(ticket).digest('hex');
    const now = new Date();

    if (!this.prisma || typeof this.prisma.$queryRawUnsafe !== 'function') {
      return null;
    }

    try {
      const rows: Array<{ payload: string }> = await this.prisma.$queryRawUnsafe(
        `UPDATE "google_oauth_tickets"
         SET "is_consumed" = true, "consumed_at" = $1
         WHERE "ticket_hash" = $2 AND "ticket_type" = $3 AND "is_consumed" = false AND "expires_at" > $1
         RETURNING "payload"`,
        now,
        ticketHash,
        type,
      );

      if (!rows || rows.length === 0) {
        return null;
      }

      const encryptedPayload = rows[0].payload;
      const decrypted = this.googleCryptoService.decrypt(encryptedPayload);
      return JSON.parse(decrypted) as T;
    } catch (err: any) {
      this.logger.error(this.safeDbErrorMessage('Lỗi khi atomic consume OAuth ticket trên PostgreSQL', err));
      return null;
    }
  }

  /**
   * Tạo vé đổi token một lần (Single-use Exchange Ticket) lưu bền vững trong PostgreSQL
   * Ngăn chặn việc truyền JWT token trực tiếp trên URL trình duyệt
   */
  async createExchangeTicket(payload: any, ttlMs = 2 * 60 * 1000): Promise<string> {
    return this.saveTicket('EXCHANGE', payload, ttlMs);
  }

  /**
   * Tiêu thụ vé đổi token một lần từ PostgreSQL
   */
  async consumeExchangeTicket(ticket: string): Promise<any | null> {
    return this.consumeTicket('EXCHANGE', ticket);
  }

  /**
   * Tạo vé liên kết tài khoản một lần (Link Ticket) lưu bền vững trong PostgreSQL có thời hạn 10 phút
   * Cho phép người dùng xác minh mật khẩu VanbyNhi trước khi gắn kết googleSub
   */
  async createLinkTicket(
    profile: GoogleUserProfile,
    ttlMs = 10 * 60 * 1000,
  ): Promise<string> {
    return this.saveTicket('LINK', profile, ttlMs);
  }

  /**
   * Tiêu thụ vé liên kết tài khoản một lần từ PostgreSQL
   */
  async consumeLinkTicket(ticket: string): Promise<GoogleUserProfile | null> {
    return this.consumeTicket<GoogleUserProfile>('LINK', ticket);
  }

  /**
   * Sinh OAuth state dành riêng cho luồng Đăng nhập bằng Google (chưa đăng nhập)
   */
  async generateLoginState(ttlMs = 10 * 60 * 1000): Promise<string> {
    return this.generateState('login:anon', ttlMs);
  }

  /**
   * Tạo URL ủy quyền Google OAuth2 dành cho luồng Đăng nhập (Google Login)
   */
  async getLoginAuthorizationUrl(): Promise<string> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.getRedirectUri();

    if (!clientId) {
      this.logger.error('Lỗi cấu hình: Thiếu GOOGLE_CLIENT_ID trong biến môi trường hệ thống');
      throw new InternalServerErrorException('Lỗi cấu hình hệ thống: Chưa thiết lập GOOGLE_CLIENT_ID');
    }

    if (!redirectUri) {
      this.logger.error('Lỗi cấu hình: Thiếu GOOGLE_REDIRECT_URI hoặc RENDER_EXTERNAL_URL trong biến môi trường');
      throw new InternalServerErrorException('Lỗi cấu hình hệ thống: Chưa thiết lập GOOGLE_REDIRECT_URI');
    }

    const state = await this.generateLoginState();

    const scopes = [
      'openid',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      prompt: 'select_account',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Sinh state bảo mật ngẫu nhiên chống CSRF gắn chặt với userId của giáo viên.
   * Bắt buộc lưu thành công vào PostgreSQL trước khi trả về state.
   * Nếu lưu database thất bại, tuyệt đối không trả về state (Fail closed).
   */
  async generateState(userId: string, ttlMs = 10 * 60 * 1000): Promise<string> {
    if (!userId) {
      throw new BadRequestException('userId là bắt buộc để sinh OAuth state');
    }

    // Đảm bảo bảng đã sẵn sàng (ném lỗi nếu fail)
    await this.ensureStateTable();

    const expiresAt = new Date(Date.now() + ttlMs);
    const nonce = crypto.randomBytes(32).toString('hex');
    const payload = `${userId}:${expiresAt.getTime()}:${nonce}`;
    const signature = crypto
      .createHmac('sha256', this.hmacSecret)
      .update(payload)
      .digest('hex');

    const state = `${Buffer.from(payload, 'utf8').toString('base64url')}.${signature}`;
    const stateHash = crypto.createHash('sha256').update(state).digest('hex');

    if (!this.prisma || typeof this.prisma.$executeRawUnsafe !== 'function') {
      throw new InternalServerErrorException(
        'Dịch vụ cơ sở dữ liệu không sẵn sàng để lưu OAuth state',
      );
    }

    try {
      const affected = await this.prisma.$executeRawUnsafe(
        `INSERT INTO "google_oauth_states" ("state_hash", "user_id", "expires_at", "is_consumed")
         VALUES ($1, $2, $3, false)
         ON CONFLICT ("state_hash") DO NOTHING`,
        stateHash,
        userId,
        expiresAt,
      );

      if (typeof affected === 'number' && affected === 0) {
        throw new InternalServerErrorException('Xung đột mã state trong cơ sở dữ liệu');
      }
    } catch (err: any) {
      this.logger.error(this.safeDbErrorMessage('Lưu OAuth state vào PostgreSQL thất bại', err));
      throw new InternalServerErrorException(
        'Không thể khởi tạo phiên xác thực bảo mật OAuth do lỗi cơ sở dữ liệu',
      );
    }

    return state;
  }

  /**
   * Xác thực và tiêu thụ state một lần (single-use) thông qua thao tác atomic trên PostgreSQL.
   * Nếu cơ sở dữ liệu gặp lỗi, fail closed ngay (trả về null), tuyệt đối không xác thực thành công.
   */
  async validateAndConsumeState(state: string): Promise<string | null> {
    if (!state || typeof state !== 'string') {
      return null;
    }

    // 1. Phân tích cấu trúc state [payload].[signature]
    const parts = state.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [encodedPayload, receivedSignature] = parts;
    let payload: string;
    try {
      payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    } catch {
      return null;
    }

    // 2. Kiểm tra chữ ký HMAC chống giả mạo (Constant-time comparison)
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

    // 3. Phân tách payload kiểm tra định dạng và thời gian hết hạn (TTL 10 phút)
    const payloadParts = payload.split(':');
    if (payloadParts.length < 3) {
      return null;
    }
    const [userId, expiresAtStr, nonce] = payloadParts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (!userId || !expiresAt || !nonce || Date.now() > expiresAt) {
      return null;
    }

    // 4. Thao tác atomic tiêu thụ state trên PostgreSQL (chống replay attack và race condition)
    try {
      await this.ensureStateTable();
    } catch {
      // Fail closed nếu DB không thể sẵn sàng
      return null;
    }

    const stateHash = crypto.createHash('sha256').update(state).digest('hex');
    const now = new Date();

    if (!this.prisma || typeof this.prisma.$queryRawUnsafe !== 'function') {
      return null;
    }

    try {
      const rows: Array<{ user_id: string }> = await this.prisma.$queryRawUnsafe(
        `UPDATE "google_oauth_states"
         SET "is_consumed" = true, "consumed_at" = $1
         WHERE "state_hash" = $2 AND "is_consumed" = false AND "expires_at" > $1
         RETURNING "user_id"`,
        now,
        stateHash,
      );

      if (!rows || rows.length === 0) {
        // State không tồn tại, đã bị tiêu thụ trước đó (replay attack), hoặc đã hết hạn
        return null;
      }

      const consumedUserId = rows[0].user_id;
      if (consumedUserId !== userId) {
        return null;
      }

      return consumedUserId;
    } catch (err: any) {
      this.logger.error(this.safeDbErrorMessage('Lỗi khi atomic consume OAuth state trên PostgreSQL', err));
      return null; // Fail closed
    }
  }

  /**
   * Tạo URL ủy quyền Google OAuth2 Authorization Code Flow
   */
  async getAuthorizationUrl(userId: string): Promise<string> {
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

    const state = await this.generateState(userId);

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

      let data: any;
      try {
        data = await response.json();
      } catch {
        this.logger.error('Phản hồi từ Google Token Endpoint không phải là JSON hợp lệ [invalid_response]');
        throw new BadGatewayException('Phản hồi từ máy chủ Google không đúng định dạng');
      }

      if (!response.ok || data.error) {
        const rawError = data.error;
        const internalCode =
          rawError === 'invalid_grant'
            ? 'invalid_grant'
            : rawError === 'invalid_client'
              ? 'invalid_client'
              : 'provider_error';

        this.logger.warn(`Google đổi mã token thất bại [${internalCode}]`);
        throw new BadRequestException(
          'Không thể xác thực mã cấp quyền Google Workspace. Vui lòng thử lại.',
        );
      }

      return data;
    } catch (err: any) {
      if (err instanceof BadRequestException || err instanceof BadGatewayException) {
        throw err;
      }
      this.logger.error('Lỗi kết nối tới Google Token Endpoint [network_error]');
      throw new BadGatewayException(
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

      let data: any;
      try {
        data = await response.json();
      } catch {
        this.logger.error('Phản hồi từ Google UserInfo API không phải là JSON hợp lệ [invalid_response]');
        throw new BadGatewayException('Phản hồi từ máy chủ Google không đúng định dạng');
      }

      if (!response.ok || !data.sub) {
        this.logger.warn(`Google UserInfo thất bại (HTTP ${response.status}) [provider_error]`);
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
      if (err instanceof BadRequestException || err instanceof BadGatewayException) {
        throw err;
      }
      this.logger.error('Lỗi khi gọi Google UserInfo API [network_error]');
      throw new BadGatewayException(
        'Không thể xác thực thông tin tài khoản Google do lỗi kết nối',
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
    // RFC 9207 Section 2.4 (OAuth 2.0 Authorization Server Issuer Identification)
    // Issuer phải được so sánh bằng simple string comparison, chỉ chấp nhận chính xác https://accounts.google.com
    // Tuyệt đối không trim(), không tự loại bỏ dấu slash, không chấp nhận accounts.google.com
    if (!query.iss) {
      this.logger.warn('Google OAuth callback thiếu tham số iss bắt buộc');
      throw new BadRequestException(
        'Mã phát hành (issuer) của Google OAuth là bắt buộc',
      );
    }

    if (query.iss !== 'https://accounts.google.com') {
      this.logger.warn(
        `Google OAuth callback nhận issuer không hợp lệ: [${query.iss}]`,
      );
      throw new BadRequestException(
        'Mã phát hành (issuer) của Google OAuth không hợp lệ',
      );
    }

    if (query.error) {
      const internalCode =
        query.error === 'access_denied' ? 'access_denied' : 'provider_error';
      this.logger.warn(`Google OAuth bị từ chối hoặc lỗi [${internalCode}]`);
      throw new BadRequestException(
        'Xác thực Google bị từ chối hoặc gặp lỗi từ nhà cung cấp',
      );
    }

    if (!query.code || !query.state) {
      throw new BadRequestException(
        'Thiếu mã code hoặc state từ phản hồi của Google',
      );
    }

    // 1. Xác thực và tiêu thụ state chống CSRF & Replay attack trên PostgreSQL
    const userId = await this.validateAndConsumeState(query.state);
    if (!userId) {
      throw new BadRequestException(
        'Mã state không hợp lệ hoặc đã hết hạn (CSRF verification failed)',
      );
    }

    // LUỒNG 1: ĐĂNG NHẬP BẰNG GOOGLE (Public Google Login)
    if (userId === 'login:anon') {
      const tokens = await this.exchangeCodeForTokens(query.code);
      const profile = await this.fetchUserProfile(tokens.access_token);

      if (!profile.email_verified) {
        throw new BadRequestException(
          'Địa chỉ email Google chưa được xác minh (email_verified: false). Vui lòng xác minh với Google trước.',
        );
      }

      this.validateEmailDomain(profile.email);

      const existingAccount = await this.prisma.userGoogleAccount.findUnique({
        where: { googleSub: profile.sub },
        include: { user: true },
      });

      if (existingAccount && existingAccount.status !== GoogleConnectionStatus.DISCONNECTED) {
        const user = existingAccount.user;
        if (!user || !user.isActive) {
          throw new UnauthorizedException('Tài khoản người dùng không tồn tại hoặc đã bị khóa');
        }

        if (tokens.refresh_token) {
          const encryptedRefreshToken = this.googleCryptoService.encrypt(tokens.refresh_token);
          await this.prisma.userGoogleAccount.update({
            where: { id: existingAccount.id },
            data: { encryptedRefreshToken, lastConnectedAt: new Date() },
          }).catch(() => {});
        }

        let tokensPayload = { accessToken: '', refreshToken: '', expiresIn: '15m' };
        if (this.authService) {
          const at = await this.authService.generateAccessToken(user);
          const rt = await this.authService.generateAndSaveRefreshToken(user.id);
          tokensPayload = { accessToken: at.token, refreshToken: rt.refreshToken, expiresIn: at.expiresIn };
        }

        const loginResult = {
          message: 'Đăng nhập bằng Google thành công',
          isLogin: true,
          isLinked: true,
          user: {
            id: user.id,
            fullName: user.fullName,
            phone: user.phone,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
          },
          tokens: {
            accessToken: tokensPayload.accessToken,
            tokenType: 'Bearer',
            expiresIn: tokensPayload.expiresIn,
            refreshToken: tokensPayload.refreshToken,
          },
        };

        const ticket = await this.createExchangeTicket(loginResult);
        return {
          isLogin: true,
          isLinked: true,
          ticket,
          loginResult,
        };
      }

      // Chưa liên kết hoặc đã ngắt kết nối -> Cấp linkTicket để xác minh mật khẩu VanbyNhi
      const linkTicket = await this.createLinkTicket(profile);
      return {
        isLogin: true,
        isLinked: false,
        linkTicket,
        email: profile.email,
        message: 'Tài khoản Google chưa được liên kết với bất kỳ tài khoản VanbyNhi nào',
      };
    }

    // LUỒNG 2: LIÊN KẾT TÀI KHOẢN GOOGLE (Dành cho Giáo viên trong Cài đặt)
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

    // 7. Xử lý refresh token và mã hóa (tuyệt đối không lưu plaintext mới vào database)
    const existingEncryptedToken = user.googleAccount?.encryptedRefreshToken || null;
    let encryptedRefreshToken: string;

    if (tokens.refresh_token) {
      encryptedRefreshToken = this.googleCryptoService.encrypt(tokens.refresh_token);
    } else if (existingEncryptedToken) {
      // Giữ nguyên refresh token cũ khi Google không cấp token mới
      if (this.googleCryptoService.isEncrypted(existingEncryptedToken)) {
        encryptedRefreshToken = existingEncryptedToken;
      } else {
        // Nếu dữ liệu cũ là plaintext, tự động mã hóa lại để bảo đảm an toàn
        const decrypted = this.googleCryptoService.decrypt(existingEncryptedToken);
        encryptedRefreshToken = this.googleCryptoService.encrypt(decrypted);
      }
    } else {
      // Google không trả về refresh token và trong DB chưa có
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

    // Tuyệt đối không trả về tokens hay secrets
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

    // 1. Giải mã refresh token với try/catch độc lập
    // Tuyệt đối KHÔNG tự động chuyển CONNECTED thành NEEDS_REAUTH khi decrypt() thất bại.
    // Không xóa hoặc ghi đè encryptedRefreshToken và không thay đổi trạng thái tài khoản khi lỗi giải mã/khóa.
    let refreshToken: string;
    try {
      refreshToken = this.googleCryptoService.decrypt(
        googleAccount.encryptedRefreshToken,
      );
    } catch {
      this.logger.error(
        `Lỗi giải mã Google refresh token cho user ${userId}: Khóa không khớp hoặc dữ liệu bị thay đổi`,
      );
      throw new InternalServerErrorException(
        'Không thể giải mã dữ liệu xác thực Google Workspace. Vui lòng liên hệ quản trị viên kiểm tra cấu hình.',
      );
    }

    // 2. Nâng cấp dữ liệu cũ: Nếu phát hiện plaintext, phải lưu ciphertext thành công trước khi tiếp tục
    // Nếu lưu thất bại, ném lỗi và GIỮ NGUYÊN trạng thái CONNECTED, không chuyển sang NEEDS_REAUTH
    if (!this.googleCryptoService.isEncrypted(googleAccount.encryptedRefreshToken)) {
      const newlyEncrypted = this.googleCryptoService.encrypt(refreshToken);
      try {
        await this.prisma.userGoogleAccount.update({
          where: { userId },
          data: {
            encryptedRefreshToken: newlyEncrypted,
          },
        });
        this.logger.log(`Đã tự động nâng cấp mã hóa AES-256-GCM cho refresh token của user ${userId}`);
      } catch (dbErr: any) {
        this.logger.error(
          `Lưu ciphertext nâng cấp thất bại cho user ${userId}: ${dbErr?.message}`,
        );
        throw new InternalServerErrorException(
          'Không thể nâng cấp mã hóa refresh token vào cơ sở dữ liệu. Thao tác đã dừng để bảo vệ an toàn dữ liệu.',
        );
      }
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

    let response: Response;
    try {
      response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      this.logger.error(
        `Lỗi mạng/kết nối khi gọi làm mới token Google cho user ${userId} [network_error]`,
      );
      // Lỗi timeout hoặc mạng không được chuyển status sang NEEDS_REAUTH!
      throw new BadGatewayException('Không thể kết nối đến máy chủ Google để làm mới phiên làm việc');
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      this.logger.error(
        `Phản hồi làm mới token từ Google không phải JSON hợp lệ cho user ${userId} [invalid_response]`,
      );
      throw new BadGatewayException('Phản hồi từ Google không đúng định dạng JSON');
    }

    if (!response.ok || data.error) {
      const errorType = data.error;

      // CHỈ chuyển NEEDS_REAUTH khi lỗi thực sự liên quan đến refresh token bị thu hồi hoặc hết hạn (invalid_grant)
      if (errorType === 'invalid_grant') {
        this.logger.warn(
          `Google refresh token của user ${userId} bị từ chối hoặc hết hạn [invalid_grant]`,
        );
        await this.prisma.userGoogleAccount.update({
          where: { userId },
          data: { status: GoogleConnectionStatus.NEEDS_REAUTH },
        }).catch((updateErr) => {
          this.logger.error(
            this.safeDbErrorMessage(`Không thể cập nhật trạng thái NEEDS_REAUTH cho user ${userId}`, updateErr),
          );
        });
        throw new UnauthorizedException(
          'Quyền truy cập Google đã bị thu hồi hoặc hết hạn. Vui lòng liên kết lại tài khoản Google Workspace.',
        );
      }

      // Tuyệt đối KHÔNG chuyển NEEDS_REAUTH với invalid_client, lỗi cấu hình hay lỗi server khác
      if (errorType === 'invalid_client') {
        this.logger.error('Lỗi xác thực Google Client ID/Secret [invalid_client]');
        throw new InternalServerErrorException(
          'Lỗi cấu hình hệ thống: Thông tin xác thực Google Client không hợp lệ. Vui lòng kiểm tra lại cấu hình ứng dụng.',
        );
      }

      this.logger.error(
        `Lỗi Google OAuth API khi làm mới token cho user ${userId} [provider_error]`,
      );
      throw new BadGatewayException(
        'Máy chủ Google từ chối làm mới phiên đăng nhập. Vui lòng thử lại sau.',
      );
    }

    return data.access_token;
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

  /**
   * Xác minh tài khoản VanbyNhi hiện có và liên kết với tài khoản Google (Luồng đăng nhập)
   */
  async linkGoogleAccount(dto: GoogleLinkDto) {
    // 1. Kiểm tra vé linkTicket hợp lệ nhưng chưa consume để người dùng có thể nhập lại mật khẩu nếu gõ nhầm
    const profile = await this.peekTicket<GoogleUserProfile>('LINK', dto.linkTicket);
    if (!profile) {
      throw new UnauthorizedException(
        'Mã liên kết không hợp lệ hoặc đã hết hạn. Vui lòng thực hiện lại quy trình đăng nhập Google.',
      );
    }

    const trimmed = dto.identifier.trim();
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: trimmed.toLowerCase() },
          { phone: trimmed },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Thông tin tài khoản xác minh không chính xác');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị vô hiệu hóa hoặc khóa');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Thông tin tài khoản xác minh không chính xác');
    }

    // Kiểm tra xem User này đã liên kết với Google Sub khác đang CONNECTED hay chưa
    const existingUserGoogle = await this.prisma.userGoogleAccount.findUnique({
      where: { userId: user.id },
    });
    if (
      existingUserGoogle &&
      existingUserGoogle.googleSub !== profile.sub &&
      existingUserGoogle.status === GoogleConnectionStatus.CONNECTED
    ) {
      throw new ConflictException('Tài khoản này đã được liên kết với một tài khoản Google khác');
    }

    // 2. Tiêu thụ nguyên tử (atomic consume) vé linkTicket sau khi mật khẩu hợp lệ - đảm bảo single-use chống race condition và replay
    const consumedProfile = await this.consumeLinkTicket(dto.linkTicket);
    if (!consumedProfile) {
      throw new UnauthorizedException(
        'Mã liên kết đã được sử dụng hoặc đã hết hạn. Vui lòng thực hiện lại quy trình đăng nhập Google.',
      );
    }

    // Kiểm tra xem Google Sub này đã bị User khác liên kết đang CONNECTED hay chưa
    const existingGoogleOwner = await this.prisma.userGoogleAccount.findUnique({
      where: { googleSub: profile.sub },
    });
    if (existingGoogleOwner && existingGoogleOwner.userId !== user.id) {
      if (existingGoogleOwner.status === GoogleConnectionStatus.DISCONNECTED) {
        await this.prisma.userGoogleAccount.delete({
          where: { id: existingGoogleOwner.id },
        });
      } else {
        throw new ConflictException(
          'Tài khoản Google này đã được liên kết với một tài khoản VanbyNhi khác',
        );
      }
    }

    // Lưu liên kết
    await this.prisma.userGoogleAccount.upsert({
      where: { userId: user.id },
      update: {
        googleSub: profile.sub,
        email: profile.email,
        emailVerified: Boolean(profile.email_verified),
        status: GoogleConnectionStatus.CONNECTED,
        lastConnectedAt: new Date(),
      },
      create: {
        userId: user.id,
        googleSub: profile.sub,
        email: profile.email,
        emailVerified: Boolean(profile.email_verified),
        status: GoogleConnectionStatus.CONNECTED,
        lastConnectedAt: new Date(),
      },
    });

    let tokensPayload = { accessToken: '', refreshToken: '', expiresIn: '15m' };
    if (this.authService) {
      const at = await this.authService.generateAccessToken(user);
      const rt = await this.authService.generateAndSaveRefreshToken(user.id);
      tokensPayload = { accessToken: at.token, refreshToken: rt.refreshToken, expiresIn: at.expiresIn };
    }

    return {
      message: 'Liên kết tài khoản Google thành công',
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      tokens: {
        accessToken: tokensPayload.accessToken,
        tokenType: 'Bearer',
        expiresIn: tokensPayload.expiresIn,
        refreshToken: tokensPayload.refreshToken,
      },
    };
  }
}
