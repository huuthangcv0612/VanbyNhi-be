import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../../generated/prisma/client.js';

export class UpdateAttendanceDto {
  @IsNotEmpty({ message: 'Trạng thái điểm danh không được để trống' })
  @IsEnum(AttendanceStatus, {
    message: 'Trạng thái phải là PRESENT, ABSENT hoặc LATE',
  })
  status!: AttendanceStatus;

  @IsOptional()
  @IsString({ message: 'Lý do thay đổi trạng thái phải là chuỗi' })
  reason?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Thời gian check-in không hợp lệ' })
  checkedInAt?: Date | null;

  @IsOptional()
  @IsString({ message: 'Ghi chú điểm danh phải là chuỗi' })
  note?: string;
}
