import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsNumber,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateClassDto {
  @IsNotEmpty({ message: 'Tên lớp học không được để trống' })
  @IsString({ message: 'Tên lớp học phải là chuỗi ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @IsOptional()
  @IsString({ message: 'Mô tả lớp học phải là chuỗi ký tự' })
  description?: string;

  @IsNotEmpty({
    message: 'Giáo viên phụ trách (teacherId) không được để trống',
  })
  @IsString({ message: 'teacherId phải là chuỗi ký tự' })
  teacherId: string;

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
  monthlyTuition?: number = 0;
}
