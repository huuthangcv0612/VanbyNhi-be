import { IsOptional, IsString, IsUrl, IsNumber, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpdateClassDto {
  @IsOptional()
  @IsString({ message: 'Tên lớp học phải là chuỗi ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả lớp học phải là chuỗi ký tự' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'teacherId phải là chuỗi ký tự' })
  teacherId?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Link Google Meet mặc định không đúng định dạng URL' })
  defaultMeetUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Học phí hàng tháng phải là số hợp lệ' },
  )
  @Min(0, { message: 'Học phí hàng tháng không được âm' })
  monthlyTuition?: number;
}
