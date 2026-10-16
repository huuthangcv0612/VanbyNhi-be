import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { AttendanceStatus } from '../../../generated/prisma/client.js';

export class CreateCorrectionRequestDto {
  @IsString({ message: 'attendanceId phải là chuỗi' })
  @IsNotEmpty({ message: 'attendanceId không được để trống' })
  attendanceId!: string;

  @IsEnum(AttendanceStatus, {
    message: 'Trạng thái mong muốn điều chỉnh không hợp lệ',
  })
  requestedStatus!: AttendanceStatus;

  @IsString({ message: 'Lý do xin điều chỉnh phải là chuỗi' })
  @IsNotEmpty({ message: 'Lý do xin điều chỉnh không được để trống' })
  @MaxLength(1000, { message: 'Lý do không được vượt quá 1000 ký tự' })
  reason!: string;

  @IsOptional()
  @IsString({ message: 'evidenceUrl phải là chuỗi link minh chứng' })
  evidenceUrl?: string;
}
