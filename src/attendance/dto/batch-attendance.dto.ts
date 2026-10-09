import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceRecordDto } from './attendance-record.dto.js';

export class BatchAttendanceDto {
  @IsArray({ message: 'records phải là mảng danh sách điểm danh' })
  @ArrayMinSize(1, { message: 'Danh sách điểm danh không được để trống' })
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records!: AttendanceRecordDto[];
}
