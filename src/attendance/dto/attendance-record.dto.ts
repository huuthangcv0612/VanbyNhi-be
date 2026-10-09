import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../../generated/prisma/client.js';

export class AttendanceRecordDto {
  @IsString({ message: 'studentId phải là chuỗi' })
  @IsNotEmpty({ message: 'studentId không được để trống' })
  studentId!: string;

  @IsEnum(AttendanceStatus, {
    message: 'Trạng thái điểm danh phải là PRESENT, ABSENT hoặc LATE',
  })
  status!: AttendanceStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Thời gian điểm danh không hợp lệ' })
  checkedInAt?: Date;

  @IsOptional()
  @IsString({ message: 'Ghi chú điểm danh phải là chuỗi' })
  note?: string;
}
