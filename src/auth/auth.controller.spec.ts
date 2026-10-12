import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { UserRole } from '../../generated/prisma/client.js';

describe('AuthController', () => {
  let authController: AuthController;
  let authServiceMock: any;
  let validationPipe: ValidationPipe;

  beforeEach(() => {
    authServiceMock = {
      register: vi.fn(),
      login: vi.fn(),
      refresh: vi.fn(),
      logout: vi.fn(),
    };

    authController = new AuthController(authServiceMock as AuthService);

    validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
  });

  describe('POST /auth/register', () => {
    it('gọi authService.register và trả kết quả thành công', async () => {
      const registerDto: RegisterDto = {
        fullName: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        phone: '0901234567',
        password: 'password123',
      };

      const expectedResponse = {
        message: 'Đăng ký tài khoản thành công',
        user: {
          id: 'user-1',
          fullName: registerDto.fullName,
          phone: registerDto.phone,
          email: registerDto.email,
          role: UserRole.STUDENT,
          isActive: true,
          dateOfBirth: null,
          createdAt: new Date(),
        },
      };

      authServiceMock.register.mockResolvedValue(expectedResponse);

      const result = await authController.register(registerDto);

      expect(authServiceMock.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResponse);
    });

    it('ValidationPipe từ chối khi client cố tình gửi field role ADMIN', async () => {
      const maliciousPayload = {
        fullName: 'Hacker',
        email: 'hacker@example.com',
        phone: '0909999999',
        password: 'password123',
        role: 'ADMIN', // Field không có trong whitelist
      };

      await expect(
        validationPipe.transform(maliciousPayload, {
          type: 'body',
          metatype: RegisterDto,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('ValidationPipe chuẩn hóa dữ liệu (trim và lowercase email)', async () => {
      const rawPayload = {
        fullName: '  Nguyễn Văn A  ',
        email: '  NgUyEnVaNa@ExAmPlE.CoM  ',
        phone: '  0901234567  ',
        password: 'password123',
      };

      const transformed: RegisterDto = await validationPipe.transform(
        rawPayload,
        {
          type: 'body',
          metatype: RegisterDto,
        },
      );

      expect(transformed.fullName).toBe('Nguyễn Văn A');
      expect(transformed.email).toBe('nguyenvana@example.com');
      expect(transformed.phone).toBe('0901234567');
    });
  });
});
