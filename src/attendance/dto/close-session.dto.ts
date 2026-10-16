import { IsOptional, IsString } from 'class-validator';

export class CloseAttendanceSessionDto {
  @IsOptional()
  @IsString({ message: 'Ghi chú chốt điểm danh phải là chuỗi' })
  note?: string;
}
