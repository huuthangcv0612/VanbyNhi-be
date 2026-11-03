import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadGatewayException,
} from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service.js';
import { GoogleMeetService } from './google-meet.service.js';
import { GoogleController } from './google.controller.js';
import { TeacherClassesService } from '../classes/teacher-classes.service.js';
import {
  UserRole,
  GoogleConnectionStatus,
  MeetSpaceStatus,
  ClassStatus,
} from '../../generated/prisma/client.js';

describe('BỘ KIỂM THỬ TÍCH HỢP GOOGLE INTEGRATION & MULTI-TEACHER ISOLATION (13 Test Cases)', () => {
  let googleAuthService: GoogleAuthService;
  let googleMeetService: GoogleMeetService;
  let googleController: GoogleController;
  let teacherClassesService: TeacherClassesService;

  let prismaMock: any;
  let configMock: any;
  let cryptoMock: any;
  let authServiceMock: any;

  beforeEach(() => {
    vi.restoreAllMocks();

    configMock = {
      get: vi.fn((key: string) => {
        if (key === 'GOOGLE_CLIENT_ID') return 'mock-client-id.apps.googleusercontent.com';
        if (key === 'GOOGLE_CLIENT_SECRET') return 'mock-client-secret';
        if (key === 'GOOGLE_REDIRECT_URI') return 'http://localhost:3000/google/callback';
        if (key === 'GOOGLE_OAUTH_STATE_SECRET') return 'super-secret-state-hmac-key-at-least-32-chars';
        if (key === 'GOOGLE_TOKEN_ENCRYPTION_KEY') return 'super-secret-aes-key-for-token-encryption-32c';
        if (key === 'FRONTEND_URL') return 'http://localhost:5173';
        if (key === 'GOOGLE_MEET_ACCESS_TYPE') return 'TRUSTED';
        return null;
      }),
    };

    let mockDbTickets = new Map<string, {
      ticket_hash: string;
      ticket_type: string;
      payload: string;
      expires_at: Date;
      is_consumed: boolean;
      consumed_at: Date | null;
    }>();

    prismaMock = {
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
      },
      userGoogleAccount: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        upsert: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({}),
      },
      class: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      classMeetSpace: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      $executeRawUnsafe: vi.fn().mockImplementation((query: string, ...args: any[]) => {
        if (query.includes('INSERT INTO "google_oauth_tickets"')) {
          const [ticketHash, ticketType, payload, expiresAt] = args;
          mockDbTickets.set(`${ticketType}:${ticketHash}`, {
            ticket_hash: ticketHash,
            ticket_type: ticketType,
            payload,
            expires_at: new Date(expiresAt),
            is_consumed: false,
            consumed_at: null,
          });
          return Promise.resolve(1);
        }
        return Promise.resolve(1);
      }),
      $queryRawUnsafe: vi.fn().mockImplementation((query: string, ...args: any[]) => {
        if (query.includes('SELECT "payload" FROM "google_oauth_tickets"')) {
          const [ticketHash, ticketType, now] = args;
          const key = `${ticketType}:${ticketHash}`;
          const record = mockDbTickets.get(key);
          if (record && !record.is_consumed && record.expires_at > new Date(now)) {
            return Promise.resolve([{ payload: record.payload }]);
          }
          return Promise.resolve([]);
        }
        if (query.includes('UPDATE "google_oauth_tickets"')) {
          const [now, ticketHash, ticketType] = args;
          const key = `${ticketType}:${ticketHash}`;
          const record = mockDbTickets.get(key);
          if (record && !record.is_consumed && record.expires_at > new Date(now)) {
            record.is_consumed = true;
            record.consumed_at = new Date(now);
            return Promise.resolve([{ payload: record.payload }]);
          }
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      }),
      $transaction: vi.fn((actions) => Promise.all(actions)),
    };

    cryptoMock = {
      encrypt: vi.fn((val: string) => `enc:${val}`),
      decrypt: vi.fn((val: string) => val.replace(/^enc:/, '')),
      isEncrypted: vi.fn((val: string) => val.startsWith('enc:')),
    };

    authServiceMock = {
      generateAccessToken: vi.fn().mockResolvedValue({ token: 'mock-vanbynhi-jwt-access-token', expiresIn: '15m' }),
      generateAndSaveRefreshToken: vi.fn().mockResolvedValue({ refreshToken: 'mock-vanbynhi-refresh-token' }),
    };

    googleAuthService = new GoogleAuthService(
      configMock,
      prismaMock,
      cryptoMock as any,
      authServiceMock,
    );

    googleMeetService = new GoogleMeetService(configMock);

    googleController = new GoogleController(
      googleAuthService,
      configMock,
    );

    teacherClassesService = new TeacherClassesService(
      prismaMock,
      googleAuthService,
      googleMeetService,
    );
  });

  // =========================================================================
  // TEST CASE 1: Google Login thành công và thất bại
  // =========================================================================
  describe('1. Google Login thành công và thất bại', () => {
    it('1.1 Đăng nhập Google thành công khi tài khoản đã liên kết trước đó (cấp ticket và đổi JWT)', async () => {
      const mockUser = {
        id: 'user-student-1',
        fullName: 'Học Sinh A',
        email: 'student@gmail.com',
        phone: '0987654321',
        role: UserRole.STUDENT,
        isActive: true,
      };

      // Mock exchange code & userinfo
      vi.spyOn(googleAuthService, 'exchangeCodeForTokens').mockResolvedValue({
        access_token: 'google-access-token-123',
        expires_in: 3600,
      });

      vi.spyOn(googleAuthService, 'fetchUserProfile').mockResolvedValue({
        sub: 'google-sub-student-1',
        email: 'student@gmail.com',
        email_verified: true,
        name: 'Học Sinh A',
      });

      // Mock validate state login
      vi.spyOn(googleAuthService, 'validateAndConsumeState').mockResolvedValue('login:anon');

      // User đã liên kết Google
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        id: 'uga-1',
        userId: mockUser.id,
        googleSub: 'google-sub-student-1',
        status: GoogleConnectionStatus.CONNECTED,
        user: mockUser,
      });

      const callbackResult = await googleAuthService.handleCallback({
        code: 'valid-google-auth-code',
        state: 'valid-login-state',
        iss: 'https://accounts.google.com',
      });

      expect(callbackResult.isLogin).toBe(true);
      expect(callbackResult.isLinked).toBe(true);
      expect(callbackResult.ticket).toBeDefined();

      // Đổi ticket lấy JWT VanbyNhi
      const exchangeResult = await googleController.exchangeTicket({ ticket: callbackResult.ticket });
      expect(exchangeResult.user.id).toBe('user-student-1');
      expect(exchangeResult.tokens.accessToken).toBe('mock-vanbynhi-jwt-access-token');

      // Single-use ticket: Không thể đổi lần 2
      await expect(googleController.exchangeTicket({ ticket: callbackResult.ticket })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('1.2 Đăng nhập Google thất bại khi tài khoản VanbyNhi bị vô hiệu hóa (isActive = false)', async () => {
      vi.spyOn(googleAuthService, 'exchangeCodeForTokens').mockResolvedValue({
        access_token: 'valid-token',
        expires_in: 3600,
      });
      vi.spyOn(googleAuthService, 'fetchUserProfile').mockResolvedValue({
        sub: 'google-sub-banned',
        email: 'banned@gmail.com',
        email_verified: true,
      });
      vi.spyOn(googleAuthService, 'validateAndConsumeState').mockResolvedValue('login:anon');

      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        id: 'uga-banned',
        userId: 'user-banned',
        googleSub: 'google-sub-banned',
        status: GoogleConnectionStatus.CONNECTED,
        user: {
          id: 'user-banned',
          isActive: false, // Bị khóa
        },
      });

      await expect(
        googleAuthService.handleCallback({
          code: 'auth-code',
          state: 'login-state',
          iss: 'https://accounts.google.com',
        }),
      ).rejects.toThrow('Tài khoản người dùng không tồn tại hoặc đã bị khóa');
    });

    it('1.3 Đăng nhập Google thất bại khi email chưa được xác minh (email_verified = false)', async () => {
      vi.spyOn(googleAuthService, 'exchangeCodeForTokens').mockResolvedValue({
        access_token: 'valid-token',
        expires_in: 3600,
      });
      vi.spyOn(googleAuthService, 'fetchUserProfile').mockResolvedValue({
        sub: 'google-sub-unverified',
        email: 'unverified@gmail.com',
        email_verified: false, // CHƯA XÁC MINH
      });
      vi.spyOn(googleAuthService, 'validateAndConsumeState').mockResolvedValue('login:anon');

      await expect(
        googleAuthService.handleCallback({
          code: 'auth-code',
          state: 'login-state',
          iss: 'https://accounts.google.com',
        }),
      ).rejects.toThrow('Địa chỉ email Google chưa được xác minh');
    });

    it('1.4 Khi Google account chưa liên kết: KHÔNG tự động đăng nhập, trả về linkTicket để xác minh mật khẩu', async () => {
      vi.spyOn(googleAuthService, 'exchangeCodeForTokens').mockResolvedValue({
        access_token: 'valid-token',
        expires_in: 3600,
      });
      vi.spyOn(googleAuthService, 'fetchUserProfile').mockResolvedValue({
        sub: 'google-sub-new',
        email: 'newbie@gmail.com',
        email_verified: true,
      });
      vi.spyOn(googleAuthService, 'validateAndConsumeState').mockResolvedValue('login:anon');

      // Chưa có trong DB
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue(null);

      const result = await googleAuthService.handleCallback({
        code: 'auth-code',
        state: 'login-state',
        iss: 'https://accounts.google.com',
      });

      expect(result.isLogin).toBe(true);
      expect(result.isLinked).toBe(false);
      expect(result.linkTicket).toBeDefined();
      expect(result.email).toBe('newbie@gmail.com');
    });
  });

  // =========================================================================
  // TEST CASE 2: Liên kết và ngắt liên kết Google
  // =========================================================================
  describe('2. Liên kết và ngắt liên kết Google', () => {
    it('2.1 Giáo viên liên kết Google thành công và lưu encryptedRefreshToken', async () => {
      vi.spyOn(googleAuthService, 'validateAndConsumeState').mockResolvedValue('teacher-1');
      vi.spyOn(googleAuthService, 'exchangeCodeForTokens').mockResolvedValue({
        access_token: 'teacher-access-token',
        refresh_token: 'teacher-1-refresh-token',
        expires_in: 3600,
      });
      vi.spyOn(googleAuthService, 'fetchUserProfile').mockResolvedValue({
        sub: 'google-teacher-1-sub',
        email: 'teacher1@school.edu.vn',
        email_verified: true,
      });

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        isActive: true,
        googleAccount: null,
      });
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue(null);
      prismaMock.userGoogleAccount.upsert.mockResolvedValue({
        email: 'teacher1@school.edu.vn',
        googleSub: 'google-teacher-1-sub',
        status: GoogleConnectionStatus.CONNECTED,
        lastConnectedAt: new Date(),
      });

      const res = await googleAuthService.handleCallback({
        code: 'valid-code',
        state: 'teacher-state',
        iss: 'https://accounts.google.com',
      });

      expect(res.message).toContain('Liên kết tài khoản Google thành công');
      expect(cryptoMock.encrypt).toHaveBeenCalledWith('teacher-1-refresh-token');
      expect(prismaMock.userGoogleAccount.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'teacher-1' },
          create: expect.objectContaining({
            userId: 'teacher-1',
            googleSub: 'google-teacher-1-sub',
            encryptedRefreshToken: 'enc:teacher-1-refresh-token',
            status: GoogleConnectionStatus.CONNECTED,
          }),
        }),
      );
    });

    it('2.2 Ngắt liên kết Google: xóa refresh token và chuyển status sang DISCONNECTED', async () => {
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
      });

      await googleAuthService.disconnect('teacher-1');

      expect(prismaMock.userGoogleAccount.update).toHaveBeenCalledWith({
        where: { userId: 'teacher-1' },
        data: {
          status: GoogleConnectionStatus.DISCONNECTED,
          encryptedRefreshToken: null,
        },
      });
    });
  });

  // =========================================================================
  // TEST CASE 3 & 4: Reconnect, refresh token & Google không trả refresh token
  // =========================================================================
  describe('3 & 4. Reconnect & Google không trả refresh token lần consent tiếp theo', () => {
    it('3.1 Tự động refresh token khi token hết hạn qua Google Token Endpoint', async () => {
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-1',
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: 'enc:existing-refresh-token',
      });

      // Mock fetch Google OAuth2 token endpoint
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'brand-new-refreshed-access-token',
          expires_in: 3600,
        }),
      } as any);

      const token = await googleAuthService.getValidAccessToken('teacher-1');
      expect(token).toBe('brand-new-refreshed-access-token');
      expect(cryptoMock.decrypt).toHaveBeenCalledWith('enc:existing-refresh-token');

      // Verify endpoint params
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('grant_type=refresh_token'),
        }),
      );
    });

    it('4.1 Giữ nguyên refresh token cũ khi Google không trả refresh token ở lần consent tiếp theo', async () => {
      vi.spyOn(googleAuthService, 'validateAndConsumeState').mockResolvedValue('teacher-1');
      vi.spyOn(googleAuthService, 'exchangeCodeForTokens').mockResolvedValue({
        access_token: 'new-access-token',
        // KHÔNG có refresh_token
        expires_in: 3600,
      });
      vi.spyOn(googleAuthService, 'fetchUserProfile').mockResolvedValue({
        sub: 'google-teacher-1-sub',
        email: 'teacher1@school.edu.vn',
        email_verified: true,
      });

      // User đã có encryptedRefreshToken cũ
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        isActive: true,
        googleAccount: {
          encryptedRefreshToken: 'enc:pre-existing-refresh-token',
        },
      });
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue(null);
      prismaMock.userGoogleAccount.upsert.mockResolvedValue({
        email: 'teacher1@school.edu.vn',
        googleSub: 'google-teacher-1-sub',
        status: GoogleConnectionStatus.CONNECTED,
        lastConnectedAt: new Date(),
      });

      await googleAuthService.handleCallback({
        code: 'code',
        state: 'state',
        iss: 'https://accounts.google.com',
      });

      // Vẫn lưu bằng pre-existing token
      expect(prismaMock.userGoogleAccount.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            encryptedRefreshToken: 'enc:pre-existing-refresh-token',
          }),
        }),
      );
    });

    it('4.2 Ném lỗi hướng dẫn khi Google không trả refresh token và trong DB cũng chưa có', async () => {
      vi.spyOn(googleAuthService, 'validateAndConsumeState').mockResolvedValue('teacher-1');
      vi.spyOn(googleAuthService, 'exchangeCodeForTokens').mockResolvedValue({
        access_token: 'new-access-token',
        expires_in: 3600,
      });
      vi.spyOn(googleAuthService, 'fetchUserProfile').mockResolvedValue({
        sub: 'google-teacher-1-sub',
        email: 'teacher1@school.edu.vn',
        email_verified: true,
      });

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        isActive: true,
        googleAccount: null, // Chưa có token
      });
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue(null);

      await expect(
        googleAuthService.handleCallback({
          code: 'code',
          state: 'state',
          iss: 'https://accounts.google.com',
        }),
      ).rejects.toThrow('Google không trả về Refresh Token');
    });
  });

  // =========================================================================
  // TEST CASE 5, 6, 7: Hai giáo viên với 2 tài khoản Google khác nhau & dùng đúng token
  // =========================================================================
  describe('5, 6, 7. Đảm bảo Teacher A dùng Token A, Teacher B dùng Token B', () => {
    it('5.1 Teacher A và Teacher B có hai tài khoản Google riêng biệt', async () => {
      prismaMock.userGoogleAccount.findUnique.mockImplementation(({ where }: any) => {
        if (where.userId === 'teacher-A') {
          return Promise.resolve({
            userId: 'teacher-A',
            googleSub: 'google-sub-teacher-A',
            email: 'teacherA@school.edu.vn',
            status: GoogleConnectionStatus.CONNECTED,
          });
        }
        if (where.userId === 'teacher-B') {
          return Promise.resolve({
            userId: 'teacher-B',
            googleSub: 'google-sub-teacher-B',
            email: 'teacherB@school.edu.vn',
            status: GoogleConnectionStatus.CONNECTED,
          });
        }
        return Promise.resolve(null);
      });

      const statusA = await googleAuthService.getConnectionStatus('teacher-A');
      const statusB = await googleAuthService.getConnectionStatus('teacher-B');

      expect(statusA.email).toBe('teacherA@school.edu.vn');
      expect(statusB.email).toBe('teacherB@school.edu.vn');
      expect(statusA.email).not.toBe(statusB.email);
    });

    it('6 & 7. Teacher A tạo Meet phải dùng Token A; Teacher B tạo Meet phải dùng Token B', async () => {
      // Mock getValidAccessToken
      vi.spyOn(googleAuthService, 'getValidAccessToken').mockImplementation(async (userId: string) => {
        if (userId === 'teacher-A') return 'google-access-token-OF-TEACHER-A';
        if (userId === 'teacher-B') return 'google-access-token-OF-TEACHER-B';
        throw new Error('Unknown teacher');
      });

      const createSpaceSpy = vi.spyOn(googleMeetService, 'createSpace').mockImplementation(async (token: string) => {
        if (token === 'google-access-token-OF-TEACHER-A') {
          return {
            name: 'spaces/space-A',
            meetingUri: 'https://meet.google.com/aaa-bbbb-ccc',
            meetingCode: 'aaa-bbbb-ccc',
          };
        }
        if (token === 'google-access-token-OF-TEACHER-B') {
          return {
            name: 'spaces/space-B',
            meetingUri: 'https://meet.google.com/xxx-yyyy-zzz',
            meetingCode: 'xxx-yyyy-zzz',
          };
        }
        throw new Error('Invalid token passed to Google Meet API');
      });

      // Teacher A tạo lớp
      prismaMock.user.findUnique.mockImplementation(({ where }: any) => {
        return Promise.resolve({ id: where.id, role: UserRole.TEACHER, isActive: true });
      });

      prismaMock.userGoogleAccount.findUnique.mockImplementation(({ where }: any) => {
        return Promise.resolve({
          userId: where.userId,
          status: GoogleConnectionStatus.CONNECTED,
          encryptedRefreshToken: `enc:${where.userId}`,
        });
      });

      prismaMock.class.create.mockImplementation(({ data }: any) => {
        return Promise.resolve({ id: `class-of-${data.teacherId}`, ...data });
      });
      prismaMock.classMeetSpace.create.mockImplementation(({ data }: any) => {
        return Promise.resolve({ id: `meet-space-of-${data.classId}`, ...data });
      });
      prismaMock.classMeetSpace.update.mockImplementation(({ data }: any) => {
        return Promise.resolve(data);
      });
      prismaMock.class.update.mockImplementation(({ data }: any) => {
        return Promise.resolve(data);
      });

      // 1. Teacher A tạo lớp
      await teacherClassesService.createClass('teacher-A', {
        name: 'Lớp Văn 10 - Cô A',
      });

      // Xác minh cuộc gọi đầu tiên dùng chính xác Token A
      expect(createSpaceSpy).toHaveBeenNthCalledWith(1, 'google-access-token-OF-TEACHER-A');

      // 2. Teacher B tạo lớp
      await teacherClassesService.createClass('teacher-B', {
        name: 'Lớp Văn 11 - Thầy B',
      });

      // Xác minh cuộc gọi thứ hai dùng chính xác Token B
      expect(createSpaceSpy).toHaveBeenNthCalledWith(2, 'google-access-token-OF-TEACHER-B');
    });
  });

  // =========================================================================
  // TEST CASE 8 & 9: Token hết quyền & Insufficient Scope
  // =========================================================================
  describe('8 & 9. Xử lý khi Token hết quyền hoặc không có scope cần thiết', () => {
    it('8.1 Khi Google trả về invalid_grant: chuyển trạng thái sang NEEDS_REAUTH', async () => {
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        userId: 'teacher-revoked',
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: 'enc:revoked-token',
      });

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'invalid_grant' }),
      } as any);

      await expect(
        googleAuthService.getValidAccessToken('teacher-revoked'),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaMock.userGoogleAccount.update).toHaveBeenCalledWith({
        where: { userId: 'teacher-revoked' },
        data: { status: GoogleConnectionStatus.NEEDS_REAUTH },
      });
    });

    it('9.1 Google API trả về lỗi 403 Insufficient Scope: ném BadGatewayException và ghi nhận lỗi', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: {
            code: 403,
            message: 'Request had insufficient authentication scopes.',
            status: 'PERMISSION_DENIED',
          },
        }),
      } as any);

      await expect(
        googleMeetService.createSpace('token-without-meet-scope'),
      ).rejects.toThrow(BadGatewayException);
    });
  });

  // =========================================================================
  // TEST CASE 10: Hai giáo viên hoạt động đồng thời (Concurrency)
  // =========================================================================
  describe('10. Hai giáo viên hoạt động đồng thời không gây nhầm token', () => {
    it('chạy đồng thời 2 tác vụ tạo Meet bằng Promise.all: token luôn phân tách chuẩn xác', async () => {
      const tokenOrder: string[] = [];

      vi.spyOn(googleAuthService, 'getValidAccessToken').mockImplementation(async (userId: string) => {
        // Giả lập độ trễ mạng khác nhau
        if (userId === 'teacher-A') {
          await new Promise((r) => setTimeout(r, 20));
          return 'TOKEN-TEACHER-A';
        }
        if (userId === 'teacher-B') {
          await new Promise((r) => setTimeout(r, 5));
          return 'TOKEN-TEACHER-B';
        }
        return '';
      });

      vi.spyOn(googleMeetService, 'createSpace').mockImplementation(async (token: string) => {
        tokenOrder.push(token);
        return {
          name: `spaces/${token}`,
          meetingUri: `https://meet.google.com/${token.toLowerCase()}`,
          meetingCode: token.toLowerCase(),
        };
      });

      prismaMock.user.findUnique.mockResolvedValue({ id: 'teacher', role: UserRole.TEACHER, isActive: true });
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue({
        status: GoogleConnectionStatus.CONNECTED,
        encryptedRefreshToken: 'enc:token',
      });
      prismaMock.class.create.mockImplementation(({ data }: any) => Promise.resolve({ id: `c-${data.teacherId}`, ...data }));
      prismaMock.classMeetSpace.create.mockImplementation(({ data }: any) => Promise.resolve({ id: `ms-${data.classId}`, ...data }));
      prismaMock.classMeetSpace.update.mockResolvedValue({});
      prismaMock.class.update.mockResolvedValue({});

      // Chạy song song
      await Promise.all([
        teacherClassesService.createClass('teacher-A', { name: 'Lớp A' }),
        teacherClassesService.createClass('teacher-B', { name: 'Lớp B' }),
      ]);

      expect(tokenOrder).toHaveLength(2);
      expect(tokenOrder).toContain('TOKEN-TEACHER-A');
      expect(tokenOrder).toContain('TOKEN-TEACHER-B');
    });
  });

  // =========================================================================
  // TEST CASE 11: Giáo viên không thể sử dụng kết nối của người khác
  // =========================================================================
  describe('11. Giáo viên không thể sử dụng kết nối của người khác (Ownership check)', () => {
    it('Teacher A không thể retry tạo Meet cho lớp thuộc sở hữu của Teacher B', async () => {
      // Lớp thuộc về teacher-B
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-of-B',
        teacherId: 'teacher-B',
        name: 'Lớp Cô B',
      });

      // Teacher A cố tình gọi hàm retry trên lớp của Teacher B
      await expect(
        teacherClassesService.retryCreateClassMeetSpace('teacher-A', 'class-of-B'),
      ).rejects.toThrow(ForbiddenException);

      // Tuyệt đối không gọi Google API
      expect(prismaMock.classMeetSpace.update).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // TEST CASE 12: Retry tạo Meet không tạo dữ liệu trùng ngoài ý muốn
  // =========================================================================
  describe('12. Retry tạo Meet không tạo dữ liệu trùng (Idempotency & Debounce)', () => {
    it('12.1 Khi phòng đã READY: retry trả về phòng hiện tại, không gọi Google API mới', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-1',
        teacherId: 'teacher-1',
        name: 'Lớp 12A',
      });

      prismaMock.classMeetSpace.findUnique.mockResolvedValue({
        id: 'space-1',
        classId: 'class-1',
        status: MeetSpaceStatus.READY,
        meetingUri: 'https://meet.google.com/existing-room',
      });

      const createSpaceSpy = vi.spyOn(googleMeetService, 'createSpace');

      const result = await teacherClassesService.retryCreateClassMeetSpace('teacher-1', 'class-1');

      expect(result.message).toContain('đã có phòng Google Meet sẵn sàng');
      expect(result.meetSpace.meetingUri).toBe('https://meet.google.com/existing-room');
      expect(createSpaceSpy).not.toHaveBeenCalled();
    });

    it('12.2 Khi đang PENDING trong vòng 10 giây qua: debounce từ chối request dồn dập', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-1',
        teacherId: 'teacher-1',
        name: 'Lớp 12A',
      });

      prismaMock.classMeetSpace.findUnique.mockResolvedValue({
        id: 'space-1',
        classId: 'class-1',
        status: MeetSpaceStatus.PENDING,
        lastAttemptAt: new Date(), // Vừa mới gọi
      });

      const createSpaceSpy = vi.spyOn(googleMeetService, 'createSpace');

      const result = await teacherClassesService.retryCreateClassMeetSpace('teacher-1', 'class-1');

      expect(result.message).toContain('đang được xử lý, vui lòng chờ trong giây lát');
      expect(createSpaceSpy).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // TEST CASE 13: Link Meet được lưu và truy xuất đúng lịch/lớp
  // =========================================================================
  describe('13. Link Meet được lưu và truy xuất đúng lịch/lớp', () => {
    it('Lấy đúng thông tin meetSpace gắn với classId của giáo viên', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'class-10A',
        teacherId: 'teacher-1',
        name: 'Văn 10 Chuyên',
        defaultMeetUrl: 'https://meet.google.com/van-10a-meet',
      });

      prismaMock.classMeetSpace.findUnique.mockResolvedValue({
        id: 'space-10A',
        classId: 'class-10A',
        meetingUri: 'https://meet.google.com/van-10a-meet',
        meetingCode: 'van-10a-meet',
        status: MeetSpaceStatus.READY,
      });

      const res = await teacherClassesService.getClassMeetSpace('teacher-1', 'class-10A');
      expect(res.classId).toBe('class-10A');
      expect(res.className).toBe('Văn 10 Chuyên');
      expect(res.defaultMeetUrl).toBe('https://meet.google.com/van-10a-meet');
      expect(res.meetSpace?.meetingUri).toBe('https://meet.google.com/van-10a-meet');
    });
  });

  // =========================================================================
  // TEST CASE 14: DURABLE OAUTH TICKETS REGRESSION TESTS (9 KỊCH BẢN BẮT BUỘC)
  // =========================================================================
  describe('14. DURABLE OAUTH TICKETS REGRESSION TESTS (PostgreSQL Shared Storage)', () => {
    it('14.1 Ticket còn hạn đổi thành công (chỉ lưu hash, payload được mã hóa và giải mã an toàn)', async () => {
      const payload = {
        message: 'Đăng nhập thành công',
        user: { id: 'u-1', email: 'user@gmail.com' },
        tokens: { accessToken: 'jwt-access-token' },
      };

      // Tạo exchange ticket
      const ticket = await googleAuthService.createExchangeTicket(payload, 2 * 60 * 1000);
      expect(typeof ticket).toBe('string');
      expect(ticket.length).toBe(64); // 32 bytes hex

      // Xác minh DB không lưu ticket plaintext, mà lưu mã băm SHA-256
      const executeCalls = prismaMock.$executeRawUnsafe.mock.calls;
      const insertCall = executeCalls.find((call: any[]) =>
        call[0].includes('INSERT INTO "google_oauth_tickets"'),
      );
      expect(insertCall).toBeDefined();
      const ticketHashInDb = insertCall[1];
      expect(ticketHashInDb).not.toBe(ticket); // Khác với plaintext ticket
      expect(ticketHashInDb.length).toBe(64); // SHA-256 hex length

      // Đổi ticket thành công
      const consumed = await googleAuthService.consumeExchangeTicket(ticket);
      expect(consumed).toEqual(payload);
    });

    it('14.2 Ticket hết hạn bị từ chối và trả về null (fail closed)', async () => {
      const payload = { test: 'expired-data' };
      // Tạo ticket với TTL âm (đã hết hạn)
      const ticket = await googleAuthService.createExchangeTicket(payload, -1000);

      const consumed = await googleAuthService.consumeExchangeTicket(ticket);
      expect(consumed).toBeNull();

      // Controller ném UnauthorizedException
      await expect(googleController.exchangeTicket({ ticket })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('14.3 Ticket đã dùng không thể dùng lại (Single-use atomicity chống replay attack)', async () => {
      const payload = { test: 'single-use-data' };
      const ticket = await googleAuthService.createExchangeTicket(payload, 60000);

      // Lần 1: Thành công
      const firstConsume = await googleAuthService.consumeExchangeTicket(ticket);
      expect(firstConsume).toEqual(payload);

      // Lần 2 (Replay): Thất bại
      const secondConsume = await googleAuthService.consumeExchangeTicket(ticket);
      expect(secondConsume).toBeNull();

      // Controller ném UnauthorizedException khi replay
      await expect(googleController.exchangeTicket({ ticket })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('14.4 Hai request cùng đổi một ticket (Race condition): chỉ có đúng một request thành công', async () => {
      const payload = { test: 'concurrent-race-data' };
      const ticket = await googleAuthService.createExchangeTicket(payload, 60000);

      // Chạy 2 request đồng thời
      const results = await Promise.all([
        googleAuthService.consumeExchangeTicket(ticket),
        googleAuthService.consumeExchangeTicket(ticket),
      ]);

      const successCount = results.filter((r) => r !== null).length;
      const failureCount = results.filter((r) => r === null).length;

      // Đúng 1 request thành công, 1 request thất bại
      expect(successCount).toBe(1);
      expect(failureCount).toBe(1);
    });

    it('14.5 Ticket được tạo ở Instance A nhưng đổi ở Instance B vẫn hoạt động (Shared PostgreSQL Storage)', async () => {
      // Giả lập Instance A và Instance B là 2 server NestJS riêng biệt cùng trỏ vào 1 cơ sở dữ liệu PostgreSQL chung
      const instanceA = new GoogleAuthService(configMock, prismaMock, cryptoMock as any, authServiceMock);
      const instanceB = new GoogleAuthService(configMock, prismaMock, cryptoMock as any, authServiceMock);

      const payload = { user: { id: 'user-shared-db' }, tokens: { accessToken: 'instance-token' } };

      // Instance A tạo ticket
      const ticket = await instanceA.createExchangeTicket(payload, 60000);

      // Instance B nhận request và tiêu thụ ticket từ shared PostgreSQL database
      const consumedByB = await instanceB.consumeExchangeTicket(ticket);
      expect(consumedByB).toEqual(payload);

      // Sau khi Instance B đã tiêu thụ, Instance A không thể tiêu thụ lại
      const reConsumedByA = await instanceA.consumeExchangeTicket(ticket);
      expect(reConsumedByA).toBeNull();
    });

    it('14.6 Restart backend không làm mất ticket hợp lệ (Durable Persistence)', async () => {
      const payload = { message: 'persistent-across-restart' };

      // Server trước khi restart tạo ticket
      const preRestartService = new GoogleAuthService(configMock, prismaMock, cryptoMock as any, authServiceMock);
      const ticket = await preRestartService.createExchangeTicket(payload, 60000);

      // Backend restart (hủy instance cũ, khởi tạo new GoogleAuthService)
      const postRestartService = new GoogleAuthService(configMock, prismaMock, cryptoMock as any, authServiceMock);

      // Ticket vẫn hợp lệ và được tiêu thụ thành công
      const consumed = await postRestartService.consumeExchangeTicket(ticket);
      expect(consumed).toEqual(payload);
    });

    it('14.7 Ticket của User A không thể dùng để gắn vào User B (Identity Protection)', async () => {
      // linkTicket chứa profile của Google A
      const profileA: any = {
        sub: 'google-sub-user-A',
        email: 'userA@gmail.com',
        email_verified: true,
      };

      const linkTicket = await googleAuthService.createLinkTicket(profileA, 60000);

      // Kẻ xấu B cố gắng dùng linkTicket này nhưng cung cấp mật khẩu của User B
      // Giả sử User B nhập thông tin của họ
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'user-B',
        email: 'userB@vanbynhi.vn',
        passwordHash: '$2b$10$hashedpassword',
        isActive: true,
      });

      // User B đã liên kết với Google Sub khác trước đó
      prismaMock.userGoogleAccount.findUnique.mockResolvedValueOnce({
        userId: 'user-B',
        googleSub: 'other-sub',
        status: GoogleConnectionStatus.CONNECTED,
      });

      // Vi bcrypt compare match
      const bcrypt = await import('bcrypt');
      vi.spyOn(bcrypt.default, 'compare').mockResolvedValue(true as any);

      // Bị từ chối vì tài khoản này đã liên kết với Google khác
      await expect(
        googleAuthService.linkGoogleAccount({
          linkTicket,
          identifier: 'userB@vanbynhi.vn',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('14.8 Google Login: khi email đã tồn tại trong VanbyNhi nhưng chưa liên kết, yêu cầu xác thực mật khẩu', async () => {
      vi.spyOn(googleAuthService, 'validateAndConsumeState').mockResolvedValue('login:anon');
      vi.spyOn(googleAuthService, 'exchangeCodeForTokens').mockResolvedValue({
        access_token: 'google-token',
        expires_in: 3600,
      });
      vi.spyOn(googleAuthService, 'fetchUserProfile').mockResolvedValue({
        sub: 'google-sub-existing-email',
        email: 'existing@vanbynhi.vn',
        email_verified: true,
      });

      // Chưa có UserGoogleAccount
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue(null);

      const callbackResult = await googleAuthService.handleCallback({
        code: 'code-123',
        state: 'login-state',
        iss: 'https://accounts.google.com',
      });

      // KHÔNG tự động liên kết hoặc đăng nhập bừa bãi
      expect(callbackResult.isLogin).toBe(true);
      expect(callbackResult.isLinked).toBe(false);
      expect(callbackResult.linkTicket).toBeDefined();
      expect(callbackResult.email).toBe('existing@vanbynhi.vn');
    });

    it('14.9 Google Login: khi email chưa tồn tại trong VanbyNhi, từ chối khi xác minh tài khoản không có thật', async () => {
      const profile = {
        sub: 'google-sub-nonexistent',
        email: 'nonexistent@gmail.com',
        email_verified: true,
      };

      const linkTicket = await googleAuthService.createLinkTicket(profile as any, 60000);

      // Tìm kiếm user trả về null (chưa đăng ký trong hệ thống)
      prismaMock.user.findFirst.mockResolvedValue(null);

      // Từ chối và ném UnauthorizedException
      await expect(
        googleAuthService.linkGoogleAccount({
          linkTicket,
          identifier: 'nonexistent@gmail.com',
          password: 'any-password',
        }),
      ).rejects.toThrow('Thông tin tài khoản xác minh không chính xác');
    });

    it('14.10 linkTicket khi nhập sai mật khẩu chưa bị tiêu thụ, cho phép nhập lại mật khẩu đúng thành công; sau khi liên kết vé không thể dùng lại', async () => {
      const profile = {
        sub: 'google-sub-retry-test',
        email: 'teacher-retry@vanbynhi.vn',
        email_verified: true,
      };

      const linkTicket = await googleAuthService.createLinkTicket(profile as any, 60000);

      // User tồn tại trong VanbyNhi
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'user-retry-1',
        email: 'teacher-retry@vanbynhi.vn',
        passwordHash: '$2b$10$realhash',
        isActive: true,
      });

      // Lần 1: Nhập sai mật khẩu (bcrypt compare trả về false)
      const bcrypt = await import('bcrypt');
      vi.spyOn(bcrypt.default, 'compare').mockResolvedValueOnce(false as any);

      await expect(
        googleAuthService.linkGoogleAccount({
          linkTicket,
          identifier: 'teacher-retry@vanbynhi.vn',
          password: 'wrong-password',
        }),
      ).rejects.toThrow('Thông tin tài khoản xác minh không chính xác');

      // Lần 2: Nhập đúng mật khẩu với CÙNG linkTicket (bcrypt compare trả về true)
      vi.spyOn(bcrypt.default, 'compare').mockResolvedValueOnce(true as any);
      prismaMock.userGoogleAccount.findUnique.mockResolvedValue(null);
      prismaMock.userGoogleAccount.upsert.mockResolvedValue({
        userId: 'user-retry-1',
        googleSub: profile.sub,
        email: profile.email,
        status: GoogleConnectionStatus.CONNECTED,
      });

      const linkResult = await googleAuthService.linkGoogleAccount({
        linkTicket,
        identifier: 'teacher-retry@vanbynhi.vn',
        password: 'correct-password',
      });

      expect(linkResult.message).toBe('Liên kết tài khoản Google thành công');

      // Lần 3 (Replay sau khi đã liên kết thành công): linkTicket đã bị consume nên bị từ chối
      await expect(
        googleAuthService.linkGoogleAccount({
          linkTicket,
          identifier: 'teacher-retry@vanbynhi.vn',
          password: 'correct-password',
        }),
      ).rejects.toThrow('Mã liên kết không hợp lệ hoặc đã hết hạn');
    });
  });
});
