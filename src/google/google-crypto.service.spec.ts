import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import crypto from 'node:crypto';
import { GoogleCryptoService } from './google-crypto.service.js';

describe('GoogleCryptoService', () => {
  let service: GoogleCryptoService;
  let configService: ConfigService;
  const validHexKey =
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  beforeEach(() => {
    configService = new ConfigService({
      NODE_ENV: 'test',
      GOOGLE_TOKEN_ENCRYPTION_KEY: validHexKey,
      JWT_ACCESS_SECRET: 'jwt-access-secret-32-bytes-fallback-testing',
      GOOGLE_TOKEN_LEGACY_KEY: 'custom-legacy-key-candidate-32b',
    });
    service = new GoogleCryptoService(configService);
  });

  describe('Khởi tạo và xác thực khóa (Validation & AES-256-GCM 32 bytes)', () => {
    it('bắt buộc sử dụng GOOGLE_TOKEN_ENCRYPTION_KEY, báo lỗi khi thiếu cấu hình', () => {
      const emptyConfig = new ConfigService({});
      expect(() => new GoogleCryptoService(emptyConfig)).toThrow(
        InternalServerErrorException,
      );
      expect(() => new GoogleCryptoService(emptyConfig)).toThrow(
        /Biến môi trường GOOGLE_TOKEN_ENCRYPTION_KEY là bắt buộc/,
      );
    });

    it('loại bỏ fallback sang JWT_ACCESS_SECRET khi GOOGLE_TOKEN_ENCRYPTION_KEY không được cung cấp', () => {
      const jwtOnlyConfig = new ConfigService({
        JWT_ACCESS_SECRET: 'jwt-access-secret-32-chars-long-for-testing!!',
      });
      expect(() => new GoogleCryptoService(jwtOnlyConfig)).toThrow(
        InternalServerErrorException,
      );
      expect(() => new GoogleCryptoService(jwtOnlyConfig)).toThrow(
        /Biến môi trường GOOGLE_TOKEN_ENCRYPTION_KEY là bắt buộc/,
      );
    });

    it('loại bỏ khóa mặc định cố định khi khởi tạo (không tự sinh key nếu thiếu cấu hình)', () => {
      const blankKeyConfig = new ConfigService({
        GOOGLE_TOKEN_ENCRYPTION_KEY: '   ',
      });
      expect(() => new GoogleCryptoService(blankKeyConfig)).toThrow(
        InternalServerErrorException,
      );
    });

    it('chấp nhận khóa định dạng 64 ký tự hex (32 bytes chuẩn)', () => {
      const hexConfig = new ConfigService({
        GOOGLE_TOKEN_ENCRYPTION_KEY:
          'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
      });
      const hexService = new GoogleCryptoService(hexConfig);
      const encrypted = hexService.encrypt('test-data');
      expect(hexService.decrypt(encrypted)).toBe('test-data');
    });

    it('chấp nhận khóa chuỗi UTF-8 có đúng 32 bytes', () => {
      const utf8Key = '12345678901234567890123456789012'; // Đúng 32 bytes
      const utf8Config = new ConfigService({
        GOOGLE_TOKEN_ENCRYPTION_KEY: utf8Key,
      });
      const utf8Service = new GoogleCryptoService(utf8Config);
      const encrypted = utf8Service.encrypt('utf8-test-data');
      expect(utf8Service.decrypt(encrypted)).toBe('utf8-test-data');
    });

    it('chấp nhận khóa định dạng Base64 của 32 bytes (44 ký tự)', () => {
      const base64Key = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
      const b64Config = new ConfigService({
        GOOGLE_TOKEN_ENCRYPTION_KEY: base64Key,
      });
      const b64Service = new GoogleCryptoService(b64Config);
      const encrypted = b64Service.encrypt('base64-test-data');
      expect(b64Service.decrypt(encrypted)).toBe('base64-test-data');
    });

    it('từ chối khóa không đủ 32 bytes hoặc định dạng sai', () => {
      const invalidShortConfig = new ConfigService({
        GOOGLE_TOKEN_ENCRYPTION_KEY: 'too-short-key',
      });
      expect(() => new GoogleCryptoService(invalidShortConfig)).toThrow(
        InternalServerErrorException,
      );
      expect(() => new GoogleCryptoService(invalidShortConfig)).toThrow(
        /phải có độ dài đúng 32 bytes/,
      );

      const invalidHexConfig = new ConfigService({
        // 64 ký tự nhưng chứa ký tự z không phải hex
        GOOGLE_TOKEN_ENCRYPTION_KEY:
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdez',
      });
      expect(() => new GoogleCryptoService(invalidHexConfig)).toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('Tương thích ngược dữ liệu cũ (Legacy Ciphertext & Plaintext)', () => {
    // Helper mã hóa AES-256-GCM với một key tùy ý để kiểm thử giải mã dữ liệu cũ
    function encryptWithRawKey(rawKeyBuffer: Buffer, text: string): string {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', rawKeyBuffer, iv);
      let enc = cipher.update(text, 'utf8', 'hex');
      enc += cipher.final('hex');
      const tag = cipher.getAuthTag();
      return `${iv.toString('hex')}:${tag.toString('hex')}:${enc}`;
    }

    it('giải mã thành công ciphertext từng được mã hóa bằng SHA-256(rawKey) trong phiên bản cũ', () => {
      const sha256Key = crypto.createHash('sha256').update(validHexKey).digest();
      const legacyEncrypted = encryptWithRawKey(sha256Key, 'token-from-sha256-legacy');

      const decrypted = service.decrypt(legacyEncrypted);
      expect(decrypted).toBe('token-from-sha256-legacy');
    });

    it('giải mã thành công ciphertext từng được mã hóa bằng JWT_ACCESS_SECRET cũ', () => {
      const jwtKey = crypto
        .createHash('sha256')
        .update('jwt-access-secret-32-bytes-fallback-testing')
        .digest();
      const legacyEncrypted = encryptWithRawKey(jwtKey, 'token-from-jwt-fallback');

      const decrypted = service.decrypt(legacyEncrypted);
      expect(decrypted).toBe('token-from-jwt-fallback');
    });

    it('giải mã thành công ciphertext từng được mã hóa bằng GOOGLE_TOKEN_LEGACY_KEY (dạng SHA-256 derived)', () => {
      const customLegacyKey = crypto
        .createHash('sha256')
        .update('custom-legacy-key-candidate-32b')
        .digest();
      const legacyEncrypted = encryptWithRawKey(customLegacyKey, 'token-from-custom-legacy-key');

      const decrypted = service.decrypt(legacyEncrypted);
      expect(decrypted).toBe('token-from-custom-legacy-key');
    });

    it('giải mã thành công với GOOGLE_TOKEN_LEGACY_KEY là 64 ký tự hex trực tiếp', () => {
      const hexLegacyKey =
        'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90';
      const hexLegacyConfig = new ConfigService({
        GOOGLE_TOKEN_ENCRYPTION_KEY: validHexKey,
        GOOGLE_TOKEN_LEGACY_KEY: hexLegacyKey,
      });
      const hexLegacyService = new GoogleCryptoService(hexLegacyConfig);

      const legacyEncrypted = encryptWithRawKey(
        Buffer.from(hexLegacyKey, 'hex'),
        'token-from-hex-legacy-key',
      );
      expect(hexLegacyService.decrypt(legacyEncrypted)).toBe('token-from-hex-legacy-key');
    });

    it('giải mã thành công khi GOOGLE_TOKEN_LEGACY_KEY chứa nhiều khóa phân tách bằng dấu phẩy', () => {
      const multiKeyConfig = new ConfigService({
        GOOGLE_TOKEN_ENCRYPTION_KEY: validHexKey,
        GOOGLE_TOKEN_LEGACY_KEY: 'first-legacy-key, second-legacy-key',
      });
      const multiKeyService = new GoogleCryptoService(multiKeyConfig);

      const firstKeyBuf = crypto.createHash('sha256').update('first-legacy-key').digest();
      const secondKeyBuf = crypto.createHash('sha256').update('second-legacy-key').digest();

      const enc1 = encryptWithRawKey(firstKeyBuf, 'token-from-first-key');
      const enc2 = encryptWithRawKey(secondKeyBuf, 'token-from-second-key');

      expect(multiKeyService.decrypt(enc1)).toBe('token-from-first-key');
      expect(multiKeyService.decrypt(enc2)).toBe('token-from-second-key');
    });

    it('không sử dụng hardcoded default key khi NODE_ENV là production', () => {
      const defaultKey = crypto
        .createHash('sha256')
        .update('vanbynhi-default-google-token-key-32b!')
        .digest();
      const legacyEncrypted = encryptWithRawKey(defaultKey, 'token-from-default-key');

      const prodConfig = new ConfigService({
        NODE_ENV: 'production',
        GOOGLE_TOKEN_ENCRYPTION_KEY: validHexKey,
      });
      const prodService = new GoogleCryptoService(prodConfig);

      expect(() => prodService.decrypt(legacyEncrypted)).toThrow(
        InternalServerErrorException,
      );
      expect(() => prodService.decrypt(legacyEncrypted)).toThrow(
        /khóa giải mã không khớp hoặc dữ liệu bị thay đổi/,
      );
    });

    it('không sử dụng hardcoded default key khi NODE_ENV bị thiếu (missing/undefined)', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      try {
        delete (process.env as any).NODE_ENV;
        const defaultKey = crypto
          .createHash('sha256')
          .update('vanbynhi-default-google-token-key-32b!')
          .digest();
        const legacyEncrypted = encryptWithRawKey(defaultKey, 'token-from-default-key');

        // ConfigService không có NODE_ENV và process.env.NODE_ENV bị thiếu
        const missingEnvConfig = new ConfigService({
          GOOGLE_TOKEN_ENCRYPTION_KEY: validHexKey,
        });
        const missingEnvService = new GoogleCryptoService(missingEnvConfig);

        expect(() => missingEnvService.decrypt(legacyEncrypted)).toThrow(
          InternalServerErrorException,
        );
        expect(() => missingEnvService.decrypt(legacyEncrypted)).toThrow(
          /khóa giải mã không khớp hoặc dữ liệu bị thay đổi/,
        );
      } finally {
        if (originalNodeEnv === undefined) {
          delete (process.env as any).NODE_ENV;
        } else {
          process.env.NODE_ENV = originalNodeEnv;
        }
      }
    });

    it('không sử dụng hardcoded default key khi NODE_ENV không hợp lệ (staging, qa, empty string)', () => {
      const defaultKey = crypto
        .createHash('sha256')
        .update('vanbynhi-default-google-token-key-32b!')
        .digest();
      const legacyEncrypted = encryptWithRawKey(defaultKey, 'token-from-default-key');

      const stagingConfig = new ConfigService({
        NODE_ENV: 'staging',
        GOOGLE_TOKEN_ENCRYPTION_KEY: validHexKey,
      });
      const stagingService = new GoogleCryptoService(stagingConfig);
      expect(() => stagingService.decrypt(legacyEncrypted)).toThrow(
        InternalServerErrorException,
      );

      const emptyEnvConfig = new ConfigService({
        NODE_ENV: '   ',
        GOOGLE_TOKEN_ENCRYPTION_KEY: validHexKey,
      });
      const emptyEnvService = new GoogleCryptoService(emptyEnvConfig);
      expect(() => emptyEnvService.decrypt(legacyEncrypted)).toThrow(
        InternalServerErrorException,
      );
    });

    it('nạp hardcoded default key khi NODE_ENV chính xác là development hoặc test (chuẩn hóa trim & lowercase)', () => {
      const defaultKey = crypto
        .createHash('sha256')
        .update('vanbynhi-default-google-token-key-32b!')
        .digest();
      const legacyEncrypted = encryptWithRawKey(defaultKey, 'token-from-default-key');

      // Case: '  DEVELOPMENT  '
      const devConfig = new ConfigService({
        NODE_ENV: '  DEVELOPMENT  ',
        GOOGLE_TOKEN_ENCRYPTION_KEY: validHexKey,
      });
      const devService = new GoogleCryptoService(devConfig);
      expect(devService.decrypt(legacyEncrypted)).toBe('token-from-default-key');

      // Case: 'TEST'
      const testConfig = new ConfigService({
        NODE_ENV: 'TEST',
        GOOGLE_TOKEN_ENCRYPTION_KEY: validHexKey,
      });
      const testService = new GoogleCryptoService(testConfig);
      expect(testService.decrypt(legacyEncrypted)).toBe('token-from-default-key');
    });

    it('cho phép giải mã bằng default key trong Production NẾU được cấu hình tường minh qua GOOGLE_TOKEN_LEGACY_KEY', () => {
      const defaultKey = crypto
        .createHash('sha256')
        .update('vanbynhi-default-google-token-key-32b!')
        .digest();
      const legacyEncrypted = encryptWithRawKey(defaultKey, 'token-from-default-key');

      // Khởi tạo trong production nhưng quản trị viên cung cấp GOOGLE_TOKEN_LEGACY_KEY tường minh
      const explicitLegacyConfig = new ConfigService({
        NODE_ENV: 'production',
        GOOGLE_TOKEN_ENCRYPTION_KEY: validHexKey,
        GOOGLE_TOKEN_LEGACY_KEY: 'vanbynhi-default-google-token-key-32b!',
      });
      const explicitService = new GoogleCryptoService(explicitLegacyConfig);

      expect(explicitService.decrypt(legacyEncrypted)).toBe('token-from-default-key');
    });

    it('sai legacy key cấu hình thất bại an toàn và không gây crash hay rò rỉ dữ liệu', () => {
      const wrongLegacyConfig = new ConfigService({
        NODE_ENV: 'production',
        GOOGLE_TOKEN_ENCRYPTION_KEY: validHexKey,
        GOOGLE_TOKEN_LEGACY_KEY: 'incorrect-legacy-key-that-does-not-match',
      });
      const wrongLegacyService = new GoogleCryptoService(wrongLegacyConfig);

      const someOtherKey = crypto.createHash('sha256').update('unregistered-other-key').digest();
      const legacyEncrypted = encryptWithRawKey(someOtherKey, 'secret-user-token');

      expect(() => wrongLegacyService.decrypt(legacyEncrypted)).toThrow(
        InternalServerErrorException,
      );
      expect(() => wrongLegacyService.decrypt(legacyEncrypted)).toThrow(
        /khóa giải mã không khớp hoặc dữ liệu bị thay đổi/,
      );
    });

    it('giải mã thành công ciphertext từng được mã hóa bằng default key cũ khi NODE_ENV là test', () => {
      const defaultKey = crypto
        .createHash('sha256')
        .update('vanbynhi-default-google-token-key-32b!')
        .digest();
      const legacyEncrypted = encryptWithRawKey(defaultKey, 'token-from-default-key');

      // Service mặc định (NODE_ENV=test) hỗ trợ test compatibility
      const decrypted = service.decrypt(legacyEncrypted);
      expect(decrypted).toBe('token-from-default-key');
    });

    it('ConfigService đọc NODE_ENV từ process.env khi không được khai báo riêng trong config', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'development';
        // ConfigService không truyền NODE_ENV, tự động đọc từ process.env
        const implicitConfig = new ConfigService({
          GOOGLE_TOKEN_ENCRYPTION_KEY: validHexKey,
        });
        const implicitService = new GoogleCryptoService(implicitConfig);

        const defaultKey = crypto
          .createHash('sha256')
          .update('vanbynhi-default-google-token-key-32b!')
          .digest();
        const legacyEncrypted = encryptWithRawKey(defaultKey, 'token-from-default-key');

        expect(implicitService.decrypt(legacyEncrypted)).toBe('token-from-default-key');
      } finally {
        if (originalNodeEnv === undefined) {
          delete (process.env as any).NODE_ENV;
        } else {
          process.env.NODE_ENV = originalNodeEnv;
        }
      }
    });

    it('tương thích dữ liệu cũ: hỗ trợ đọc refresh token dạng plaintext cũ hợp lệ (cả có và không có tiền tố 1//)', () => {
      const legacyPlaintext1 = '1//0gXyzLegacyRefreshTokenWithoutColon123456';
      const legacyPlaintext2 = '1/legacyRefreshTokenWithSingleSlashValidFormat123';
      const legacyPlaintext3 = 'opaque-google-refresh-token-without-prefix-987654321';

      expect(service.isLegacyPlaintext(legacyPlaintext1)).toBe(true);
      expect(service.isLegacyPlaintext(legacyPlaintext2)).toBe(true);
      expect(service.isLegacyPlaintext(legacyPlaintext3)).toBe(true);

      expect(service.decrypt(legacyPlaintext1)).toBe(legacyPlaintext1);
      expect(service.decrypt(legacyPlaintext2)).toBe(legacyPlaintext2);
      expect(service.decrypt(legacyPlaintext3)).toBe(legacyPlaintext3);
    });

    it('ciphertext hỏng hoặc chuỗi không hợp lệ không bị nhận diện nhầm thành legacy plaintext', () => {
      // 1. Chuỗi có colon nhưng sai cấu trúc AES-GCM (ví dụ ít phần, IV sai độ dài, hoặc bị hỏng phân vùng)
      const invalidCipherWithColon = 'corrupted:ciphertext:token';
      expect(service.isEncrypted(invalidCipherWithColon)).toBe(false);
      expect(service.isLegacyPlaintext(invalidCipherWithColon)).toBe(false);
      expect(() => service.decrypt(invalidCipherWithColon)).toThrow(
        InternalServerErrorException,
      );

      // 2. Chuỗi ciphertext có 3 phần nhưng authTag bị hỏng không đủ 32 hex
      const malformedCipher = '0123456789abcdef01234567:shorttag:abcdef';
      expect(service.isEncrypted(malformedCipher)).toBe(false);
      expect(service.isLegacyPlaintext(malformedCipher)).toBe(false);
      expect(() => service.decrypt(malformedCipher)).toThrow(
        InternalServerErrorException,
      );

      // 2b. IV không hợp lệ (không đủ 24 hex chars hoặc chứa ký tự không phải hex)
      const invalidIvCipher = '012345:0123456789abcdef0123456789abcdef:abcdef';
      expect(service.isEncrypted(invalidIvCipher)).toBe(false);
      expect(service.isLegacyPlaintext(invalidIvCipher)).toBe(false);
      expect(() => service.decrypt(invalidIvCipher)).toThrow(
        InternalServerErrorException,
      );

      // 2c. Ciphertext bị cắt cụt (encryptedHex rỗng)
      const truncatedCipher = '0123456789abcdef01234567:0123456789abcdef0123456789abcdef:';
      expect(service.isEncrypted(truncatedCipher)).toBe(false);
      expect(service.isLegacyPlaintext(truncatedCipher)).toBe(false);
      expect(() => service.decrypt(truncatedCipher)).toThrow(
        InternalServerErrorException,
      );

      // 3. Chuỗi quá ngắn (< 20 ký tự)
      expect(service.isLegacyPlaintext('short-token-123')).toBe(false);
      expect(service.isLegacyPlaintext('')).toBe(false);
      expect(service.isLegacyPlaintext(null)).toBe(false);

      // 4. Chuỗi chứa ký tự không an toàn hoặc không thuộc bảng mã token OAuth (khoảng trắng, ký tự điều khiển, dấu hai chấm)
      expect(service.isLegacyPlaintext('invalid token with spaces 1234567890')).toBe(false);
      expect(service.isLegacyPlaintext('invalid:token:with:colons:1234567890')).toBe(false);
      expect(service.isLegacyPlaintext('invalid\ntoken\twith\nnewlines1234567890')).toBe(false);
    });
  });

  describe('Mã hóa, giải mã & tính toàn vẹn (AES-256-GCM)', () => {
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
      const tamperedCipher =
        parts[2].slice(0, -2) + (parts[2].endsWith('a') ? 'b' : 'a');
      const tamperedPayload = `${parts[0]}:${parts[1]}:${tamperedCipher}`;

      expect(() => service.decrypt(tamperedPayload)).toThrow(
        InternalServerErrorException,
      );
      expect(() => service.decrypt(tamperedPayload)).toThrow(
        /Không thể giải mã dữ liệu xác thực Google/,
      );
    });

    it('từ chối giải mã khi sử dụng sai khóa hoàn toàn (Wrong Key)', () => {
      const otherKeyConfig = new ConfigService({
        GOOGLE_TOKEN_ENCRYPTION_KEY:
          '9999999999999999999999999999999999999999999999999999999999999999',
      });
      const otherService = new GoogleCryptoService(otherKeyConfig);

      const secretToken = '1//very-secret-google-refresh-token';
      const encryptedWithOriginal = service.encrypt(secretToken);

      // Thử giải mã bằng service không có bất kỳ candidate key nào khớp
      expect(() => otherService.decrypt(encryptedWithOriginal)).toThrow(
        InternalServerErrorException,
      );
      expect(() => otherService.decrypt(encryptedWithOriginal)).toThrow(
        /khóa giải mã không khớp hoặc dữ liệu bị thay đổi/,
      );
    });

    it('bảo đảm encrypt() chỉ sử dụng khóa chính 32 bytes hiện tại, không dùng JWT hay default key để mã hóa mới', () => {
      const token = 'newly-created-refresh-token-2026';
      const encrypted = service.encrypt(token);

      const parts = encrypted.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const cipherHex = parts[2];

      // Thử giải mã bằng JWT key trực tiếp -> phải fail (chứng minh encrypt không dùng JWT secret)
      const jwtKey = crypto
        .createHash('sha256')
        .update('jwt-access-secret-32-bytes-fallback-testing')
        .digest();
      const decipherJwt = crypto.createDecipheriv('aes-256-gcm', jwtKey, iv);
      decipherJwt.setAuthTag(authTag);
      expect(() => {
        decipherJwt.update(cipherHex, 'hex', 'utf8');
        decipherJwt.final('utf8');
      }).toThrow();

      // Thử giải mã bằng default legacy key trực tiếp -> phải fail (chứng minh encrypt không dùng hardcoded key)
      const defaultKey = crypto
        .createHash('sha256')
        .update('vanbynhi-default-google-token-key-32b!')
        .digest();
      const decipherDefault = crypto.createDecipheriv('aes-256-gcm', defaultKey, iv);
      decipherDefault.setAuthTag(authTag);
      expect(() => {
        decipherDefault.update(cipherHex, 'hex', 'utf8');
        decipherDefault.final('utf8');
      }).toThrow();

      // Giải mã bằng chính khóa chính 32 bytes hợp lệ -> thành công
      const primaryKeyBuf = Buffer.from(validHexKey, 'hex');
      const decipherPrimary = crypto.createDecipheriv('aes-256-gcm', primaryKeyBuf, iv);
      decipherPrimary.setAuthTag(authTag);
      let decrypted = decipherPrimary.update(cipherHex, 'hex', 'utf8');
      decrypted += decipherPrimary.final('utf8');
      expect(decrypted).toBe(token);
    });

    it('báo lỗi khi chuỗi giải mã không đúng định dạng', () => {
      expect(() => service.decrypt('invalid-format')).toThrow(
        /Định dạng chuỗi mã hóa không hợp lệ/,
      );
    });

    it('xử lý chuỗi rỗng khi mã hóa hoặc giải mã', () => {
      expect(() => service.encrypt('')).toThrow(InternalServerErrorException);
      expect(() => service.decrypt('')).toThrow(InternalServerErrorException);
    });

    it('nhận diện chính xác chuỗi đã mã hóa qua isEncrypted', () => {
      const originalToken = '1//0gXyzGoogleRefreshTokenSample1234567890';
      const encrypted = service.encrypt(originalToken);

      expect(service.isEncrypted(encrypted)).toBe(true);
      expect(service.isEncrypted(originalToken)).toBe(false);
      expect(service.isEncrypted(null)).toBe(false);
      expect(service.isEncrypted('invalid:format')).toBe(false);
    });
  });
});
