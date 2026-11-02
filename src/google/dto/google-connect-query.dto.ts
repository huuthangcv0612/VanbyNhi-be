import { IsOptional, IsIn, IsString } from 'class-validator';

export class GoogleConnectQueryDto {
  @IsOptional()
  @IsIn(['json', 'redirect'])
  format?: 'json' | 'redirect';

  @IsOptional()
  @IsString()
  returnUrl?: string;

  @IsOptional()
  @IsString()
  redirect_uri?: string;
}

