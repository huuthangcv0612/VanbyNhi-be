import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service.js';
import { GoogleCryptoService } from './google-crypto.service.js';
import { GoogleConnectionStatus } from '../../generated/prisma/client.js';

describe('GoogleAuthService', () => {
  let service: GoogleAuthService;
  let configService: ConfigService;
  let cryptoService: GoogleCryptoService;
  let prismaMock: any;

  beforeEach(() => {
    configService = new ConfigService({
      GOOGLE_CLIENT_ID: 'mock-google-client-id.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET: 'mock-google-client-secret',
      GOOGLE_REDIRECT_URI: 'http://localhost:3000/google/callback',
      GOOGLE_ALLOWED_EMAIL_DOMAINS: 'hcmus.edu.vn,vanbynhi.edu.vn',
      GOOGLE_TOKEN_ENCRYPTION_KEY:
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    });

    cryptoService = new GoogleCryptoService(configService);

    prismaMock = {
      user: {
        findUnique: vi.fn(),
      },
      userGoogleAccount: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new GoogleAuthService(configService, prismaMock, cryptoService);
  });

  afterEach(() => {
    service.onModuleDestroy();
    vi.restoreAllMocks();
  });

  describe('OAuth State & URL generation (Test Case 3 & 4)', () => {
    it('tạo URL ủy quyền chứa đúng client_id, scopes và state gắn với userId', () => {
      const urlString = service.getAuthorizationUrl('teacher-1');
      const url = new URL(urlString);

      expect(url.origin).toBe('https://accounts.google.com');
      expect(url.searchParams.get('client_id')).toBe(
        'mock-google-client-id.apps.googleusercontent.com',
      );
      expect(url.searchParams.get('access_type')).toBe('offline');
      expect(url.searchParams.get('prompt')).toBe('consent');
      expect(url.searchParams.get('scope')).toContain(
        'https://www.googleapis.com/auth/meetings.space.created',
      );

      const state = url.searchParams.get('state');
      expect(state).toBeTruthy();

      // State phải tiêu thụ được và trả đúng userId
      const consumedUserId = service.validateAndConsumeState(state!);
      expect(consumedUserId).toBe('teacher-1');

      // State đã tiêu thụ một lần, lần thứ hai phải trả về null (chống replay attack)
      expect(service.validateAndConsumeState(state!)).toBeNull();
    });

    it('từ chối khi state không hợp lệ hoặc đã hết hạn (Test Case 3)', async () => {
      await expect(
        service.handleCallback({
          code: 'valid-code',
          state: 'invalid-or-expired-state',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Google Callback Processing (Test Cases 2, 4, 5, 18)', () => {
    it('từ chối khi Google trả về lỗi cấp quyền (User denied)', async () => {
      await expect(
        service.handleCallback({
          error: 'access_denied',
          error_description: 'The user denied the request to link account',
        }),
      ).rejects.toThrow(/Xác thực Google bị từ chối/);
    });

    it('từ chối khi email Google chưa được xác minh (Test Case 2a)', async () => {
      const state = service.generateState('teacher-1');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        isActive: true,
      });

      vi.spyOn(service, 'exchangeCodeForTokens').mockResolvedValue({
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        expires_in: 3600,
      });

      vi.spyOn(service, 'fetchUserProfile').mockResolvedValue({
        sub: 'google-sub-123',
        email: 'teacher@hcmus.edu.vn',
        email_verified: false, // Chưa xác minh
      });

      await expect(
        service.handleCallback({ code: 'valid-code', state }),
      ).rejects.toThrow(/email_verified: false/);
    });

    it('từ chối khi miền email không thuộc danh sách cho phép (Test Case 2b)', async () => {
      const state = service.generateState('teacher-1');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        isActive: true,
      });

      vi.spyOn(service, 'exchangeCodeForTokens').mockResolvedValue({
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        expires_in: 3600,
      });

      vi.spyOn(service, 'fetchUserProfile').mockResolvedValue({
        sub: 'google-sub-123',
        email: 'teacher@gmail.com', // Không thuộc hcmus.edu.vn hoặc vanbynhi.edu.vn
        email_verified: true,
      });

      await expect(
        service.handleCallback({ code: 'valid-code', state }),
      ).rejects.toThrow(/không nằm trong danh sách miền Google Workspace/);
    });

    it('gắn đúng tài khoản Google vào user đã khởi tạo flow, không bị tráo đổi (Test Case 4)', async () => {
      const stateTeacher1 = service.generateState('teacher-1');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        isActive: true,
      });
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue(null);
      prismaMock.userGoogleAccount.upsert.mockImplementation(
        ({ create }: any) => ({
          ...create,
          lastConnectedAt: new Date(),
        }),
      );

      vi.spyOn(service, 'exchangeCodeForTokens').mockResolvedValue({
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        expires_in: 3600,
      });

      vi.spyOn(service, 'fetchUserProfile').mockResolvedValue({
        sub: 'google-sub-teacher-1',
        email: 'teacher1@hcmus.edu.vn',
        email_verified: true,
      });

      const result = await service.handleCallback({
        code: 'valid-code',
        state: stateTeacher1,
      });

      expect(prismaMock.userGoogleAccount.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'teacher-1' },
          create: expect.objectContaining({
            userId: 'teacher-1',
            googleSub: 'google-sub-teacher-1',
            email: 'teacher1@hcmus.edu.vn',
          }),
        }),
      );

      // Tuyệt đối không trả về refresh token, access token hay client secret (Test Case 18)
      expect(result).not.toHaveProperty('access_token');
      expect(result).not.toHaveProperty('refresh_token');
      expect((result as any).googleAccount).not.toHaveProperty('encryptedRefreshToken');
    });

    it('từ chối khi Google sub đã được liên kết với một tài khoản VanbyNhi khác (Test Case 5)', async () => {
      const stateTeacher1 = service.generateState('teacher-1');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        isActive: true,
      });

      // Đã có teacher-2 liên kết với sub này trước đó
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-2',
        googleSub: 'google-sub-shared',
      });

      vi.spyOn(service, 'exchangeCodeForTokens').mockResolvedValue({
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        expires_in: 3600,
      });

      vi.spyOn(service, 'fetchUserProfile').mockResolvedValue({
        sub: 'google-sub-shared',
        email: 'teacher@hcmus.edu.vn',
        email_verified: true,
      });

      await expect(
        service.handleCallback({ code: 'valid-code', state: stateTeacher1 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Refresh Token & Error Handling (Test Cases 6, 7)', () => {
    it('sử dụng refresh token đã mã hóa để lấy access token mới (Test Case 6)', async () => {
      const encryptedToken = cryptoService.encrypt('my-raw-google-refresh-token');

      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: encryptedToken,
      });

      // Mock native fetch cho token refresh endpoint
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-refreshed-access-token',
          expires_in: 3600,
        }),
      } as any);

      const accessToken = await service.getValidAccessToken('teacher-1');
      expect(accessToken).toBe('new-refreshed-access-token');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('grant_type=refresh_token'),
        }),
      );
    });

    it('đánh dấu NEEDS_REAUTH và báo lỗi khi refresh token bị thu hồi hoặc invalid_grant (Test Case 7)', async () => {
      const encryptedToken = cryptoService.encrypt('revoked-google-refresh-token');

      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: encryptedToken,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Token has been expired or revoked.',
        }),
      } as any);

      await expect(service.getValidAccessToken('teacher-1')).rejects.toThrow(
        UnauthorizedException,
      );

      // Phải cập nhật trạng thái NEEDS_REAUTH trong database
      expect(prismaMock.userGoogleAccount.update).toHaveBeenCalledWith({
        where: { userId: 'teacher-1' },
        data: { status: GoogleConnectionStatus.NEEDS_REAUTH },
      });
    });
  });

  describe('Connection status & Disconnect', () => {
    it('trả về thông tin trạng thái liên kết an toàn không lộ credential', async () => {
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        email: 'teacher@hcmus.edu.vn',
        googleSub: 'google-sub-1',
        status: GoogleConnectionStatus.CONNECTED,
        lastConnectedAt: new Date('2026-10-19T00:00:00Z'),
      });

      const status = await service.getConnectionStatus('teacher-1');
      expect(status).toEqual({
        isConnected: true,
        status: GoogleConnectionStatus.CONNECTED,
        email: 'teacher@hcmus.edu.vn',
        lastConnectedAt: new Date('2026-10-19T00:00:00Z'),
      });
      expect(status).not.toHaveProperty('encryptedRefreshToken');
    });

    it('hủy liên kết thành công và xóa refresh token đã mã hóa', async () => {
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
      });

      const res = await service.disconnect('teacher-1');
      expect(res.message).toContain('liên kết tài khoản Google thành công');
      expect(prismaMock.userGoogleAccount.update).toHaveBeenCalledWith({
        where: { userId: 'teacher-1' },
        data: {
          status: GoogleConnectionStatus.DISCONNECTED,
          encryptedRefreshToken: null,
        },
      });
    });
  });
});
