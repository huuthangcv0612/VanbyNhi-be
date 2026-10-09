import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TuitionStatus } from '../../../generated/prisma/client.js';

export class QueryTuitionFeesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  billingYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  billingMonth?: number;

  @IsOptional()
  @IsEnum(TuitionStatus)
  status?: TuitionStatus;

  @IsOptional()
  @IsString()
  classId?: string;

  @IsOptional()
  @IsString()
  studentId?: string;
}
