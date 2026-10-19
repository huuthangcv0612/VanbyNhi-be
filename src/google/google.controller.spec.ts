import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { GoogleController } from './google.controller.js';
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

  it('lấy trạng thái kết nối Google của giáo viên', async () => {
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

  it('khởi tạo URL liên kết và trả về JSON nếu format=json', async () => {
    (authServiceMock.getAuthorizationUrl as any).mockReturnValue(
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

  it('ngắt liên kết tài khoản Google', async () => {
    (authServiceMock.disconnect as any).mockResolvedValue({
      message: 'Hủy liên kết tài khoản Google thành công',
    });

    const result = await controller.disconnectGoogle('teacher-1');
    expect(result.message).toContain('Hủy liên kết tài khoản Google thành công');
  });
});
