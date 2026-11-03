import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GoogleController, OAUTH_ERROR_CODES } from './google.controller.js';
import { GoogleAuthService } from './google-auth.service.js';
import { GoogleConnectionStatus } from '../../generated/prisma/client.js';

describe('GoogleController', () => {
  let controller: GoogleController;
  let authServiceMock: Partial<GoogleAuthService>;
  let configServiceMock: Partial<ConfigService>;

  beforeEach(() => {
    authServiceMock = {
      getConnectionStatus: vi.fn(),
      getAuthorizationUrl: vi.fn(),
      handleCallback: vi.fn(),
      disconnect: vi.fn(),
    };

    configServiceMock = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'FRONTEND_URL') return 'http://localhost:5173';
        return null;
      }),
    };

    controller = new GoogleController(
      authServiceMock as GoogleAuthService,
      configServiceMock as ConfigService,
    );
  });

  describe('GET /google/connection', () => {
    it('lấy trạng thái kết nối Google của giáo viên khi đã liên kết', async () => {
      (authServiceMock.getConnectionStatus as any).mockResolvedValue({
        isConnected: true,
        status: GoogleConnectionStatus.CONNECTED,
        email: 'teacher@hcmus.edu.vn',
      });

      const result = await controller.getConnectionStatus('teacher-1');
      expect(result).toEqual({
        isConnected: true,
        status: GoogleConnectionStatus.CONNECTED,
        email: 'teacher@hcmus.edu.vn',
      });
    });

    it('trả về DISCONNECTED khi giáo viên chưa liên kết Google', async () => {
      (authServiceMock.getConnectionStatus as any).mockResolvedValue({
        isConnected: false,
        status: GoogleConnectionStatus.DISCONNECTED,
      });

      const result = await controller.getConnectionStatus({ sub: 'unlinked-teacher' });
      expect(result).toEqual({
        isConnected: false,
        status: GoogleConnectionStatus.DISCONNECTED,
      });
    });

    it('báo lỗi UnauthorizedException khi không có user trong token', async () => {
      await expect(controller.getConnectionStatus(null)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('GET /google/connect', () => {
    it('khởi tạo URL liên kết và trả về JSON nếu format=json', async () => {
      (authServiceMock.getAuthorizationUrl as any).mockResolvedValue(
        'https://accounts.google.com/o/oauth2/v2/auth?mock=1',
      );

      const res: any = {
        json: vi.fn((data) => data),
        redirect: vi.fn(),
      };

      await controller.connectGoogle(
        'teacher-1',
        { format: 'json' },
        res,
      );

      expect(res.json).toHaveBeenCalledWith({
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?mock=1',
      });
    });

    it('trả về JSON khi header có Accept: application/json', async () => {
      (authServiceMock.getAuthorizationUrl as any).mockResolvedValue(
        'https://accounts.google.com/o/oauth2/v2/auth?mock=1',
      );

      const res: any = {
        json: vi.fn((data) => data),
        redirect: vi.fn(),
      };
      const req: any = {
        headers: { accept: 'application/json, text/plain, */*' },
      };

      await controller.connectGoogle(
        { sub: 'teacher-1' },
        {},
        res,
        req,
      );

      expect(res.json).toHaveBeenCalledWith({
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?mock=1',
      });
    });

    it('thực hiện redirect nếu không yêu cầu JSON', async () => {
      (authServiceMock.getAuthorizationUrl as any).mockResolvedValue(
        'https://accounts.google.com/o/oauth2/v2/auth?mock=1',
      );

      const res: any = {
        redirect: vi.fn(),
        json: vi.fn(),
      };

      await controller.connectGoogle(
        { id: 'teacher-1' },
        {},
        res,
      );

      expect(res.redirect).toHaveBeenCalledWith(
        'https://accounts.google.com/o/oauth2/v2/auth?mock=1',
      );
    });

    it('báo lỗi UnauthorizedException khi không trích xuất được userId', async () => {
      const res: any = { json: vi.fn(), redirect: vi.fn() };
      await expect(controller.connectGoogle({}, {}, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('GET /google/callback & Redirect Security', () => {
    it('xử lý callback và chuyển hướng về frontend khi format!=json', async () => {
      (authServiceMock.handleCallback as any).mockResolvedValue({
        message: 'Liên kết thành công',
        googleAccount: { email: 'teacher@hcmus.edu.vn' },
      });

      const res: any = {
        redirect: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.googleCallback(
        { code: 'valid-code', state: 'valid-state' },
        res,
      );

      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:5173/teacher/settings/google?status=success&email=teacher%40hcmus.edu.vn',
      );
    });

    it('xử lý callback và trả về JSON khi format=json', async () => {
      const mockResult = {
        message: 'Liên kết thành công',
        googleAccount: { email: 'teacher@hcmus.edu.vn' },
      };
      (authServiceMock.handleCallback as any).mockResolvedValue(mockResult);

      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn((data) => data),
        redirect: vi.fn(),
      };

      await controller.googleCallback(
        { code: 'valid-code', state: 'valid-state', format: 'json' },
        res,
      );

      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('chuẩn hóa error_code=oauth_access_denied khi người dùng từ chối cấp quyền', async () => {
      (authServiceMock.handleCallback as any).mockRejectedValue(
        new BadRequestException('Xác thực Google bị từ chối: access_denied'),
      );

      const res: any = { redirect: vi.fn() };

      await controller.googleCallback(
        { error: 'access_denied', error_description: 'User denied' },
        res,
      );

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining(`error_code=${OAUTH_ERROR_CODES.ACCESS_DENIED}`),
      );
      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('status=error'),
      );
    });

    it('chuẩn hóa error_code=oauth_expired_state khi state hết hạn', async () => {
      (authServiceMock.handleCallback as any).mockRejectedValue(
        new BadRequestException('Mã state đã hết hạn'),
      );

      const res: any = { redirect: vi.fn() };

      await controller.googleCallback(
        { code: 'code', state: 'expired-state' },
        res,
      );

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining(`error_code=${OAUTH_ERROR_CODES.EXPIRED_STATE}`),
      );
    });

    it('chuẩn hóa error_code=oauth_invalid_state khi state không hợp lệ hoặc bị giả mạo', async () => {
      (authServiceMock.handleCallback as any).mockRejectedValue(
        new BadRequestException('Mã state không hợp lệ (CSRF verification failed)'),
      );

      const res: any = { redirect: vi.fn() };

      await controller.googleCallback(
        { code: 'code', state: 'tampered-state' },
        res,
      );

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining(`error_code=${OAUTH_ERROR_CODES.INVALID_STATE}`),
      );
    });

    it('chuẩn hóa error_code=google_configuration_error khi lỗi cấu hình hệ thống', async () => {
      (authServiceMock.handleCallback as any).mockRejectedValue(
        new InternalServerErrorException('Lỗi cấu hình hệ thống: Chưa thiết lập GOOGLE_CLIENT_ID'),
      );

      const res: any = { redirect: vi.fn() };

      await controller.googleCallback(
        { code: 'code', state: 'valid-state' },
        res,
      );

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining(`error_code=${OAUTH_ERROR_CODES.CONFIGURATION_ERROR}`),
      );
    });

    it('InternalServerErrorException và Database timeout KHÔNG xuất hiện trong URL redirect', async () => {
      const sensitiveDbError =
        "Can't reach database server at neon.tech:5432 - Connection Timeout with sensitive schema details";
      (authServiceMock.handleCallback as any).mockRejectedValue(
        new Error(sensitiveDbError),
      );

      const res: any = { redirect: vi.fn() };

      await controller.googleCallback(
        { code: 'code', state: 'state' },
        res,
      );

      const redirectCall = res.redirect.mock.calls[0][0];

      // Tuyệt đối không chứa thông tin lỗi nội bộ
      expect(redirectCall).not.toContain('neon.tech');
      expect(redirectCall).not.toContain('Connection Timeout');
      expect(redirectCall).not.toContain('database');
      expect(redirectCall).not.toContain(sensitiveDbError);

      // Phải chứa error_code chuẩn hóa và message thân thiện
      expect(redirectCall).toContain(`error_code=${OAUTH_ERROR_CODES.FAILED}`);
      expect(redirectCall).toContain('status=error');
    });

    it('ngăn chặn Open Redirect: không chuyển hướng theo redirect_uri hoặc returnUrl từ query', async () => {
      (authServiceMock.handleCallback as any).mockResolvedValue({
        message: 'Liên kết thành công',
        googleAccount: { email: 'teacher@hcmus.edu.vn' },
      });

      const res: any = { redirect: vi.fn() };

      // Kẻ tấn công cố tình truyền returnUrl hoặc redirect_uri độc hại
      await controller.googleCallback(
        {
          code: 'valid-code',
          state: 'valid-state',
          returnUrl: 'https://evil-phishing-site.com/steal-token',
          redirect_uri: 'https://evil-phishing-site.com/callback',
        } as any,
        res,
      );

      const redirectCall = res.redirect.mock.calls[0][0];

      // Tuyệt đối không chuyển hướng sang trang web độc hại
      expect(redirectCall).not.toContain('evil-phishing-site.com');
      expect(redirectCall.startsWith('http://localhost:5173/teacher/settings/google')).toBe(true);
    });

    it('ném lại lỗi khi format=json và xảy ra lỗi (cho API client/test)', async () => {
      (authServiceMock.handleCallback as any).mockRejectedValue(
        new BadRequestException('Lỗi xác thực'),
      );

      const res: any = { json: vi.fn(), redirect: vi.fn() };

      await expect(
        controller.googleCallback(
          { code: 'bad-code', state: 'state', format: 'json' },
          res,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DELETE /google/connection', () => {
    it('ngắt liên kết tài khoản Google', async () => {
      (authServiceMock.disconnect as any).mockResolvedValue({
        message: 'Hủy liên kết tài khoản Google thành công',
      });

      const result = await controller.disconnectGoogle('teacher-1');
      expect(result.message).toContain('Hủy liên kết tài khoản Google thành công');
    });

    it('báo lỗi khi không tìm thấy user trong token', async () => {
      await expect(controller.disconnectGoogle(null)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
