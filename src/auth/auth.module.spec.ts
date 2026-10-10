import { describe, it, expect, vi } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { jwtOptionsFactory } from './auth.module.js';

describe('AuthModule Configuration', () => {
  it('khởi tạo cấu hình JWT thành công khi có đủ biến môi trường', () => {
    const configServiceMock = {
      get: vi.fn((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return 'test-access-secret-at-least-32-chars';
        if (key === 'JWT_ACCESS_EXPIRES_IN') return '30m';
        return null;
      }),
    } as unknown as ConfigService;

    const options = jwtOptionsFactory(configServiceMock);

    expect(options.secret).toBe('test-access-secret-at-least-32-chars');
    expect(options.signOptions.expiresIn).toBe('30m');
  });

  it('sử dụng thời hạn mặc định 15m khi không truyền JWT_ACCESS_EXPIRES_IN', () => {
    const configServiceMock = {
      get: vi.fn((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return 'test-access-secret-at-least-32-chars';
        return null;
      }),
    } as unknown as ConfigService;

    const options = jwtOptionsFactory(configServiceMock);

    expect(options.secret).toBe('test-access-secret-at-least-32-chars');
    expect(options.signOptions.expiresIn).toBe('15m');
  });

  it('báo lỗi rõ ràng ngay lập tức khi thiếu JWT_ACCESS_SECRET', () => {
    const configServiceMock = {
      get: vi.fn(() => null),
    } as unknown as ConfigService;

    expect(() => jwtOptionsFactory(configServiceMock)).toThrow(
      'Lỗi cấu hình: JWT_ACCESS_SECRET chưa được cấu hình trong biến môi trường (.env)',
    );
  });
});
