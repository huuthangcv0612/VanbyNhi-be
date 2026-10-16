import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../../generated/prisma/client.js';

export class AttendanceRecordDto {
  @IsString({ message: 'studentId phải là chuỗi' })
  @IsNotEmpty({ message: 'studentId không được để trống' })
  studentId!: string;

  @IsEnum(AttendanceStatus, {
    message:
      'Trạng thái điểm danh phải là PRESENT, LATE, EXCUSED_ABSENT, UNEXCUSED_ABSENT, NOT_MARKED hoặc ABSENT',
  })
  status!: AttendanceStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Thời gian điểm danh không hợp lệ' })
  checkedInAt?: Date;

  @IsOptional()
  @IsString({ message: 'Ghi chú điểm danh phải là chuỗi' })
  note?: string;

  @IsOptional()
  @IsBoolean({ message: 'isMakeUp phải là boolean' })
  isMakeUp?: boolean;

  @IsOptional()
  @IsString({ message: 'originalSessionId phải là chuỗi' })
  originalSessionId?: string;
}
