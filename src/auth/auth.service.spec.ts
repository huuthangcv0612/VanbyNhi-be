import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaMock: any;
  let jwtServiceMock: any;
  let configServiceMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findFirst: vi.fn(),
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
        if (key === 'JWT_ACCESS_SECRET') return 'super-secret-key-at-least-32-chars';
        if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
        if (key === 'JWT_REFRESH_EXPIRES_DAYS') return '7';
        return null;
      }),
    };

    authService = new AuthService(prismaMock, jwtServiceMock, configServiceMock);
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
});
