import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CorrectionRequestStatus } from '../../../generated/prisma/client.js';

export class QueryCorrectionRequestsDto {
  @IsOptional()
  @IsString({ message: 'classId phải là chuỗi' })
  classId?: string;

  @IsOptional()
  @IsString({ message: 'studentId phải là chuỗi' })
  studentId?: string;

  @IsOptional()
  @IsEnum(CorrectionRequestStatus, {
    message: 'Trạng thái yêu cầu phải là PENDING, APPROVED hoặc REJECTED',
  })
  status?: CorrectionRequestStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page phải là số nguyên' })
  @Min(1, { message: 'page tối thiểu là 1' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1, { message: 'limit tối thiểu là 1' })
  @Max(100, { message: 'limit tối đa là 100' })
  limit: number = 20;
}
