import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';

@Injectable()
export class GoogleCryptoService {
  private readonly logger = new Logger(GoogleCryptoService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const secret =
      this.configService.get<string>('GOOGLE_TOKEN_ENCRYPTION_KEY') ||
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      '';

    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        throw new InternalServerErrorException(
          'Lỗi cấu hình: Thiếu GOOGLE_TOKEN_ENCRYPTION_KEY trong môi trường production',
        );
      }
      this.logger.warn(
        'CẢNH BÁO: GOOGLE_TOKEN_ENCRYPTION_KEY chưa được cấu hình. Sử dụng key mặc định cho môi trường dev/test.',
      );
      this.key = crypto
        .createHash('sha256')
        .update('vanbynhi-default-google-token-key-32b!')
        .digest();
    } else {
      // Đảm bảo key luôn có đúng 32 bytes thông qua SHA-256
      this.key = crypto.createHash('sha256').update(secret).digest();
    }
  }

  /**
   * Mã hóa chuỗi nhạy cảm (Google refresh token) bằng AES-256-GCM
   * Trả về chuỗi định dạng: ivHex:authTagHex:encryptedHex
   */
  encrypt(plaintext: string): string {
    if (!plaintext) {
      throw new InternalServerErrorException('Dữ liệu cần mã hóa không được để trống');
    }

    const iv = crypto.randomBytes(12); // Chuẩn NIST 12 bytes cho AES-GCM
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Giải mã chuỗi AES-256-GCM đã mã hóa
   */
  decrypt(ciphertext: string): string {
    if (!ciphertext) {
      throw new InternalServerErrorException('Dữ liệu cần giải mã không được để trống');
    }

    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new InternalServerErrorException(
        'Định dạng chuỗi mã hóa không hợp lệ (cần iv:authTag:content)',
      );
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
