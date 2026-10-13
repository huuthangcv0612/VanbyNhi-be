import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { UserRole } from '../../generated/prisma/client.js';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaMock: any;
  let jwtServiceMock: any;
  let configServiceMock: any;
  let zaloOAuthServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      refreshToken: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      authAccount: {
        upsert: vi.fn(),
        deleteMany: vi.fn(),
      },
      $transaction: vi.fn((ops) => Promise.all(ops)),
    };

    jwtServiceMock = {
      signAsync: vi.fn().mockResolvedValue('mock-access-token'),
      verifyAsync: vi.fn(),
    };

    configServiceMock = {
      get: vi.fn((key: string) => {
        if (key === 'JWT_ACCESS_SECRET')
          return 'super-secret-key-at-least-32-chars';
        if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
        if (key === 'JWT_REFRESH_EXPIRES_DAYS') return '7';
        if (key === 'FRONTEND_URL') return 'http://localhost:5173';
        return null;
      }),
    };

    zaloOAuthServiceMock = {
      getAuthorizationUrl: vi
        .fn()
        .mockReturnValue('https://oauth.zaloapp.com/v4/permission?mock=1'),
      validateAndConsumeState: vi.fn(),
      exchangeCodeForAccessToken: vi.fn(),
      getZaloUserProfile: vi.fn(),
      createExchangeTicket: vi.fn().mockReturnValue('mock-exchange-ticket'),
      consumeExchangeTicket: vi.fn(),
      createLinkTicket: vi.fn().mockReturnValue('mock-link-ticket'),
      consumeLinkTicket: vi.fn(),
    };

    authService = new AuthService(
      prismaMock,
      jwtServiceMock,
      configServiceMock,
      zaloOAuthServiceMock,
    );
  });

  describe('Đăng nhập (Login)', () => {
    it('đăng nhập thành công bằng email', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const mockUser = {
        id: 'user-1',
        fullName: 'Nguyễn Văn A',
        phone: '0901234567',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        avatarUrl: null,
      };

      prismaMock.user.findFirst.mockResolvedValue(mockUser);
      prismaMock.refreshToken.create.mockResolvedValue({ id: 'rt-1' });

      const result = await authService.login({
        identifier: '  TEST@example.com  ',
        password: plainPassword,
      });

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result.tokens.accessToken).toBe('mock-access-token');
      expect(result.tokens.refreshToken).toBeDefined();
      expect(result.user.id).toBe('user-1');
      // Không để lộ passwordHash
      expect((result.user as any).passwordHash).toBeUndefined();
    });

    it('đăng nhập thành công bằng số điện thoại', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const mockUser = {
        id: 'user-2',
        fullName: 'Trần Thị B',
        phone: '0987654321',
        email: null,
        passwordHash: hashedPassword,
        role: 'TEACHER',
        isActive: true,
        avatarUrl: null,
      };

      prismaMock.user.findFirst.mockResolvedValue(mockUser);
      prismaMock.refreshToken.create.mockResolvedValue({ id: 'rt-2' });

      const result = await authService.login({
        identifier: '  0987654321  ',
        password: plainPassword,
      });

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { phone: '0987654321' },
      });
      expect(result.tokens.accessToken).toBe('mock-access-token');
      expect(result.user.id).toBe('user-2');
    });

    it('báo lỗi chung khi tài khoản không tồn tại', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(
        authService.login({
          identifier: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('báo lỗi chung khi sai mật khẩu', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 10);

      const mockUser = {
        id: 'user-1',
        phone: '0901234567',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        isActive: true,
      };

      prismaMock.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        authService.login({
          identifier: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('báo lỗi khi tài khoản đã bị vô hiệu hóa (isActive = false)', async () => {
      const mockUser = {
        id: 'user-1',
        phone: '0901234567',
        email: 'test@example.com',
        passwordHash: 'some-hash',
        isActive: false,
      };

      prismaMock.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        authService.login({
          identifier: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Tài khoản của bạn đã bị vô hiệu hóa hoặc khóa');
    });

    it('báo lỗi an toàn InternalServerErrorException khi thiếu JWT_ACCESS_SECRET trong môi trường', async () => {
      configServiceMock.get.mockImplementation((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return null;
        return null;
      });

      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const mockUser = {
        id: 'user-1',
        fullName: 'Nguyễn Văn A',
        phone: '0901234567',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: 'STUDENT',
        isActive: true,
      };

      prismaMock.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        authService.login({
          identifier: 'test@example.com',
          password: plainPassword,
        }),
      ).rejects.toThrow(InternalServerErrorException);

      await expect(
        authService.login({
          identifier: 'test@example.com',
          password: plainPassword,
        }),
      ).rejects.toThrow(
        'Lỗi cấu hình hệ thống: Không thể xử lý yêu cầu xác thực',
      );
    });
  });

  describe('Làm mới Token (Refresh Token Rotation)', () => {
    it('làm mới token thành công và thu hồi token cũ', async () => {
      const rawOldToken = 'raw-old-token-abc';
      const tokenHash = authService.hashToken(rawOldToken);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const existingToken = {
        id: 'token-1',
        userId: 'user-1',
        tokenHash,
        isRevoked: false,
        expiresAt: futureDate,
        user: {
          id: 'user-1',
          phone: '0901234567',
          email: 'test@example.com',
          role: 'STUDENT',
          isActive: true,
        },
      };

      prismaMock.refreshToken.findUnique.mockResolvedValue(existingToken);

      const result = await authService.refresh({ refreshToken: rawOldToken });

      expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { tokenHash },
        include: { user: true },
      });
      // Xác nhận transaction thu hồi token cũ và sinh token mới
      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(result.tokens.accessToken).toBe('mock-access-token');
      expect(result.tokens.refreshToken).toBeDefined();
      expect(result.tokens.refreshToken).not.toBe(rawOldToken);
    });

    it('từ chối khi refresh token đã bị thu hồi (isRevoked = true)', async () => {
      const rawToken = 'revoked-token';
      const tokenHash = authService.hashToken(rawToken);

      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: 'token-revoked',
        tokenHash,
        isRevoked: true,
        expiresAt: new Date(Date.now() + 100000),
        user: { isActive: true },
      });

      await expect(
        authService.refresh({ refreshToken: rawToken }),
      ).rejects.toThrow('Refresh token đã bị thu hồi hoặc đã được sử dụng');
    });

    it('từ chối khi refresh token đã hết hạn (expiresAt trong quá khứ)', async () => {
      const rawToken = 'expired-token';
      const tokenHash = authService.hashToken(rawToken);

      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: 'token-expired',
        tokenHash,
        isRevoked: false,
        expiresAt: new Date(Date.now() - 100000), // đã hết hạn
        user: { isActive: true },
      });

      await expect(
        authService.refresh({ refreshToken: rawToken }),
      ).rejects.toThrow('Refresh token đã hết hạn');
    });
  });

  describe('Đăng xuất (Logout)', () => {
    it('thu hồi token thành công', async () => {
      const rawToken = 'valid-token';
      const tokenHash = authService.hashToken(rawToken);

      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: 'token-logout',
        tokenHash,
        isRevoked: false,
      });

      const result = await authService.logout({ refreshToken: rawToken });

      expect(prismaMock.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'token-logout' },
        data: { isRevoked: true },
      });
      expect(result.message).toBe('Đăng xuất thành công');
    });
  });

  describe('Đăng ký tài khoản (Register)', () => {
    const registerInput = {
      fullName: '  Lê Văn C  ',
      email: '  LeVanC@Example.Com  ',
      phone: '  0912345678  ',
      password: 'password123',
      dateOfBirth: '2005-01-15',
    };

    it('đăng ký thành công với dữ liệu hợp lệ (chuẩn hóa email, phone, băm mật khẩu, gán role STUDENT)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const createdUser = {
        id: 'new-user-id',
        fullName: 'Lê Văn C',
        email: 'levanc@example.com',
        phone: '0912345678',
        role: UserRole.STUDENT,
        isActive: true,
        dateOfBirth: new Date('2005-01-15'),
        createdAt: new Date(),
      };
      prismaMock.user.create.mockResolvedValue(createdUser);

      const result = await authService.register(registerInput);

      // Kiểm tra chuẩn hóa email và phone khi kiểm tra trùng lặp
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'levanc@example.com' },
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { phone: '0912345678' },
      });

      // Kiểm tra tham số gọi prisma.create
      expect(prismaMock.user.create).toHaveBeenCalled();
      const createCallArg = prismaMock.user.create.mock.calls[0][0];
      expect(createCallArg.data.fullName).toBe('Lê Văn C');
      expect(createCallArg.data.email).toBe('levanc@example.com');
      expect(createCallArg.data.phone).toBe('0912345678');
      expect(createCallArg.data.role).toBe(UserRole.STUDENT);
      expect(createCallArg.data.isActive).toBe(true);

      // Mật khẩu phải được băm bằng bcrypt, không phải plaintext
      expect(createCallArg.data.passwordHash).not.toBe(registerInput.password);
      const isHashValid = await bcrypt.compare(
        registerInput.password,
        createCallArg.data.passwordHash,
      );
      expect(isHashValid).toBe(true);

      // Kết quả trả về an toàn, không có password hay passwordHash
      expect(result.message).toBe('Đăng ký tài khoản thành công');
      expect(result.user.id).toBe('new-user-id');
      expect(result.user.email).toBe('levanc@example.com');
      expect(result.user.role).toBe(UserRole.STUDENT);
      expect((result.user as any).password).toBeUndefined();
      expect((result.user as any).passwordHash).toBeUndefined();
    });

    it('báo lỗi ConflictException (409) khi email đã tồn tại', async () => {
      prismaMock.user.findUnique.mockImplementation(async ({ where }: any) => {
        if (where.email === 'levanc@example.com') {
          return { id: 'existing-id', email: 'levanc@example.com' };
        }
        return null;
      });

      await expect(authService.register(registerInput)).rejects.toThrow(
        ConflictException,
      );
      await expect(authService.register(registerInput)).rejects.toThrow(
        'Email này đã được sử dụng',
      );
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('báo lỗi ConflictException (409) khi số điện thoại đã tồn tại', async () => {
      prismaMock.user.findUnique.mockImplementation(async ({ where }: any) => {
        if (where.phone === '0912345678') {
          return { id: 'existing-id', phone: '0912345678' };
        }
        return null;
      });

      await expect(authService.register(registerInput)).rejects.toThrow(
        ConflictException,
      );
      await expect(authService.register(registerInput)).rejects.toThrow(
        'Số điện thoại này đã được sử dụng',
      );
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('xử lý an toàn khi xảy ra race condition trùng email (lỗi P2002)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      await expect(authService.register(registerInput)).rejects.toThrow(
        'Email này đã được sử dụng',
      );
    });

    it('xử lý an toàn khi xảy ra race condition trùng số điện thoại (lỗi P2002)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['phone'] },
      });

      await expect(authService.register(registerInput)).rejects.toThrow(
        'Số điện thoại này đã được sử dụng',
      );
    });

    it('xử lý an toàn khi xảy ra race condition P2002 chung', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockRejectedValue({
        code: 'P2002',
      });

      await expect(authService.register(registerInput)).rejects.toThrow(
        'Email hoặc số điện thoại đã được sử dụng',
      );
    });

    it('ném lỗi gốc khi gặp lỗi cơ sở dữ liệu khác P2002', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(authService.register(registerInput)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('Zalo OAuth V4 Login & Callback', () => {
    it('getZaloAuthorizationUrl gọi zaloOAuthService.getAuthorizationUrl', () => {
      const url = authService.getZaloAuthorizationUrl();
      expect(zaloOAuthServiceMock.getAuthorizationUrl).toHaveBeenCalled();
      expect(url).toBe('https://oauth.zaloapp.com/v4/permission?mock=1');
    });

    it('xử lý từ chối cấp quyền khi client yêu cầu JSON (ném UnauthorizedException)', async () => {
      const mockReq: any = {
        query: { format: 'json' },
        headers: { accept: 'application/json' },
      };
      const mockRes: any = { redirect: vi.fn(), json: vi.fn() };

      await expect(
        authService.handleZaloCallback(
          { error: -14001, error_description: 'User denied permission' },
          mockReq,
          mockRes,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('xử lý từ chối cấp quyền khi trình duyệt truy cập (chuyển hướng về FRONTEND_URL với lỗi)', async () => {
      const mockReq: any = {
        query: {},
        headers: { accept: 'text/html' },
      };
      const mockRes: any = { redirect: vi.fn(), json: vi.fn() };

      await authService.handleZaloCallback(
        { error: -14001, error_description: 'User denied permission' },
        mockReq,
        mockRes,
      );

      expect(mockRes.redirect).toHaveBeenCalled();
      const redirectArg = mockRes.redirect.mock.calls[0][0];
      expect(redirectArg).toContain('http://localhost:5173/auth/zalo/callback');
      expect(redirectArg).toContain('error=zalo_access_denied');
    });

    it('ném BadRequestException nếu mã state không hợp lệ hoặc đã hết hạn', async () => {
      zaloOAuthServiceMock.validateAndConsumeState.mockReturnValue(null);
      const mockReq: any = { query: { format: 'json' }, headers: {} };
      const mockRes: any = { redirect: vi.fn(), json: vi.fn() };

      await expect(
        authService.handleZaloCallback(
          { code: 'valid-code', state: 'invalid-state' },
          mockReq,
          mockRes,
        ),
      ).rejects.toThrow('Mã state không hợp lệ hoặc phiên đăng nhập Zalo đã hết hạn');
    });

    it('đăng nhập thành công khi tài khoản đã liên kết trước đó (isLinked = true)', async () => {
      const zaloId = 'zalo-user-123';
      const mockExistingUser = {
        id: 'user-linked-1',
        fullName: 'Nguyễn Văn Liên Kết',
        phone: '0901234567',
        email: 'linked@example.com',
        role: 'STUDENT',
        isActive: true,
        zaloId,
        avatarUrl: null,
      };

      zaloOAuthServiceMock.validateAndConsumeState.mockReturnValue('valid-verifier');
      zaloOAuthServiceMock.exchangeCodeForAccessToken.mockResolvedValue('zalo-access-token');
      zaloOAuthServiceMock.getZaloUserProfile.mockResolvedValue({
        zaloId,
        name: 'Nguyễn Văn Liên Kết',
      });
      prismaMock.user.findUnique.mockResolvedValue(mockExistingUser);
      prismaMock.refreshToken.create.mockResolvedValue({ id: 'rt-1' });

      // Trường hợp trả JSON
      const mockReq: any = { query: { format: 'json' }, headers: {} };
      const mockRes: any = { redirect: vi.fn(), json: vi.fn() };

      await authService.handleZaloCallback(
        { code: 'valid-code', state: 'valid-state' },
        mockReq,
        mockRes,
      );

      expect(mockRes.json).toHaveBeenCalled();
      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData.isLinked).toBe(true);
      expect(responseData.user.id).toBe('user-linked-1');
      expect(responseData.tokens.accessToken).toBe('mock-access-token');
      expect(responseData.tokens.refreshToken).toBeDefined();
    });

    it('tài khoản đã liên kết nhưng bị khóa (isActive = false) thì từ chối đăng nhập', async () => {
      const zaloId = 'zalo-user-locked';
      const mockLockedUser = {
        id: 'user-locked-1',
        fullName: 'Người Dùng Khóa',
        phone: '0909999999',
        email: 'locked@example.com',
        role: 'STUDENT',
        isActive: false,
        zaloId,
      };

      zaloOAuthServiceMock.validateAndConsumeState.mockReturnValue('valid-verifier');
      zaloOAuthServiceMock.exchangeCodeForAccessToken.mockResolvedValue('zalo-access-token');
      zaloOAuthServiceMock.getZaloUserProfile.mockResolvedValue({
        zaloId,
        name: 'Người Dùng Khóa',
      });
      prismaMock.user.findUnique.mockResolvedValue(mockLockedUser);

      const mockReq: any = { query: { format: 'json' }, headers: {} };
      const mockRes: any = { redirect: vi.fn(), json: vi.fn() };

      await expect(
        authService.handleZaloCallback(
          { code: 'valid-code', state: 'valid-state' },
          mockReq,
          mockRes,
        ),
      ).rejects.toThrow('Tài khoản của bạn đã bị vô hiệu hóa hoặc khóa');
    });

    it('tài khoản CHƯA LIÊN KẾT: KHÔNG tự tạo user mới, cấp linkTicket yêu cầu xác minh tài khoản hiện có', async () => {
      const zaloId = 'zalo-new-user-456';
      zaloOAuthServiceMock.validateAndConsumeState.mockReturnValue('valid-verifier');
      zaloOAuthServiceMock.exchangeCodeForAccessToken.mockResolvedValue('zalo-access-token');
      zaloOAuthServiceMock.getZaloUserProfile.mockResolvedValue({
        zaloId,
        name: 'Zalo Brand New User',
      });
      // Không tìm thấy user nào có zaloId này
      prismaMock.user.findUnique.mockResolvedValue(null);

      const mockReq: any = { query: { format: 'json' }, headers: {} };
      const mockRes: any = { redirect: vi.fn(), json: vi.fn() };

      await authService.handleZaloCallback(
        { code: 'valid-code', state: 'valid-state' },
        mockReq,
        mockRes,
      );

      // QUAN TRỌNG: Không tự ý tạo user trong DB
      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(zaloOAuthServiceMock.createLinkTicket).toHaveBeenCalledWith({
        zaloId,
        name: 'Zalo Brand New User',
      });

      expect(mockRes.json).toHaveBeenCalled();
      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData.isLinked).toBe(false);
      expect(responseData.linkTicket).toBe('mock-link-ticket');
      expect(responseData.instructions).toBeDefined();
    });

    it('sử dụng code_verifier đã lưu server-side khi gọi exchangeCodeForAccessToken, không dùng code_challenge từ callback', async () => {
      const zaloId = 'zalo-pkce-test';
      const mockUser = {
        id: 'u-1',
        fullName: 'User PKCE',
        phone: '0901234567',
        email: 'u1@test.com',
        role: 'STUDENT',
        isActive: true,
        zaloId,
        avatarUrl: null,
      };

      zaloOAuthServiceMock.validateAndConsumeState.mockReturnValue(
        'server-stored-verifier-43-chars',
      );
      zaloOAuthServiceMock.exchangeCodeForAccessToken.mockResolvedValue(
        'access-token',
      );
      zaloOAuthServiceMock.getZaloUserProfile.mockResolvedValue({
        zaloId,
        name: 'User PKCE',
      });
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.refreshToken.create.mockResolvedValue({ id: 'rt-1' });

      const mockReq: any = { query: { format: 'json' }, headers: {} };
      const mockRes: any = { redirect: vi.fn(), json: vi.fn() };

      await authService.handleZaloCallback(
        {
          code: 'zalo-auth-code-123',
          state: 'csrf-state-abc',
          code_challenge: 'client-or-zalo-sent-challenge',
        },
        mockReq,
        mockRes,
      );

      // Khẳng định backend dùng server-stored-verifier chứ không dùng code_challenge
      expect(zaloOAuthServiceMock.validateAndConsumeState).toHaveBeenCalledWith(
        'csrf-state-abc',
      );
      expect(
        zaloOAuthServiceMock.exchangeCodeForAccessToken,
      ).toHaveBeenCalledWith(
        'zalo-auth-code-123',
        'server-stored-verifier-43-chars',
      );
    });

    it('xử lý lỗi khi Zalo từ chối đổi authorization code', async () => {
      zaloOAuthServiceMock.validateAndConsumeState.mockReturnValue(
        'valid-verifier',
      );
      zaloOAuthServiceMock.exchangeCodeForAccessToken.mockRejectedValue(
        new UnauthorizedException(
          'Xác thực mã ủy quyền Zalo thất bại: Authorization code is invalid',
        ),
      );

      const mockReq: any = { query: { format: 'json' }, headers: {} };
      const mockRes: any = { redirect: vi.fn(), json: vi.fn() };

      await expect(
        authService.handleZaloCallback(
          {
            code: 'invalid-code',
            state: 'valid-state',
            code_challenge: 'test-challenge',
          },
          mockReq,
          mockRes,
        ),
      ).rejects.toThrow('Xác thực mã ủy quyền Zalo thất bại');
    });

    it('xử lý lỗi khi Zalo Social API báo lỗi lấy profile', async () => {
      zaloOAuthServiceMock.validateAndConsumeState.mockReturnValue(
        'valid-verifier',
      );
      zaloOAuthServiceMock.exchangeCodeForAccessToken.mockResolvedValue(
        'valid-token',
      );
      zaloOAuthServiceMock.getZaloUserProfile.mockRejectedValue(
        new UnauthorizedException(
          'Không thể lấy thông tin người dùng từ Zalo: Token expired',
        ),
      );

      const mockReq: any = { query: { format: 'json' }, headers: {} };
      const mockRes: any = { redirect: vi.fn(), json: vi.fn() };

      await expect(
        authService.handleZaloCallback(
          { code: 'valid-code', state: 'valid-state' },
          mockReq,
          mockRes,
        ),
      ).rejects.toThrow('Không thể lấy thông tin người dùng từ Zalo');
    });
  });

  describe('Xác minh tài khoản hiện có và liên kết (linkZaloAccount)', () => {
    it('liên kết thành công khi thông tin tài khoản VanbyNhi và mật khẩu chính xác', async () => {
      const rawPassword = 'correct-password-123';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      const existingUser = {
        id: 'user-vn-1',
        fullName: 'Học viên VanbyNhi',
        email: 'student@vanbynhi.com',
        phone: '0912345678',
        passwordHash: hashedPassword,
        isActive: true,
        role: 'STUDENT',
        zaloId: null,
      };

      const zaloProfile = { zaloId: 'zalo-profile-789', name: 'Zalo User' };
      zaloOAuthServiceMock.consumeLinkTicket.mockReturnValue(zaloProfile);

      prismaMock.user.findFirst.mockResolvedValue(existingUser);
      // Chưa ai sở hữu zaloId này
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.update.mockResolvedValue({
        ...existingUser,
        zaloId: zaloProfile.zaloId,
      });
      prismaMock.refreshToken.create.mockResolvedValue({ id: 'rt-1' });

      const result = await authService.linkZaloAccount({
        linkTicket: 'mock-valid-link-ticket',
        identifier: 'student@vanbynhi.com',
        password: rawPassword,
      });

      expect(result.message).toBe('Liên kết tài khoản Zalo thành công');
      expect(result.tokens.accessToken).toBe('mock-access-token');
      expect(result.tokens.refreshToken).toBeDefined();
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: existingUser.id },
        data: { zaloId: zaloProfile.zaloId },
      });
    });

    it('từ chối liên kết khi linkTicket không hợp lệ hoặc đã hết hạn', async () => {
      zaloOAuthServiceMock.consumeLinkTicket.mockReturnValue(null);

      await expect(
        authService.linkZaloAccount({
          linkTicket: 'invalid-ticket',
          identifier: 'user@example.com',
          password: 'password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('từ chối liên kết khi sai mật khẩu tài khoản VanbyNhi', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 10);
      const existingUser = {
        id: 'user-vn-2',
        email: 'user@vanbynhi.com',
        phone: '0911223344',
        passwordHash: hashedPassword,
        isActive: true,
      };

      zaloOAuthServiceMock.consumeLinkTicket.mockReturnValue({
        zaloId: 'zalo-id-1',
      });
      prismaMock.user.findFirst.mockResolvedValue(existingUser);

      await expect(
        authService.linkZaloAccount({
          linkTicket: 'valid-ticket',
          identifier: 'user@vanbynhi.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow('Thông tin tài khoản xác minh không chính xác');
    });

    it('từ chối liên kết nếu tài khoản VanbyNhi đã được liên kết với một tài khoản Zalo khác', async () => {
      const rawPassword = 'password123';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const existingUser = {
        id: 'user-vn-3',
        email: 'user3@vanbynhi.com',
        phone: '0911223355',
        passwordHash: hashedPassword,
        isActive: true,
        zaloId: 'already-linked-zalo-id',
      };

      zaloOAuthServiceMock.consumeLinkTicket.mockReturnValue({
        zaloId: 'different-zalo-id',
      });
      prismaMock.user.findFirst.mockResolvedValue(existingUser);

      await expect(
        authService.linkZaloAccount({
          linkTicket: 'valid-ticket',
          identifier: 'user3@vanbynhi.com',
          password: rawPassword,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Đổi ticket lấy JWT Tokens (exchangeZaloTicket)', () => {
    it('đổi ticket thành công trả về token', async () => {
      const mockPayload = {
        tokens: { accessToken: 'jwt-token', refreshToken: 'rf-token' },
        user: { id: 'u1' },
      };
      zaloOAuthServiceMock.consumeExchangeTicket.mockReturnValue(mockPayload);

      const result = await authService.exchangeZaloTicket({
        ticket: 'valid-ticket',
      });
      expect(result).toEqual(mockPayload);
    });

    it('ném UnauthorizedException khi ticket không hợp lệ', async () => {
      zaloOAuthServiceMock.consumeExchangeTicket.mockReturnValue(null);

      await expect(
        authService.exchangeZaloTicket({ ticket: 'expired-ticket' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Hủy liên kết Zalo (unlinkZaloAccount)', () => {
    it('hủy liên kết thành công', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u1',
        zaloId: 'zalo-u1',
      });
      prismaMock.user.update.mockResolvedValue({ id: 'u1', zaloId: null });

      const result = await authService.unlinkZaloAccount('u1');
      expect(result.message).toBe('Hủy liên kết tài khoản Zalo thành công');
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { zaloId: null },
      });
    });

    it('ném BadRequestException nếu tài khoản chưa từng liên kết Zalo', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u2',
        zaloId: null,
      });

      await expect(authService.unlinkZaloAccount('u2')).rejects.toThrow(
        'Tài khoản chưa được liên kết với Zalo',
      );
    });
  });
});

