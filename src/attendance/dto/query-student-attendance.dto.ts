import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../../generated/prisma/client.js';

export class QueryStudentAttendanceDto {
  @IsOptional()
  @IsString({ message: 'classId phải là chuỗi' })
  classId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'year phải là số nguyên' })
  @Min(2000, { message: 'Năm không hợp lệ' })
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'month phải là số nguyên từ 1 đến 12' })
  @Min(1, { message: 'Tháng từ 1 đến 12' })
  @Max(12, { message: 'Tháng từ 1 đến 12' })
  month?: number;

  @IsOptional()
  @IsString({ message: 'startDate phải là chuỗi định dạng ngày' })
  startDate?: string;

  @IsOptional()
  @IsString({ message: 'endDate phải là chuỗi định dạng ngày' })
  endDate?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus, {
    message: 'Trạng thái điểm danh không hợp lệ',
  })
  status?: AttendanceStatus;

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
