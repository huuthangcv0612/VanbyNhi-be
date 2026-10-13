import { IsOptional, IsString } from 'class-validator';

export class ZaloAuthQueryDto {
  @IsOptional()
  @IsString({ message: 'format phải là chuỗi' })
  format?: string;

  /**
   * Tham số tùy chọn: nếu client truyền code_challenge, DTO chấp nhận để không bị
   * ValidationPipe từ chối (forbidNonWhitelisted: true).
   * Tuy nhiên, hệ thống backend vẫn tự sinh code_verifier và code_challenge chuẩn SHA-256
   * Base64 URL-safe không padding để đảm bảo an toàn tuyệt đối theo PKCE RFC 7636.
   */
  @IsOptional()
  @IsString({ message: 'code_challenge phải là chuỗi nếu được cung cấp' })
  code_challenge?: string;
}
