import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard (Active User Check)', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let jwtServiceMock: any;
  let configServiceMock: any;
  let prismaMock: any;

  beforeEach(() => {
    jwtServiceMock = {
      verifyAsync: vi.fn(),
    };
    configServiceMock = {
      get: vi.fn((key) => (key === 'JWT_ACCESS_SECRET' ? 'test-secret' : null)),
    };
    prismaMock = {
      user: {
        findUnique: vi.fn(),
      },
    };

    jwtAuthGuard = new JwtAuthGuard(
      jwtServiceMock,
      configServiceMock,
      prismaMock,
    );
  });

  const createMockContext = (authHeader?: string): any => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: authHeader,
        },
      }),
    }),
  });

  it('cho phép request khi token hợp lệ và tài khoản đang hoạt động (isActive = true)', async () => {
    const context = createMockContext('Bearer valid-token');
    jwtServiceMock.verifyAsync.mockResolvedValue({ sub: 'u1', role: 'STUDENT' });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      role: 'STUDENT',
      isActive: true,
    });

    const canActivate = await jwtAuthGuard.canActivate(context);
    expect(canActivate).toBe(true);
  });

  it('chặn request khi tài khoản đã bị vô hiệu hóa (isActive = false)', async () => {
    const context = createMockContext('Bearer valid-token');
    jwtServiceMock.verifyAsync.mockResolvedValue({ sub: 'u1', role: 'STUDENT' });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      role: 'STUDENT',
      isActive: false,
    });

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(
      'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa',
    );
  });

  it('chặn request khi tài khoản không tồn tại trong database', async () => {
    const context = createMockContext('Bearer valid-token');
    jwtServiceMock.verifyAsync.mockResolvedValue({ sub: 'u1', role: 'STUDENT' });
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(
      'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa',
    );
  });
});
