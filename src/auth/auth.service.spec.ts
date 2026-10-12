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

  beforeEach(() => {
    prismaMock = {
      user: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      refreshToken: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
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
        return null;
      }),
    };

    authService = new AuthService(
      prismaMock,
      jwtServiceMock,
      configServiceMock,
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
});
