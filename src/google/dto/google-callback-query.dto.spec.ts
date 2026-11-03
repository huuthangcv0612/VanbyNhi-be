import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GoogleCallbackQueryDto } from './google-callback-query.dto.js';

describe('GoogleCallbackQueryDto & ValidationPipe Validation', () => {
  function toDto(plain: Record<string, any>): GoogleCallbackQueryDto {
    return plainToInstance(GoogleCallbackQueryDto, plain);
  }

  it('hợp lệ khi Google Authorization Server gửi kèm tham số iss theo chuẩn RFC 9207 trong success response', async () => {
    const plain = {
      code: '4/0AY0e-g4...',
      state: 'mock-valid-state',
      scope: 'email profile openid',
      authuser: '0',
      prompt: 'consent',
      iss: 'https://accounts.google.com',
    };

    const dto = toDto(plain);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.length).toBe(0);
    expect(dto.iss).toBe('https://accounts.google.com');
    expect(dto.code).toBe('4/0AY0e-g4...');
    expect(dto.state).toBe('mock-valid-state');
  });

  it('hợp lệ khi Google Authorization Server gửi kèm tham số iss trong error response (ví dụ: người dùng hủy cấp quyền)', async () => {
    const plain = {
      error: 'access_denied',
      error_description: 'User denied access',
      state: 'mock-valid-state',
      iss: 'https://accounts.google.com',
    };

    const dto = toDto(plain);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.length).toBe(0);
    expect(dto.error).toBe('access_denied');
    expect(dto.iss).toBe('https://accounts.google.com');
  });

  it('từ chối khi callback thiếu iss (áp dụng chính sách required theo chuẩn Google OpenID Connect)', async () => {
    const plain = {
      code: '4/0AY0e-g4...',
      state: 'mock-valid-state',
    };

    const dto = toDto(plain);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.length).toBeGreaterThan(0);
    const issError = errors.find((e) => e.property === 'iss');
    expect(issError).toBeDefined();
    expect(issError?.constraints?.isNotEmpty).toBe('Mã phát hành (iss) là bắt buộc từ Google');
  });

  it('từ chối khi iss là chuỗi rỗng', async () => {
    const plain = {
      code: '4/0AY0e-g4...',
      state: 'mock-valid-state',
      iss: '',
    };

    const dto = toDto(plain);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.length).toBeGreaterThan(0);
    const issError = errors.find((e) => e.property === 'iss');
    expect(issError).toBeDefined();
    expect(issError?.constraints?.isNotEmpty).toBe('Mã phát hành (iss) là bắt buộc từ Google');
  });

  it('từ chối nếu iss không phải là chuỗi (IsString validation)', async () => {
    const plain = {
      code: '4/0AY0e-g4...',
      state: 'mock-valid-state',
      iss: 12345, // Không phải chuỗi
    };

    const dto = toDto(plain);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.length).toBeGreaterThan(0);
    const issError = errors.find((e) => e.property === 'iss');
    expect(issError).toBeDefined();
    expect(issError?.constraints?.isString).toBe('iss phải là chuỗi ký tự');
  });

  it('báo lỗi khi query chứa thuộc tính lạ không nằm trong whitelist (forbidNonWhitelisted: true)', async () => {
    const plain = {
      code: '4/0AY0e-g4...',
      state: 'mock-valid-state',
      iss: 'https://accounts.google.com',
      unexpectedProperty: 'malicious_injected_value',
    };

    const dto = toDto(plain);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.length).toBeGreaterThan(0);
    const unexpectedError = errors.find((e) => e.property === 'unexpectedProperty');
    expect(unexpectedError).toBeDefined();
    expect(unexpectedError?.constraints?.whitelistValidation).toBe(
      'property unexpectedProperty should not exist',
    );
  });
});
