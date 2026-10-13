import {
  IsOptional,
  IsString,
  IsISO8601,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleStatus } from '../../../generated/prisma/client.js';

export class QueryTeacherSchedulesDto {
  @IsOptional()
  @IsString({ message: 'Mã lớp (classId) phải là chuỗi' })
  classId?: string;

  @IsOptional()
  @IsString({ message: 'Mã học sinh (studentId) phải là chuỗi' })
  studentId?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus, {
    message: 'Trạng thái lịch phải là SCHEDULED, CANCELLED hoặc COMPLETED',
  })
  status?: ScheduleStatus;

  @IsOptional()
  @IsISO8601({}, { message: 'from phải là chuỗi thời gian ISO 8601' })
  from?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'to phải là chuỗi thời gian ISO 8601' })
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang page phải là số nguyên' })
  @Min(1, { message: 'Số trang page phải lớn hơn hoặc bằng 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng limit phải là số nguyên' })
  @Min(1, { message: 'Số lượng limit phải lớn hơn hoặc bằng 1' })
  limit?: number;
}
