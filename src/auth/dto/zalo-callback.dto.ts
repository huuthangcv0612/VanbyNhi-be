import { IsOptional, IsString } from 'class-validator';

export class ZaloCallbackDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  code_challenge?: string;

  @IsOptional()
  error?: string | number;

  @IsOptional()
  @IsString()
  error_description?: string;

  @IsOptional()
  @IsString()
  error_name?: string;

  @IsOptional()
  @IsString()
  error_reason?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  oa_id?: string;

  @IsOptional()
  @IsString()
  app_id?: string;

  @IsOptional()
  @IsString()
  format?: string;
}
