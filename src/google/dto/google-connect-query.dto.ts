import { IsOptional, IsIn } from 'class-validator';

export class GoogleConnectQueryDto {
  @IsOptional()
  @IsIn(['json', 'redirect'])
  format?: 'json' | 'redirect';
}
