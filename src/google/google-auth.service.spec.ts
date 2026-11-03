import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import nodeCrypto from 'node:crypto';
import {
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  BadGatewayException,
  InternalServerErrorException,
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
  let statesDb: Map<
    string,
    { stateHash: string; userId: string; expiresAt: Date; isConsumed: boolean }
  >;

  const validEncryptionKey =
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const validStateSecret =
    'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210';

  beforeEach(() => {
    configService = new ConfigService({
      GOOGLE_CLIENT_ID: 'mock-google-client-id.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET: 'mock-google-client-secret',
      GOOGLE_REDIRECT_URI: 'http://localhost:3000/google/callback',
      GOOGLE_ALLOWED_EMAIL_DOMAINS: 'hcmus.edu.vn,vanbynhi.edu.vn',
      GOOGLE_TOKEN_ENCRYPTION_KEY: validEncryptionKey,
      GOOGLE_OAUTH_STATE_SECRET: validStateSecret,
    });

    cryptoService = new GoogleCryptoService(configService);
    statesDb = new Map();

    prismaMock = {
      $executeRawUnsafe: vi
        .fn()
        .mockImplementation((query: string, ...params: any[]) => {
          if (query.includes('INSERT INTO "google_oauth_states"')) {
            const [stateHash, userId, expiresAt] = params;
            if (!statesDb.has(stateHash)) {
              statesDb.set(stateHash, {
                stateHash,
                userId,
                expiresAt,
                isConsumed: false,
              });
              return Promise.resolve(1);
            }
            return Promise.resolve(0);
          }
          return Promise.resolve(1);
        }),
      $queryRawUnsafe: vi
        .fn()
        .mockImplementation((query: string, ...params: any[]) => {
          if (query.includes('UPDATE "google_oauth_states"')) {
            const [now, stateHash] = params;
            const record = statesDb.get(stateHash);
            if (record && !record.isConsumed && record.expiresAt > now) {
              record.isConsumed = true;
              return Promise.resolve([{ user_id: record.userId }]);
            }
            return Promise.resolve([]);
          }
          return Promise.resolve([]);
        }),
      user: {
        findUnique: vi.fn(),
      },
      userGoogleAccount: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    service = new GoogleAuthService(configService, prismaMock, cryptoService);
  });

  afterEach(() => {
    service.onModuleDestroy();
    vi.restoreAllMocks();
  });

  describe('Khởi tạo, cấu hình bảo mật & Tách khóa HMAC', () => {
    it('bắt buộc sử dụng GOOGLE_OAUTH_STATE_SECRET riêng, báo lỗi khi thiếu', () => {
      const missingStateSecretConfig = new ConfigService({
        GOOGLE_TOKEN_ENCRYPTION_KEY: validEncryptionKey,
      });
      expect(
        () => new GoogleAuthService(missingStateSecretConfig, prismaMock, cryptoService),
      ).toThrow(InternalServerErrorException);
      expect(
        () => new GoogleAuthService(missingStateSecretConfig, prismaMock, cryptoService),
      ).toThrow(/Biến môi trường GOOGLE_OAUTH_STATE_SECRET là bắt buộc/);
    });

    it('từ chối nếu GOOGLE_OAUTH_STATE_SECRET dùng chung với GOOGLE_TOKEN_ENCRYPTION_KEY', () => {
      const sharedKeyConfig = new ConfigService({
        GOOGLE_TOKEN_ENCRYPTION_KEY: validEncryptionKey,
        GOOGLE_OAUTH_STATE_SECRET: validEncryptionKey, // Trùng nhau
      });
      expect(
        () => new GoogleAuthService(sharedKeyConfig, prismaMock, cryptoService),
      ).toThrow(InternalServerErrorException);
      expect(
        () => new GoogleAuthService(sharedKeyConfig, prismaMock, cryptoService),
      ).toThrow(/không được dùng chung giá trị với GOOGLE_TOKEN_ENCRYPTION_KEY/);
    });

    it('loại bỏ hoàn toàn fallback hoặc secret cố định', () => {
      const emptyConfig = new ConfigService({
        GOOGLE_OAUTH_STATE_SECRET: '   ',
        GOOGLE_TOKEN_ENCRYPTION_KEY: validEncryptionKey,
      });
      expect(
        () => new GoogleAuthService(emptyConfig, prismaMock, cryptoService),
      ).toThrow(InternalServerErrorException);
    });
  });

  describe('Khởi tạo bảng PostgreSQL & Fail-closed Behavior', () => {
    it('tách CREATE TABLE và CREATE INDEX thành các câu lệnh độc lập', async () => {
      await service.ensureStateTable();

      const calls = prismaMock.$executeRawUnsafe.mock.calls.map((c: any) => c[0]);
      expect(calls.some((sql: string) => sql.includes('CREATE TABLE IF NOT EXISTS'))).toBe(
        true,
      );
      expect(
        calls.some((sql: string) => sql.includes('idx_google_oauth_states_expires_at')),
      ).toBe(true);
      expect(
        calls.some((sql: string) => sql.includes('idx_google_oauth_states_user_id')),
      ).toBe(true);
    });

    it('không nuốt lỗi khi khởi tạo bảng (Fail closed)', async () => {
      const failingPrismaMock = {
        $executeRawUnsafe: vi.fn().mockRejectedValue(new Error('PostgreSQL Connection Refused')),
      };
      const failingService = new GoogleAuthService(
        configService,
        failingPrismaMock as any,
        cryptoService,
      );

      await expect(failingService.ensureStateTable()).rejects.toThrow(
        InternalServerErrorException,
      );
      failingService.onModuleDestroy();
    });

    it('generateState không trả về state nếu chưa lưu thành công vào PostgreSQL (Fail closed)', async () => {
      prismaMock.$executeRawUnsafe.mockImplementation((query: string) => {
        if (query.includes('INSERT INTO "google_oauth_states"')) {
          return Promise.reject(new Error('Disk Full or DB Down'));
        }
        return Promise.resolve(1);
      });

      await expect(service.generateState('teacher-1')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.generateState('teacher-1')).rejects.toThrow(
        /Không thể khởi tạo phiên xác thực bảo mật OAuth do lỗi cơ sở dữ liệu/,
      );
    });

    it('validateAndConsumeState không thể xác thực state nếu database gặp lỗi (Fail closed)', async () => {
      const state = await service.generateState('teacher-1');

      // Giả lập DB bị lỗi khi validateAndConsume
      prismaMock.$queryRawUnsafe.mockRejectedValue(new Error('Database Network Timeout'));

      const result = await service.validateAndConsumeState(state);
      expect(result).toBeNull(); // Fail closed, tuyệt đối không trả về userId
    });
  });

  describe('OAuth State Security & Multi-instance / Restart Handling', () => {
    it('tạo URL ủy quyền chứa đúng client_id, scopes và state gắn với userId', async () => {
      const urlString = await service.getAuthorizationUrl('teacher-1');
      const url = new URL(urlString);

      expect(url.origin).toBe('https://accounts.google.com');
      expect(url.searchParams.get('client_id')).toBe(
        'mock-google-client-id.apps.googleusercontent.com',
      );
      expect(url.searchParams.get('access_type')).toBe('offline');
      expect(url.searchParams.get('prompt')).toBe('consent');
      expect(url.searchParams.get('include_granted_scopes')).toBe('true');
      expect(url.searchParams.get('scope')).toContain(
        'https://www.googleapis.com/auth/meetings.space.created',
      );

      const state = url.searchParams.get('state');
      expect(state).toBeTruthy();

      const consumedUserId = await service.validateAndConsumeState(state!);
      expect(consumedUserId).toBe('teacher-1');

      // State đã tiêu thụ một lần, lần thứ hai phải trả về null (chống replay attack)
      expect(await service.validateAndConsumeState(state!)).toBeNull();
    });

    it('tiêu thụ state thành công sau khi Render restart (đọc từ PostgreSQL chung)', async () => {
      const state = await service.generateState('teacher-1');

      // Tạo instance mới mô phỏng container Render vừa reboot (RAM rỗng)
      const newServiceInstance = new GoogleAuthService(
        configService,
        prismaMock,
        cryptoService,
      );

      const recoveredUserId = await newServiceInstance.validateAndConsumeState(state);
      expect(recoveredUserId).toBe('teacher-1');

      // Đã tiêu thụ xong một lần, không thể tái sử dụng
      expect(await newServiceInstance.validateAndConsumeState(state)).toBeNull();
      newServiceInstance.onModuleDestroy();
    });

    it('chống replay attack và xử lý đồng thời (Concurrent consume giữa nhiều instance)', async () => {
      const state = await service.generateState('teacher-1');
      const instance2 = new GoogleAuthService(configService, prismaMock, cryptoService);

      // 2 instance cùng nhận callback và cố tiêu thụ cùng 1 state đồng thời
      const [res1, res2] = await Promise.all([
        service.validateAndConsumeState(state),
        instance2.validateAndConsumeState(state),
      ]);

      const successes = [res1, res2].filter((r) => r === 'teacher-1');
      const failures = [res1, res2].filter((r) => r === null);

      expect(successes).toHaveLength(1);
      expect(failures).toHaveLength(1);

      instance2.onModuleDestroy();
    });

    it('từ chối khi state đã quá thời hạn TTL (10 phút)', async () => {
      const expiredState = await service.generateState('teacher-1', -1000);
      const consumedUserId = await service.validateAndConsumeState(expiredState);
      expect(consumedUserId).toBeNull();
    });

    it('từ chối state có chữ ký bị giả mạo (Anti-tampering)', async () => {
      const state = await service.generateState('teacher-1');
      const [payload, signature] = state.split('.');
      const tamperedSignature =
        signature.slice(0, -2) + (signature.endsWith('a') ? 'b' : 'a');
      const tamperedState = `${payload}.${tamperedSignature}`;

      expect(await service.validateAndConsumeState(tamperedState)).toBeNull();
    });

    it('báo lỗi khi thiếu GOOGLE_CLIENT_ID trong môi trường', async () => {
      const missingClientConfig = new ConfigService({
        GOOGLE_TOKEN_ENCRYPTION_KEY: validEncryptionKey,
        GOOGLE_OAUTH_STATE_SECRET: validStateSecret,
        GOOGLE_REDIRECT_URI: 'http://localhost:3000/google/callback',
      });
      const localService = new GoogleAuthService(
        missingClientConfig,
        prismaMock,
        cryptoService,
      );
      await expect(localService.getAuthorizationUrl('teacher-1')).rejects.toThrow(
        InternalServerErrorException,
      );
      localService.onModuleDestroy();
    });

    it('báo lỗi khi thiếu cả GOOGLE_REDIRECT_URI lẫn RENDER_EXTERNAL_URL', async () => {
      const missingRedirectConfig = new ConfigService({
        GOOGLE_TOKEN_ENCRYPTION_KEY: validEncryptionKey,
        GOOGLE_OAUTH_STATE_SECRET: validStateSecret,
        GOOGLE_CLIENT_ID: 'mock-client-id',
      });
      const localService = new GoogleAuthService(
        missingRedirectConfig,
        prismaMock,
        cryptoService,
      );
      await expect(localService.getAuthorizationUrl('teacher-1')).rejects.toThrow(
        InternalServerErrorException,
      );
      localService.onModuleDestroy();
    });

    it('fallback sang RENDER_EXTERNAL_URL khi GOOGLE_REDIRECT_URI không được cấu hình', async () => {
      const renderConfig = new ConfigService({
        GOOGLE_TOKEN_ENCRYPTION_KEY: validEncryptionKey,
        GOOGLE_OAUTH_STATE_SECRET: validStateSecret,
        GOOGLE_CLIENT_ID: 'mock-client-id',
        RENDER_EXTERNAL_URL: 'https://vanbynhi-be.onrender.com',
      });
      const localService = new GoogleAuthService(
        renderConfig,
        prismaMock,
        cryptoService,
      );
      const url = new URL(await localService.getAuthorizationUrl('teacher-1'));
      expect(url.searchParams.get('redirect_uri')).toBe(
        'https://vanbynhi-be.onrender.com/google/callback',
      );
      localService.onModuleDestroy();
    });
  });

  describe('Google Callback Processing & Account Linking', () => {
    it('từ chối khi Google trả về lỗi cấp quyền (User denied) và không đưa raw error_description vào response', async () => {
      try {
        await service.handleCallback({
          error: 'access_denied',
          error_description: 'The user denied the request to link account with sensitive provider url https://accounts.google.com/error?debug=123',
        });
        expect.unreachable();
      } catch (err: any) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toBe('Xác thực Google bị từ chối hoặc gặp lỗi từ nhà cung cấp');
        expect(err.message).not.toContain('sensitive provider url');
        expect(err.message).not.toContain('https://accounts.google.com');
      }
    });

    it('access_denied không bị phân loại thành invalid_grant và không thay đổi trạng thái tài khoản', async () => {
      const warnSpy = vi.spyOn((service as any).logger, 'warn');
      try {
        await service.handleCallback({
          error: 'access_denied',
          error_description: 'The user denied the request to link account',
        });
        expect.unreachable();
      } catch (err: any) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[access_denied]'));
        expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining('[invalid_grant]'));
        expect(prismaMock.userGoogleAccount.update).not.toHaveBeenCalled();
      }
    });

    it('không log raw provider hoặc database error trong Production (safeDbErrorMessage)', () => {
      const prodConfig = new ConfigService({
        NODE_ENV: 'production',
        GOOGLE_CLIENT_ID: 'mock-id',
        GOOGLE_REDIRECT_URI: 'http://localhost:3000/google/callback',
        GOOGLE_TOKEN_ENCRYPTION_KEY: validEncryptionKey,
        GOOGLE_OAUTH_STATE_SECRET: validStateSecret,
      });
      const prodAuthService = new GoogleAuthService(prodConfig, prismaMock, cryptoService);
      const safeMsg = (prodAuthService as any).safeDbErrorMessage(
        'Lưu OAuth state vào PostgreSQL thất bại',
        new Error('password authentication failed for user postgres at 10.0.0.1:5432/db'),
      );
      expect(safeMsg).toBe('Lưu OAuth state vào PostgreSQL thất bại do lỗi cơ sở dữ liệu');
      expect(safeMsg).not.toContain('password authentication failed');
      expect(safeMsg).not.toContain('10.0.0.1:5432');
      prodAuthService.onModuleDestroy();
    });

    it('exchangeCodeForTokens không đưa raw error_description từ Google vào exception response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Bad authorization code 4/0AY0e-xyz. Internal secret stack trace at line 42',
        }),
      } as any);

      try {
        await service.exchangeCodeForTokens('sample-code', 'http://localhost:3000/google/callback');
        expect.unreachable();
      } catch (err: any) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toBe('Không thể xác thực mã cấp quyền Google Workspace. Vui lòng thử lại.');
        expect(err.message).not.toContain('Internal secret stack trace');
        expect(err.message).not.toContain('4/0AY0e-xyz');
      }
    });

    it('exchangeCodeForTokens xử lý phản hồi không phải JSON hợp lệ [invalid_response]', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new Error('Unexpected token < in JSON at position 0');
        },
      } as any);

      await expect(
        service.exchangeCodeForTokens('sample-code', 'http://localhost:3000/google/callback'),
      ).rejects.toThrow(BadGatewayException);
    });

    it('fetchUserProfile không đưa raw provider error vào exception response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            message: 'Invalid Credentials: auth token expired at cluster node us-central1',
          },
        }),
      } as any);

      try {
        await service.fetchUserProfile('fake-access-token');
        expect.unreachable();
      } catch (err: any) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toBe('Không thể lấy thông tin định danh người dùng từ Google');
        expect(err.message).not.toContain('cluster node us-central1');
      }
    });

    it('fetchUserProfile xử lý phản hồi không phải JSON hợp lệ [invalid_response]', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new Error('Unexpected token < in JSON at position 0');
        },
      } as any);

      await expect(service.fetchUserProfile('fake-access-token')).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('từ chối khi thiếu code hoặc state', async () => {
      await expect(service.handleCallback({})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('từ chối khi email Google chưa được xác minh', async () => {
      const state = await service.generateState('teacher-1');

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
        email_verified: false,
      });

      await expect(
        service.handleCallback({ code: 'valid-code', state }),
      ).rejects.toThrow(/email_verified: false/);
    });

    it('từ chối khi miền email không thuộc danh sách cho phép', async () => {
      const state = await service.generateState('teacher-1');

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
        email: 'teacher@gmail.com',
        email_verified: true,
      });

      await expect(
        service.handleCallback({ code: 'valid-code', state }),
      ).rejects.toThrow(/không nằm trong danh sách miền Google Workspace/);
    });

    it('mã hóa refresh token mới bằng AES-256-GCM khi liên kết tài khoản', async () => {
      const stateTeacher1 = await service.generateState('teacher-1');

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
        refresh_token: 'raw-google-refresh-token-secret-123',
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
            encryptedRefreshToken: expect.stringMatching(
              /^[0-9a-fA-F]{24}:[0-9a-fA-F]{32}:[0-9a-fA-F]+$/,
            ),
          }),
        }),
      );

      expect(result).not.toHaveProperty('access_token');
      expect(result).not.toHaveProperty('refresh_token');
    });

    it('tiếp tục giữ ciphertext cũ khi Google không cấp refresh_token mới', async () => {
      const stateTeacher1 = await service.generateState('teacher-1');
      const oldEncryptedToken = cryptoService.encrypt('existing-refresh-token');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        isActive: true,
        googleAccount: {
          encryptedRefreshToken: oldEncryptedToken,
        },
      });
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue(null);
      prismaMock.userGoogleAccount.upsert.mockImplementation(
        ({ update }: any) => ({
          ...update,
          lastConnectedAt: new Date(),
        }),
      );

      vi.spyOn(service, 'exchangeCodeForTokens').mockResolvedValue({
        access_token: 'fake-access-token',
        // Google không trả refresh token
        expires_in: 3600,
      });

      vi.spyOn(service, 'fetchUserProfile').mockResolvedValue({
        sub: 'google-sub-teacher-1',
        email: 'teacher1@hcmus.edu.vn',
        email_verified: true,
      });

      await service.handleCallback({ code: 'valid-code', state: stateTeacher1 });

      expect(prismaMock.userGoogleAccount.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            encryptedRefreshToken: oldEncryptedToken,
          }),
        }),
      );
    });

    it('từ chối khi Google sub đã liên kết với tài khoản VanbyNhi khác đang hoạt động', async () => {
      const stateTeacher1 = await service.generateState('teacher-1');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        isActive: true,
      });

      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        id: 'old-acc-id',
        userId: 'teacher-2',
        googleSub: 'google-sub-shared',
        status: GoogleConnectionStatus.CONNECTED,
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

    it('dọn dẹp bản ghi cũ nếu tài khoản Google trước đó thuộc user khác nhưng đã DISCONNECTED', async () => {
      const stateTeacher1 = await service.generateState('teacher-1');

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        isActive: true,
      });

      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        id: 'old-disconnected-acc-id',
        userId: 'teacher-2',
        googleSub: 'google-sub-shared',
        status: GoogleConnectionStatus.DISCONNECTED,
      });
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
        sub: 'google-sub-shared',
        email: 'teacher@hcmus.edu.vn',
        email_verified: true,
      });

      await service.handleCallback({ code: 'valid-code', state: stateTeacher1 });

      expect(prismaMock.userGoogleAccount.delete).toHaveBeenCalledWith({
        where: { id: 'old-disconnected-acc-id' },
      });
    });
  });

  describe('Refresh Token Error Classification & Resilience', () => {
    it('chỉ chuyển sang NEEDS_REAUTH khi lỗi thực sự là invalid_grant (token bị thu hồi/hết hạn)', async () => {
      const encryptedToken = cryptoService.encrypt('revoked-google-refresh-token');

      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: encryptedToken,
      });
      prismaMock.userGoogleAccount.update.mockResolvedValue({});

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Token has been expired or revoked at datacenter node 12. Raw credential url: https://google.com/auth?token=xyz',
        }),
      } as any);

      try {
        await service.getValidAccessToken('teacher-1');
        expect.unreachable();
      } catch (err: any) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.message).toBe(
          'Quyền truy cập Google đã bị thu hồi hoặc hết hạn. Vui lòng liên kết lại tài khoản Google Workspace.',
        );
        expect(err.message).not.toContain('datacenter node 12');
        expect(err.message).not.toContain('https://google.com/auth');
      }

      // Phải cập nhật trạng thái NEEDS_REAUTH
      expect(prismaMock.userGoogleAccount.update).toHaveBeenCalledWith({
        where: { userId: 'teacher-1' },
        data: { status: GoogleConnectionStatus.NEEDS_REAUTH },
      });
    });

    it('các lỗi provider khác invalid_grant (ví dụ: server_error, temporarily_unavailable) KHÔNG chuyển sang NEEDS_REAUTH và không lộ error_description', async () => {
      const encryptedToken = cryptoService.encrypt('valid-token-for-provider-error');

      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: encryptedToken,
      });

      // 1. Kiểm tra với server_error
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'server_error',
          error_description: 'Google internal server failure 500 crash stack trace',
        }),
      } as any);

      try {
        await service.getValidAccessToken('teacher-1');
        expect.unreachable();
      } catch (err: any) {
        expect(err).toBeInstanceOf(BadGatewayException);
        expect(err.message).toBe('Máy chủ Google từ chối làm mới phiên đăng nhập. Vui lòng thử lại sau.');
        expect(err.message).not.toContain('failure 500 crash stack trace');
      }

      // Tuyệt đối không chuyển sang NEEDS_REAUTH
      expect(prismaMock.userGoogleAccount.update).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: GoogleConnectionStatus.NEEDS_REAUTH },
        }),
      );

      // 2. Kiểm tra với temporarily_unavailable
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({
          error: 'temporarily_unavailable',
          error_description: 'Google OAuth rate limit exceeded temporarily',
        }),
      } as any);

      await expect(service.getValidAccessToken('teacher-1')).rejects.toThrow(
        BadGatewayException,
      );

      expect(prismaMock.userGoogleAccount.update).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: GoogleConnectionStatus.NEEDS_REAUTH },
        }),
      );
    });

    it('tuyệt đối KHÔNG chuyển NEEDS_REAUTH khi lỗi là invalid_client (lỗi cấu hình server)', async () => {
      const encryptedToken = cryptoService.encrypt('valid-token-but-bad-client');

      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: encryptedToken,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          error: 'invalid_client',
          error_description: 'The OAuth client was not found.',
        }),
      } as any);

      await expect(service.getValidAccessToken('teacher-1')).rejects.toThrow(
        InternalServerErrorException,
      );

      // KHÔNG ĐƯỢC cập nhật trạng thái của user sang NEEDS_REAUTH!
      expect(prismaMock.userGoogleAccount.update).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: GoogleConnectionStatus.NEEDS_REAUTH },
        }),
      );
    });

    it('tuyệt đối KHÔNG chuyển NEEDS_REAUTH khi phản hồi refresh token không phải JSON hợp lệ [invalid_response]', async () => {
      const encryptedToken = cryptoService.encrypt('valid-token');

      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: encryptedToken,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new Error('Unexpected token < in JSON at position 0');
        },
      } as any);

      await expect(service.getValidAccessToken('teacher-1')).rejects.toThrow(
        BadGatewayException,
      );

      // Trạng thái CONNECTED phải được giữ nguyên, không được chuyển sang NEEDS_REAUTH
      expect(prismaMock.userGoogleAccount.update).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: GoogleConnectionStatus.NEEDS_REAUTH },
        }),
      );
    });

    it('tuyệt đối KHÔNG chuyển NEEDS_REAUTH khi gặp lỗi mạng hoặc Timeout (máy chủ Google tạm thời gián đoạn)', async () => {
      const encryptedToken = cryptoService.encrypt('valid-token');

      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: encryptedToken,
      });

      global.fetch = vi.fn().mockRejectedValue({
        name: 'TimeoutError',
        message: 'The operation was aborted due to timeout',
      });

      await expect(service.getValidAccessToken('teacher-1')).rejects.toThrow(
        BadGatewayException,
      );

      // Trạng thái CONNECTED phải được giữ nguyên
      expect(prismaMock.userGoogleAccount.update).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: GoogleConnectionStatus.NEEDS_REAUTH },
        }),
      );
    });

    it('không làm mất trạng thái CONNECTED khi DB update ciphertext nâng cấp thất bại', async () => {
      const legacyToken = '1//0gXyzLegacyRefreshTokenWithoutColon123456';

      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: legacyToken,
      });

      // DB update bị fail
      prismaMock.userGoogleAccount.update.mockRejectedValueOnce(
        new Error('DB Connection Timeout'),
      );

      await expect(service.getValidAccessToken('teacher-1')).rejects.toThrow(
        InternalServerErrorException,
      );

      // KHÔNG đổi sang NEEDS_REAUTH
      expect(prismaMock.userGoogleAccount.update).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: GoogleConnectionStatus.NEEDS_REAUTH },
        }),
      );
    });

    it('tuyệt đối KHÔNG chuyển NEEDS_REAUTH và KHÔNG đổi ciphertext khi giải mã refresh token thất bại', async () => {
      const corruptedCiphertext = 'corrupted:ciphertext:token';
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: corruptedCiphertext,
      });

      await expect(service.getValidAccessToken('teacher-1')).rejects.toThrow(
        InternalServerErrorException,
      );

      // Tuyệt đối không gọi update để chuyển sang NEEDS_REAUTH hay đổi ciphertext
      expect(prismaMock.userGoogleAccount.update).not.toHaveBeenCalled();
    });

    it('database error khi tìm kiếm tài khoản không làm mất hoặc thay đổi refresh token', async () => {
      prismaMock.userGoogleAccount.findUnique.mockRejectedValue(
        new Error('Database Connection Terminated'),
      );

      await expect(service.getValidAccessToken('teacher-1')).rejects.toThrow(
        /Database Connection Terminated/,
      );

      // Đảm bảo không có lệnh update nào được gửi tới DB
      expect(prismaMock.userGoogleAccount.update).not.toHaveBeenCalled();
    });

    it('giải mã thành công và làm mới access token khi refresh token trong DB được mã hóa bằng legacy key', async () => {
      const legacyConfig = new ConfigService({
        GOOGLE_CLIENT_ID: 'mock-google-client-id.apps.googleusercontent.com',
        GOOGLE_CLIENT_SECRET: 'mock-google-client-secret',
        GOOGLE_REDIRECT_URI: 'http://localhost:3000/google/callback',
        GOOGLE_TOKEN_ENCRYPTION_KEY: validEncryptionKey,
        GOOGLE_OAUTH_STATE_SECRET: validStateSecret,
        GOOGLE_TOKEN_LEGACY_KEY: 'custom-legacy-key-candidate-32b',
      });
      const legacyCryptoService = new GoogleCryptoService(legacyConfig);
      const testService = new GoogleAuthService(
        legacyConfig,
        prismaMock,
        legacyCryptoService,
      );

      // Giả lập token mã hóa bằng GOOGLE_TOKEN_LEGACY_KEY
      const legacyKeyBuf = nodeCrypto
        .createHash('sha256')
        .update('custom-legacy-key-candidate-32b')
        .digest();
      const iv = nodeCrypto.randomBytes(12);
      const cipher = nodeCrypto.createCipheriv('aes-256-gcm', legacyKeyBuf, iv);
      let enc = cipher.update('my-valid-legacy-token', 'utf8', 'hex');
      enc += cipher.final('hex');
      const tag = cipher.getAuthTag();
      const legacyCiphertext = `${iv.toString('hex')}:${tag.toString('hex')}:${enc}`;

      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-legacy-1',
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: legacyCiphertext,
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-google-access-token-123',
          expires_in: 3600,
          token_type: 'Bearer',
        }),
      });

      const accessToken = await testService.getValidAccessToken('teacher-legacy-1');
      expect(accessToken).toBe('new-google-access-token-123');

      // Đảm bảo không ghi đè hay thay đổi ciphertext trong database (bảo toàn token cũ)
      expect(prismaMock.userGoogleAccount.update).not.toHaveBeenCalled();
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

    it('trả về trạng thái DISCONNECTED khi chưa có bản ghi kết nối', async () => {
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue(null);

      const status = await service.getConnectionStatus('teacher-without-google');
      expect(status).toEqual({
        isConnected: false,
        status: GoogleConnectionStatus.DISCONNECTED,
      });
    });

    it('hủy liên kết thành công và xóa refresh token đã mã hóa', async () => {
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
      });
      prismaMock.userGoogleAccount.update.mockResolvedValue({});

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

    it('báo lỗi khi ngắt liên kết tài khoản chưa từng liên kết', async () => {
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue(null);
      await expect(service.disconnect('unlinked-teacher')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
