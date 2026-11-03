import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleCallbackQueryDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsString()
  authuser?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  hd?: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  error_description?: string;

  @IsOptional()
  @IsString()
  error_subtype?: string;

  /**
   * RFC 9207 (OAuth 2.0 Authorization Server Issuer Identification)
   * Google Authorization Server luôn gửi kèm tham số `iss` trong mọi authorization response
   * (áp dụng cho cả success response và error response) để bảo vệ ứng dụng chống Mix-up Attacks.
   * Giá trị chuẩn xác duy nhất theo Google OpenID Connect: https://accounts.google.com
   */
  @IsNotEmpty({ message: 'Mã phát hành (iss) là bắt buộc từ Google' })
  @IsString({ message: 'iss phải là chuỗi ký tự' })
  iss: string;

  @IsOptional()
  @IsString()
  format?: 'json' | 'redirect';
}

