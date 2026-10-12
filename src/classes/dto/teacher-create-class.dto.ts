import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsNumber,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class TeacherCreateClassDto {
  @IsNotEmpty({ message: 'Tên lớp học không được để trống' })
  @IsString({ message: 'Tên lớp học phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tên lớp học không được vượt quá 255 ký tự' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name: string;

  @IsOptional()
  @IsString({ message: 'Mô tả lớp học phải là chuỗi ký tự' })
  @MaxLength(1000, { message: 'Mô tả không được vượt quá 1000 ký tự' })
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng học sinh tối đa phải là số nguyên' })
  @Min(1, { message: 'Số lượng học sinh tối đa phải lớn hơn hoặc bằng 1' })
  maxStudents?: number;

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
