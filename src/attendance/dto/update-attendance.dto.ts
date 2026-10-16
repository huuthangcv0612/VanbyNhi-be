import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../../generated/prisma/client.js';

export class UpdateAttendanceDto {
  @IsNotEmpty({ message: 'Trạng thái điểm danh không được để trống' })
  @IsEnum(AttendanceStatus, {
    message:
      'Trạng thái phải là PRESENT, LATE, EXCUSED_ABSENT, UNEXCUSED_ABSENT, NOT_MARKED hoặc ABSENT',
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

  @IsOptional()
  @IsBoolean({ message: 'isMakeUp phải là boolean' })
  isMakeUp?: boolean;

  @IsOptional()
  @IsString({ message: 'originalSessionId phải là chuỗi' })
  originalSessionId?: string;
}
