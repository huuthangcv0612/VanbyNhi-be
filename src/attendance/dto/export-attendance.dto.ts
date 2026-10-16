import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ExportAttendanceDto {
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
}
