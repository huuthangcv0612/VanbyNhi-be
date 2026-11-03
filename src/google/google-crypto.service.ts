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
  private readonly legacyCandidateKeys: Buffer[] = [];

  constructor(private readonly configService: ConfigService) {
    const rawKey = this.configService.get<string>('GOOGLE_TOKEN_ENCRYPTION_KEY');

    if (!rawKey || typeof rawKey !== 'string' || rawKey.trim() === '') {
      throw new InternalServerErrorException(
        'Lỗi cấu hình hệ thống: Biến môi trường GOOGLE_TOKEN_ENCRYPTION_KEY là bắt buộc để mã hóa Google token',
      );
    }

    const trimmedKey = rawKey.trim();

    // Kiểm tra và bảo đảm AES-256-GCM sử dụng đúng 32 bytes (256 bits) cho khóa mã hóa chính
    if (/^[0-9a-fA-F]{64}$/.test(trimmedKey)) {
      this.key = Buffer.from(trimmedKey, 'hex');
    } else if (Buffer.byteLength(trimmedKey, 'utf8') === 32) {
      this.key = Buffer.from(trimmedKey, 'utf8');
    } else if (
      /^[A-Za-z0-9+/]{42,43}={0,2}$/.test(trimmedKey) &&
      Buffer.from(trimmedKey, 'base64').length === 32
    ) {
      this.key = Buffer.from(trimmedKey, 'base64');
    } else {
      throw new InternalServerErrorException(
        'Lỗi cấu hình hệ thống: GOOGLE_TOKEN_ENCRYPTION_KEY không hợp lệ. Khóa mã hóa AES-256-GCM phải có độ dài đúng 32 bytes (64 ký tự hex, 32 ký tự utf-8 hoặc base64 của 32 bytes)',
      );
    }

    // Thiết lập các khóa ứng viên giải mã tương thích ngược cho dữ liệu cũ (chỉ dùng để giải mã, không dùng để mã hóa mới)
    // 1. Dữ liệu mã hóa bằng SHA-256(rawKey) trong phiên bản cũ của GOOGLE_TOKEN_ENCRYPTION_KEY
    this.registerCandidateKey(trimmedKey);

    // 2. Dữ liệu từng được mã hóa qua khóa fallback cũ (JWT_ACCESS_SECRET) nếu có trong môi trường
    const jwtSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    if (jwtSecret && jwtSecret.trim() !== '') {
      this.registerCandidateKey(jwtSecret.trim());
    }

    // 3. Khóa cấu hình dự phòng bổ sung (khi được cấu hình tường minh qua GOOGLE_TOKEN_LEGACY_KEY)
    // Hỗ trợ một hoặc nhiều khóa phân tách bởi dấu phẩy
    const legacyKeyConfig = this.configService.get<string>('GOOGLE_TOKEN_LEGACY_KEY');
    if (legacyKeyConfig && legacyKeyConfig.trim() !== '') {
      const legacyKeys = legacyKeyConfig
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
      for (const legacyKey of legacyKeys) {
        this.registerCandidateKey(legacyKey);
      }
    }

    // 4. Khóa mặc định cố định cũ từng được dùng trong dev/test:
    // CHỈ nạp khi NODE_ENV chính xác là 'development' hoặc 'test'.
    // Production, NODE_ENV bị thiếu hoặc không hợp lệ: TUYỆT ĐỐI KHÔNG nạp hardcoded key.
    // Nếu môi trường khác cần giải mã dữ liệu cũ, phải cấu hình tường minh qua GOOGLE_TOKEN_LEGACY_KEY.
    const rawNodeEnv =
      this.configService.get<string>('NODE_ENV') ?? process.env.NODE_ENV;
    const normalizedNodeEnv =
      typeof rawNodeEnv === 'string' ? rawNodeEnv.trim().toLowerCase() : '';

    const isExplicitDevOrTest =
      normalizedNodeEnv === 'development' || normalizedNodeEnv === 'test';

    if (isExplicitDevOrTest) {
      const hardcodedLegacy = 'vanbynhi-default-google-token-key-32b!';
      const hardcodedLegacyKey = crypto
        .createHash('sha256')
        .update(hardcodedLegacy)
        .digest();
      this.addCandidateKey(hardcodedLegacyKey);
    }
  }

  /**
   * Đăng ký khóa ứng viên giải mã dữ liệu cũ từ chuỗi cấu hình.
   * Hỗ trợ 64-hex, 32-char utf8, base64 32 bytes và SHA-256 hash của chuỗi khóa.
   */
  private registerCandidateKey(rawKey: string): void {
    if (!rawKey) return;
    const trimmed = rawKey.trim();
    if (!trimmed) return;

    // A. 64 ký tự hex (32 bytes)
    if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
      this.addCandidateKey(Buffer.from(trimmed, 'hex'));
    }

    // B. Đúng 32 bytes UTF-8
    if (Buffer.byteLength(trimmed, 'utf8') === 32) {
      this.addCandidateKey(Buffer.from(trimmed, 'utf8'));
    }

    // C. Base64 của 32 bytes
    if (
      /^[A-Za-z0-9+/]{42,43}={0,2}$/.test(trimmed) &&
      Buffer.from(trimmed, 'base64').length === 32
    ) {
      this.addCandidateKey(Buffer.from(trimmed, 'base64'));
    }

    // D. Dẫn xuất SHA-256 (tương thích các phiên bản backend cũ băm chuỗi thành 32 bytes qua SHA-256)
    const sha256Derived = crypto.createHash('sha256').update(trimmed).digest();
    this.addCandidateKey(sha256Derived);
  }

  /**
   * Thêm khóa Buffer 32 bytes vào danh sách giải mã ứng viên (bỏ qua nếu trùng khóa chính hoặc đã có)
   */
  private addCandidateKey(keyBuf: Buffer): void {
    if (keyBuf.length !== 32) return;
    if (keyBuf.equals(this.key)) return;
    if (this.legacyCandidateKeys.some((k) => k.equals(keyBuf))) return;
    this.legacyCandidateKeys.push(keyBuf);
  }

  /**
   * Kiểm tra xem chuỗi có đúng định dạng AES-256-GCM đã mã hóa (iv:authTag:encrypted) không
   */
  isEncrypted(value?: string | null): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    const parts = value.split(':');
    if (parts.length !== 3) {
      return false;
    }
    const [ivHex, authTagHex, encryptedHex] = parts;
    // IV là 12 bytes (24 hex), authTag là 16 bytes (32 hex)
    if (ivHex.length !== 24 || authTagHex.length !== 32 || encryptedHex.length === 0) {
      return false;
    }
    return (
      /^[0-9a-fA-F]+$/.test(ivHex) &&
      /^[0-9a-fA-F]+$/.test(authTagHex) &&
      /^[0-9a-fA-F]+$/.test(encryptedHex)
    );
  }

  /**
   * Nhận diện chuỗi token plaintext cũ (chưa được mã hóa qua AES-256-GCM).
   * Cơ chế an toàn:
   * 1. Tuyệt đối không chứa dấu ':' (ký tự phân tách ciphertext chuẩn ivHex:authTagHex:encryptedHex).
   * 2. Độ dài tối thiểu >= 20 ký tự (chuẩn OAuth 2.0 refresh token).
   * 3. Chỉ chứa các ký tự URL-safe hợp lệ theo RFC 6749 (chữ cái, chữ số, '_', '-', '.', '~', '/').
   * 4. Không áp đặt định kiến bắt buộc mọi token phải bắt đầu bằng '1//' hay '1/' vì Google OAuth token
   *    là opaque string; đồng thời vẫn bảo đảm không nhận nhầm các ciphertext có dấu ':' hoặc chuỗi chứa ký tự bất thường.
   */
  isLegacyPlaintext(value?: string | null): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    const trimmed = value.trim();
    if (trimmed.length < 20 || trimmed.includes(':')) {
      return false;
    }
    return /^[A-Za-z0-9_.~/-]+$/.test(trimmed);
  }

  /**
   * Mã hóa chuỗi nhạy cảm (Google refresh token) bằng AES-256-GCM với khóa chính 32 bytes
   * Tuyệt đối không dùng khóa dự phòng hay fallback khi mã hóa mới.
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

  private tryDecryptWithKey(
    key: Buffer,
    ivHex: string,
    authTagHex: string,
    encryptedHex: string,
  ): string | null {
    try {
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch {
      return null;
    }
  }

  /**
   * Giải mã chuỗi AES-256-GCM đã mã hóa (hỗ trợ tương thích ngược dữ liệu ciphertext cũ và plaintext cũ)
   */
  decrypt(ciphertext: string): string {
    if (!ciphertext) {
      throw new InternalServerErrorException('Dữ liệu cần giải mã không được để trống');
    }

    if (this.isEncrypted(ciphertext)) {
      const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');

      // 1. Thử giải mã bằng khóa chính hiện tại
      const decryptedWithPrimaryKey = this.tryDecryptWithKey(
        this.key,
        ivHex,
        authTagHex,
        encryptedHex,
      );
      if (decryptedWithPrimaryKey !== null) {
        return decryptedWithPrimaryKey;
      }

      // 2. Thử giải mã bằng các khóa ứng viên dữ liệu cũ (tương thích ngược các token đã lưu trước đây)
      for (const legacyKey of this.legacyCandidateKeys) {
        const decryptedLegacy = this.tryDecryptWithKey(
          legacyKey,
          ivHex,
          authTagHex,
          encryptedHex,
        );
        if (decryptedLegacy !== null) {
          this.logger.warn(
            'Giải mã thành công refresh token bằng khóa tương thích dữ liệu cũ. Giữ nguyên token để tránh mất kết nối.',
          );
          return decryptedLegacy;
        }
      }

      this.logger.error(
        'Giải mã refresh token thất bại: Khóa giải mã không đúng hoặc dữ liệu bị thay đổi',
      );
      throw new InternalServerErrorException(
        'Không thể giải mã dữ liệu xác thực Google (khóa giải mã không khớp hoặc dữ liệu bị thay đổi)',
      );
    }

    // 3. Tương thích dữ liệu cũ: Nếu token được lưu ở dạng plaintext trước đây
    if (this.isLegacyPlaintext(ciphertext)) {
      this.logger.warn(
        'Phát hiện refresh token ở định dạng plaintext cũ. Cần tự động mã hóa lại khi lưu.',
      );
      return ciphertext;
    }

    throw new InternalServerErrorException(
      'Định dạng chuỗi mã hóa không hợp lệ (cần iv:authTag:content)',
    );
  }
}
