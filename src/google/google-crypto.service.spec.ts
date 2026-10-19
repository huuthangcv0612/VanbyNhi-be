import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { GoogleCryptoService } from './google-crypto.service.js';

describe('GoogleCryptoService', () => {
  let service: GoogleCryptoService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService({
      GOOGLE_TOKEN_ENCRYPTION_KEY:
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    });
    service = new GoogleCryptoService(configService);
  });

  it('mã hóa và giải mã chính xác chuỗi refresh token bí mật', () => {
    const originalToken = '1//0gXyzGoogleRefreshTokenSample1234567890';
    const encrypted = service.encrypt(originalToken);

    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(originalToken);
    expect(encrypted.split(':')).toHaveLength(3); // iv:authTag:ciphertext

    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(originalToken);
  });

  it('mỗi lần mã hóa tạo ra IV ngẫu nhiên khác nhau (cipher khác nhau)', () => {
    const originalToken = 'sample-refresh-token';
    const encrypted1 = service.encrypt(originalToken);
    const encrypted2 = service.encrypt(originalToken);

    expect(encrypted1).not.toBe(encrypted2);
    expect(service.decrypt(encrypted1)).toBe(originalToken);
    expect(service.decrypt(encrypted2)).toBe(originalToken);
  });

  it('phát hiện dữ liệu mã hóa bị chỉnh sửa hoặc giả mạo (tampering)', () => {
    const originalToken = 'valid-token';
    const encrypted = service.encrypt(originalToken);
    const parts = encrypted.split(':');

    // Giả mạo ciphertext
    const tamperedCipher = parts[2].slice(0, -2) + (parts[2].endsWith('a') ? 'b' : 'a');
    const tamperedPayload = `${parts[0]}:${parts[1]}:${tamperedCipher}`;

    expect(() => service.decrypt(tamperedPayload)).toThrow();
  });

  it('báo lỗi khi chuỗi giải mã không đúng định dạng', () => {
    expect(() => service.decrypt('invalid-format')).toThrow(
      /Định dạng chuỗi mã hóa không hợp lệ/,
    );
  });
});
