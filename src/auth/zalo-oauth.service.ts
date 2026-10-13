import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';

export interface ZaloUserProfile {
  zaloId: string;
  name?: string;
  avatarUrl?: string;
}

interface StateStoreItem {
  codeVerifier: string;
  expiresAt: number;
}

interface TicketStoreItem<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class ZaloOAuthService implements OnModuleDestroy {
  private readonly logger = new Logger(ZaloOAuthService.name);

  // In-memory stores có TTL bảo vệ chống CSRF, replay attack và memory leak
  private readonly stateStore = new Map<string, StateStoreItem>();
  private readonly exchangeTicketStore = new Map<string, TicketStoreItem<any>>();
  private readonly linkTicketStore = new Map<
    string,
    TicketStoreItem<ZaloUserProfile>
  >();

  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(private readonly configService: ConfigService) {
    // Dọn dẹp các token/state hết hạn mỗi 3 phút
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredItems();
    }, 3 * 60 * 1000);
    // Unref để không giữ event loop chạy vô thời hạn trong tests
    this.cleanupInterval.unref?.();
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Sinh cặp PKCE: code_verifier ngẫu nhiên 43 ký tự và code_challenge Base64 URL-safe không padding
   */
  generatePkce(): { codeVerifier: string; codeChallenge: string } {
    // 32 bytes ngẫu nhiên mã hóa base64url có đúng 43 ký tự [A-Za-z0-9\-_]
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    return { codeVerifier, codeChallenge };
  }

  /**
   * Sinh state ngẫu nhiên chống CSRF và lưu trữ cùng code_verifier (TTL 10 phút)
   */
  generateState(codeVerifier: string, ttlMs = 10 * 60 * 1000): string {
    const state = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + ttlMs;

    this.stateStore.set(state, { codeVerifier, expiresAt });
    return state;
  }

  /**
   * Kiểm tra và tiêu thụ state một lần (single-use), trả về code_verifier tương ứng
   */
  validateAndConsumeState(state: string): string | null {
    if (!state) {
      return null;
    }

    const item = this.stateStore.get(state);
    if (!item) {
      return null;
    }

    // Xóa ngay lập tức để chống replay attack
    this.stateStore.delete(state);

    if (Date.now() > item.expiresAt) {
      return null;
    }

    return item.codeVerifier;
  }

  /**
   * Tạo URL ủy quyền Zalo OAuth V4
   */
  getAuthorizationUrl(): string {
    const appId = this.configService.get<string>('ZALO_APP_ID');
    const callbackUrl = this.configService.get<string>('ZALO_CALLBACK_URL');

    if (!appId || !callbackUrl) {
      this.logger.error(
        'Lỗi cấu hình: Thiếu ZALO_APP_ID hoặc ZALO_CALLBACK_URL trong biến môi trường (.env)',
      );
      throw new InternalServerErrorException(
        'Lỗi cấu hình hệ thống: Không thể khởi tạo xác thực Zalo',
      );
    }

    const { codeVerifier, codeChallenge } = this.generatePkce();
    const state = this.generateState(codeVerifier);

    const params = new URLSearchParams({
      app_id: appId,
      redirect_uri: callbackUrl,
      code_challenge: codeChallenge,
      state,
    });

    return `https://oauth.zaloapp.com/v4/permission?${params.toString()}`;
  }

  /**
   * Đổi authorization code lấy User Access Token từ Zalo OAuth V4
   * Header: secret_key, Content-Type: application/x-www-form-urlencoded
   * Body: code, app_id, grant_type=authorization_code, code_verifier
   */
  async exchangeCodeForAccessToken(
    code: string,
    codeVerifier: string,
  ): Promise<string> {
    const appId = this.configService.get<string>('ZALO_APP_ID');
    const appSecret = this.configService.get<string>('ZALO_APP_SECRET');

    if (!appId || !appSecret) {
      this.logger.error(
        'Lỗi cấu hình: Thiếu ZALO_APP_ID hoặc ZALO_APP_SECRET trong biến môi trường (.env)',
      );
      throw new InternalServerErrorException(
        'Lỗi cấu hình hệ thống: Không thể xử lý xác thực Zalo',
      );
    }

    const body = new URLSearchParams({
      code,
      app_id: appId,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    }).toString();

    let res: Response;
    try {
      res = await fetch('https://oauth.zaloapp.com/v4/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          secret_key: appSecret,
        },
        body,
      });
    } catch {
      this.logger.error('Không thể kết nối đến máy chủ Zalo OAuth');
      throw new UnauthorizedException(
        'Lỗi kết nối khi gửi yêu cầu đổi token tới Zalo',
      );
    }

    let data: any;
    try {
      data = await res.json();
    } catch {
      throw new UnauthorizedException(
        'Phản hồi không hợp lệ từ máy chủ Zalo OAuth',
      );
    }

    if (data.error && data.error !== 0) {
      const errorMsg =
        data.error_description || data.message || `Mã lỗi ${data.error}`;
      this.logger.warn(`Zalo đổi token thất bại: ${errorMsg}`);
      throw new UnauthorizedException(
        `Xác thực mã ủy quyền Zalo thất bại: ${errorMsg}`,
      );
    }

    if (!data.access_token) {
      this.logger.warn('Zalo không trả về access_token trong phản hồi');
      throw new UnauthorizedException(
        'Không nhận được access_token hợp lệ từ Zalo',
      );
    }

    return data.access_token;
  }

  /**
   * Gọi Social API chính thức của Zalo: GET https://graph.zalo.me/v2.0/me?fields=id,name,picture
   * Header: access_token
   */
  async getZaloUserProfile(accessToken: string): Promise<ZaloUserProfile> {
    let res: Response;
    try {
      res = await fetch('https://graph.zalo.me/v2.0/me?fields=id,name,picture', {
        method: 'GET',
        headers: {
          access_token: accessToken,
        },
      });
    } catch {
      this.logger.error('Không thể kết nối đến Zalo Social API');
      throw new UnauthorizedException(
        'Lỗi kết nối khi lấy thông tin người dùng từ Zalo',
      );
    }

    let data: any;
    try {
      data = await res.json();
    } catch {
      throw new UnauthorizedException(
        'Phản hồi không hợp lệ từ Zalo Social API',
      );
    }

    if (data.error && data.error !== 0) {
      const errorMsg = data.message || `Mã lỗi ${data.error}`;
      this.logger.warn(`Zalo Social API trả về lỗi: ${errorMsg}`);
      throw new UnauthorizedException(
        `Không thể lấy thông tin người dùng từ Zalo: ${errorMsg}`,
      );
    }

    if (!data.id) {
      this.logger.warn('Zalo Social API không trả về id người dùng');
      throw new UnauthorizedException(
        'Không tìm thấy định danh người dùng (id) từ Zalo',
      );
    }

    return {
      zaloId: String(data.id),
      name: data.name,
      avatarUrl: data.picture?.data?.url,
    };
  }

  /**
   * Tạo một vé đổi token một lần (Exchange Ticket) có thời hạn 2 phút
   * Đảm bảo Access Token / Refresh Token không bị truyền trực tiếp trên URL
   */
  createExchangeTicket(payload: any, ttlMs = 2 * 60 * 1000): string {
    const ticket = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + ttlMs;

    this.exchangeTicketStore.set(ticket, { data: payload, expiresAt });
    return ticket;
  }

  /**
   * Tiêu thụ vé đổi token một lần
   */
  consumeExchangeTicket(ticket: string): Record<string, any> | null {
    if (!ticket) return null;

    const item = this.exchangeTicketStore.get(ticket);
    if (!item) return null;

    this.exchangeTicketStore.delete(ticket);

    if (Date.now() > item.expiresAt) {
      return null;
    }

    return item.data;
  }

  /**
   * Tạo vé liên kết tài khoản một lần (Link Ticket) có thời hạn 10 phút
   * Cho phép người dùng xác minh tài khoản VanbyNhi trước khi gắn kết zaloId
   */
  createLinkTicket(
    profile: ZaloUserProfile,
    ttlMs = 10 * 60 * 1000,
  ): string {
    const ticket = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + ttlMs;

    this.linkTicketStore.set(ticket, { data: profile, expiresAt });
    return ticket;
  }

  /**
   * Tiêu thụ vé liên kết tài khoản một lần
   */
  consumeLinkTicket(ticket: string): ZaloUserProfile | null {
    if (!ticket) return null;

    const item = this.linkTicketStore.get(ticket);
    if (!item) return null;

    this.linkTicketStore.delete(ticket);

    if (Date.now() > item.expiresAt) {
      return null;
    }

    return item.data;
  }

  /**
   * Dọn dẹp các mục đã hết hạn khỏi bộ nhớ
   */
  private cleanupExpiredItems() {
    const now = Date.now();

    for (const [key, val] of this.stateStore.entries()) {
      if (now > val.expiresAt) {
        this.stateStore.delete(key);
      }
    }

    for (const [key, val] of this.exchangeTicketStore.entries()) {
      if (now > val.expiresAt) {
        this.exchangeTicketStore.delete(key);
      }
    }

    for (const [key, val] of this.linkTicketStore.entries()) {
      if (now > val.expiresAt) {
        this.linkTicketStore.delete(key);
      }
    }
  }
}
