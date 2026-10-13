import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import crypto from 'node:crypto';
import { ZaloOAuthService } from './zalo-oauth.service.js';

describe('ZaloOAuthService', () => {
  let service: ZaloOAuthService;
  let configServiceMock: any;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    configServiceMock = {
      get: vi.fn((key: string) => {
        if (key === 'ZALO_APP_ID') return 'mock-app-id';
        if (key === 'ZALO_APP_SECRET') return 'mock-app-secret';
        if (key === 'ZALO_CALLBACK_URL')
          return 'http://localhost:3000/auth/zalo/callback';
        return null;
      }),
    };

    service = new ZaloOAuthService(configServiceMock);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    service.onModuleDestroy();
    vi.restoreAllMocks();
  });

  describe('generatePkce', () => {
    it('sinh code_verifier đủ 43 ký tự và code_challenge Base64 URL-safe không padding', () => {
      const { codeVerifier, codeChallenge } = service.generatePkce();

      expect(codeVerifier).toBeDefined();
      expect(codeVerifier.length).toBe(43);
      // Kiểm tra ký tự url-safe hợp lệ theo RFC 7636
      expect(codeVerifier).toMatch(/^[A-Za-z0-9\-_]+$/);

      expect(codeChallenge).toBeDefined();
      expect(codeChallenge.length).toBe(43);
      expect(codeChallenge).toMatch(/^[A-Za-z0-9\-_]+$/);
      // Không có padding '='
      expect(codeChallenge).not.toContain('=');

      // Kiểm tra code_challenge đúng với SHA-256 của code_verifier
      const expectedChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');
      expect(codeChallenge).toBe(expectedChallenge);
    });
  });

  describe('generateState & validateAndConsumeState', () => {
    it('sinh state ngẫu nhiên và cho phép tiêu thụ đúng 1 lần (single-use)', () => {
      const verifier = 'my-43-character-code-verifier-sample-123456';
      const state = service.generateState(verifier);

      expect(state).toBeDefined();
      expect(state.length).toBe(64); // 32 bytes hex = 64 ký tự

      // Tiêu thụ lần đầu: thành công và trả về codeVerifier
      const consumedVerifier = service.validateAndConsumeState(state);
      expect(consumedVerifier).toBe(verifier);

      // Tiêu thụ lần thứ 2: trả về null (chống replay attack)
      const secondConsume = service.validateAndConsumeState(state);
      expect(secondConsume).toBeNull();
    });

    it('từ chối state đã hết hạn TTL', () => {
      const verifier = 'my-43-character-code-verifier-sample-123456';
      // TTL âm để giả lập hết hạn
      const state = service.generateState(verifier, -1000);

      const consumed = service.validateAndConsumeState(state);
      expect(consumed).toBeNull();
    });
  });

  describe('getAuthorizationUrl', () => {
    it('tạo URL ủy quyền Zalo chuẩn v4 với đầy đủ query parameters', () => {
      const urlString = service.getAuthorizationUrl();
      const url = new URL(urlString);

      expect(url.origin).toBe('https://oauth.zaloapp.com');
      expect(url.pathname).toBe('/v4/permission');
      expect(url.searchParams.get('app_id')).toBe('mock-app-id');
      expect(url.searchParams.get('redirect_uri')).toBe(
        'http://localhost:3000/auth/zalo/callback',
      );
      expect(url.searchParams.get('code_challenge')).toBeDefined();
      expect(url.searchParams.get('code_challenge')?.length).toBe(43);
      expect(url.searchParams.get('state')).toBeDefined();
    });

    it('báo lỗi nếu thiếu biến môi trường ZALO_APP_ID hoặc ZALO_CALLBACK_URL', () => {
      configServiceMock.get.mockReturnValue(null);

      expect(() => service.getAuthorizationUrl()).toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('exchangeCodeForAccessToken', () => {
    it('gửi POST tới oauth.zaloapp.com với header secret_key và body chính xác', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'zalo-mock-access-token-123',
          refresh_token: 'zalo-mock-refresh-token-456',
          expires_in: 3600,
        }),
      });
      globalThis.fetch = mockFetch as any;

      const code = 'mock-zalo-auth-code';
      const verifier = 'mock-code-verifier-43-chars-long-1234567890';

      const token = await service.exchangeCodeForAccessToken(code, verifier);

      expect(token).toBe('zalo-mock-access-token-123');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [calledUrl, calledOptions] = mockFetch.mock.calls[0];
      expect(calledUrl).toBe('https://oauth.zaloapp.com/v4/access_token');
      expect(calledOptions.method).toBe('POST');
      expect(calledOptions.headers).toEqual({
        'Content-Type': 'application/x-www-form-urlencoded',
        secret_key: 'mock-app-secret',
      });

      const bodyParams = new URLSearchParams(calledOptions.body);
      expect(bodyParams.get('code')).toBe(code);
      expect(bodyParams.get('app_id')).toBe('mock-app-id');
      expect(bodyParams.get('grant_type')).toBe('authorization_code');
      expect(bodyParams.get('code_verifier')).toBe(verifier);
    });

    it('ném lỗi UnauthorizedException khi Zalo báo lỗi đổi token', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          error: -14002,
          error_description: 'Authorization code is invalid or expired',
        }),
      }) as any;

      await expect(
        service.exchangeCodeForAccessToken('invalid-code', 'verifier'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('báo lỗi nếu thiếu ZALO_APP_ID hoặc ZALO_APP_SECRET', async () => {
      configServiceMock.get.mockReturnValue(null);

      await expect(
        service.exchangeCodeForAccessToken('code', 'verifier'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getZaloUserProfile (Social API)', () => {
    it('gọi GET https://graph.zalo.me/v2.0/me với header access_token và lấy thông tin người dùng', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: '2468135790',
          name: 'Nguyễn Văn Zalo',
          picture: {
            data: {
              url: 'https://avatar.zalo.me/u/2468135790.jpg',
            },
          },
          error: 0,
        }),
      });
      globalThis.fetch = mockFetch as any;

      const profile = await service.getZaloUserProfile('mock-access-token');

      expect(profile).toEqual({
        zaloId: '2468135790',
        name: 'Nguyễn Văn Zalo',
        avatarUrl: 'https://avatar.zalo.me/u/2468135790.jpg',
      });

      const [calledUrl, calledOptions] = mockFetch.mock.calls[0];
      expect(calledUrl).toBe(
        'https://graph.zalo.me/v2.0/me?fields=id,name,picture',
      );
      expect(calledOptions.method).toBe('GET');
      expect(calledOptions.headers).toEqual({
        access_token: 'mock-access-token',
      });
    });

    it('ném lỗi khi Social API trả về lỗi', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          error: -216,
          message: 'Access token expired',
        }),
      }) as any;

      await expect(
        service.getZaloUserProfile('expired-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Exchange & Link Ticket management', () => {
    it('quản lý Exchange Ticket chuẩn single-use', () => {
      const payload = { token: 'jwt-123', userId: 'user-1' };
      const ticket = service.createExchangeTicket(payload);

      expect(ticket).toBeDefined();
      expect(service.consumeExchangeTicket(ticket)).toEqual(payload);
      // Lần thứ 2 phải null
      expect(service.consumeExchangeTicket(ticket)).toBeNull();
    });

    it('quản lý Link Ticket chuẩn single-use', () => {
      const profile = { zaloId: 'zalo-999', name: 'Zalo User' };
      const ticket = service.createLinkTicket(profile);

      expect(ticket).toBeDefined();
      expect(service.consumeLinkTicket(ticket)).toEqual(profile);
      // Lần thứ 2 phải null
      expect(service.consumeLinkTicket(ticket)).toBeNull();
    });
  });
});
