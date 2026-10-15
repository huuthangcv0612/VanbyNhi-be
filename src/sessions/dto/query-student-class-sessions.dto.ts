import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SessionStatus } from '../../../generated/prisma/client.js';

export class QueryStudentClassSessionsDto {
  @IsOptional()
  @IsEnum(SessionStatus, {
    message: 'Trạng thái buổi học phải là SCHEDULED, IN_PROGRESS, COMPLETED hoặc CANCELLED',
  })
  status?: SessionStatus;

  @IsOptional()
  @IsDateString({}, { message: 'Tham số "from" phải có định dạng ngày hợp lệ (ISO 8601)' })
  from?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Tham số "to" phải có định dạng ngày hợp lệ (ISO 8601)' })
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Trang phải là số nguyên' })
  @Min(1, { message: 'Trang phải lớn hơn hoặc bằng 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Giới hạn phải là số nguyên' })
  @Min(1, { message: 'Giới hạn tối thiểu là 1' })
  @Max(100, { message: 'Giới hạn tối đa là 100' })
  limit?: number = 10;
}
