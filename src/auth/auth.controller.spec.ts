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

  describe('Zalo OAuth Endpoints', () => {
    it('GET /auth/zalo chuyển hướng tới Zalo Authorization URL', async () => {
      authServiceMock.getZaloAuthorizationUrl = vi
        .fn()
        .mockReturnValue('https://oauth.zaloapp.com/v4/permission?app_id=123');
      const mockRes: any = { redirect: vi.fn(), json: vi.fn() };

      await authController.zaloLogin(mockRes, {});

      expect(authServiceMock.getZaloAuthorizationUrl).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith(
        'https://oauth.zaloapp.com/v4/permission?app_id=123',
      );
    });

    it('GET /auth/zalo?format=json trả về JSON redirectUrl', async () => {
      authServiceMock.getZaloAuthorizationUrl = vi
        .fn()
        .mockReturnValue('https://oauth.zaloapp.com/v4/permission?app_id=123');
      const mockRes: any = { redirect: vi.fn(), json: vi.fn() };

      await authController.zaloLogin(mockRes, { format: 'json' });

      expect(mockRes.json).toHaveBeenCalledWith({
        redirectUrl: 'https://oauth.zaloapp.com/v4/permission?app_id=123',
      });
    });

    it('ZaloAuthQueryDto cho phép format=json và code_challenge tùy chọn mà không bị ValidationPipe từ chối', async () => {
      const { ZaloAuthQueryDto } = await import(
        './dto/zalo-auth-query.dto.js'
      );

      // 1. Chỉ truyền format=json (chuẩn)
      const validQuery = await validationPipe.transform(
        { format: 'json' },
        { type: 'query', metatype: ZaloAuthQueryDto },
      );
      expect(validQuery.format).toBe('json');

      // 2. Client gửi kèm code_challenge (không bị ném lỗi property code_challenge should not exist)
      const queryWithChallenge = await validationPipe.transform(
        { format: 'json', code_challenge: 'my-custom-challenge-123' },
        { type: 'query', metatype: ZaloAuthQueryDto },
      );
      expect(queryWithChallenge.code_challenge).toBe('my-custom-challenge-123');

      // 3. Client gửi trường lạ không nằm trong whitelist -> ValidationPipe vẫn từ chối đúng chuẩn bảo mật
      await expect(
        validationPipe.transform(
          { format: 'json', invalid_property: 'evil' },
          { type: 'query', metatype: ZaloAuthQueryDto },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('ZaloCallbackDto cho phép code, state, code_challenge mà không bị ValidationPipe từ chối', async () => {
      const { ZaloCallbackDto } = await import('./dto/zalo-callback.dto.js');

      // 1. Callback nhận code, state, code_challenge theo luồng OAuth V4
      const validCallback = await validationPipe.transform(
        {
          code: 'mock-auth-code-123',
          state: 'mock-csrf-state-456',
          code_challenge: 'mock-challenge-789',
        },
        { type: 'query', metatype: ZaloCallbackDto },
      );

      expect(validCallback.code).toBe('mock-auth-code-123');
      expect(validCallback.state).toBe('mock-csrf-state-456');
      expect(validCallback.code_challenge).toBe('mock-challenge-789');

      // 2. Thuộc tính không nằm trong whitelist -> ValidationPipe vẫn từ chối đúng chuẩn bảo mật
      await expect(
        validationPipe.transform(
          {
            code: 'code',
            state: 'state',
            forbidden_prop: 'malicious',
          },
          { type: 'query', metatype: ZaloCallbackDto },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('GET /auth/zalo/callback gọi authService.handleZaloCallback', async () => {
      authServiceMock.handleZaloCallback = vi
        .fn()
        .mockResolvedValue({ message: 'Success' });
      const query = { code: 'c1', state: 's1', code_challenge: 'ch1' };
      const req: any = {};
      const res: any = {};

      await authController.zaloCallback(query, req, res);

      expect(authServiceMock.handleZaloCallback).toHaveBeenCalledWith(
        query,
        req,
        res,
      );
    });

    it('POST /auth/zalo/exchange gọi authService.exchangeZaloTicket', async () => {
      authServiceMock.exchangeZaloTicket = vi
        .fn()
        .mockResolvedValue({ tokens: {} });
      const dto = { ticket: 't1' };

      await authController.exchangeZaloTicket(dto);

      expect(authServiceMock.exchangeZaloTicket).toHaveBeenCalledWith(dto);
    });

    it('POST /auth/zalo/link gọi authService.linkZaloAccount', async () => {
      authServiceMock.linkZaloAccount = vi
        .fn()
        .mockResolvedValue({ message: 'Linked' });
      const dto = {
        linkTicket: 'lt1',
        identifier: '0901234567',
        password: 'pass',
      };

      await authController.linkZaloAccount(dto);

      expect(authServiceMock.linkZaloAccount).toHaveBeenCalledWith(dto);
    });

    it('POST /auth/zalo/unlink gọi authService.unlinkZaloAccount', async () => {
      authServiceMock.unlinkZaloAccount = vi
        .fn()
        .mockResolvedValue({ message: 'Unlinked' });
      const user: any = { sub: 'u1' };

      await authController.unlinkZaloAccount(user);

      expect(authServiceMock.unlinkZaloAccount).toHaveBeenCalledWith('u1');
    });
  });
});

