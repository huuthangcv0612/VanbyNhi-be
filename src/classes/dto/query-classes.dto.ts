import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ClassStatus } from '../../../generated/prisma/client.js';

export class QueryClassesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page phải là số nguyên' })
  @Min(1, { message: 'Page tối thiểu là 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit phải là số nguyên' })
  @Min(1, { message: 'Limit tối thiểu là 1' })
  @Max(100, { message: 'Limit tối đa là 100' })
  limit?: number = 10;

  @IsOptional()
  @IsEnum(ClassStatus, { message: 'Trạng thái lớp không hợp lệ' })
  status?: ClassStatus;

  @IsOptional()
  @IsString({ message: 'Teacher ID phải là chuỗi' })
  teacherId?: string;

  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;
}
