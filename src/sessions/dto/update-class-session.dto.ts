import { IsString, IsOptional, IsUrl, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateClassSessionDto {
  @IsOptional()
  @IsString({ message: 'Tiêu đề buổi học phải là chuỗi' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả buổi học phải là chuỗi' })
  description?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Thời gian bắt đầu không hợp lệ' })
  startTime?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Thời gian kết thúc không hợp lệ' })
  endTime?: Date;

  @IsOptional()
  @IsUrl(
    { require_protocol: true },
    { message: 'URL phòng học trực tuyến (Meet URL) không hợp lệ' },
  )
  meetUrl?: string | null;
}
