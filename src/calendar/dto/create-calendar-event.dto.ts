import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsISO8601,
  IsInt,
  Min,
  Max,
  IsArray,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateCalendarEventDto {
  @IsNotEmpty({ message: 'Tiêu đề ca dạy không được để trống' })
  @IsString({ message: 'Tiêu đề ca dạy phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tiêu đề ca dạy không được vượt quá 255 ký tự' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Địa chỉ không được vượt quá 500 ký tự' })
  address?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @IsString({ message: 'Link Google Meet phải là chuỗi ký tự' })
  @Matches(/^https?:\/\/meet\.google\.com\/[a-zA-Z0-9\-_?=&.]+$/, {
    message:
      'Link Google Meet phải có định dạng hợp lệ (ví dụ: https://meet.google.com/xxx-yyyy-zzz)',
  })
  meetUrl?: string;

  @IsNotEmpty({ message: 'Thời gian bắt đầu không được để trống' })
  @IsISO8601({}, { message: 'Thời gian bắt đầu phải có định dạng ISO 8601' })
  startAt: string;

  @IsNotEmpty({ message: 'Thời gian kết thúc không được để trống' })
  @IsISO8601({}, { message: 'Thời gian kết thúc phải có định dạng ISO 8601' })
  endAt: string;

  @IsOptional()
  @IsString({ message: 'labelId phải là chuỗi ký tự' })
  labelId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số phút nhắc trước phải là số nguyên' })
  @Min(0, { message: 'Số phút nhắc trước không được âm' })
  @Max(10080, {
    message: 'Số phút nhắc trước không được vượt quá 7 ngày (10080 phút)',
  })
  reminderMinutes?: number;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  note?: string;

  @IsOptional()
  @IsArray({ message: 'Danh sách học sinh phải là mảng chuỗi ID' })
  @IsString({ each: true, message: 'Mỗi học sinh ID phải là chuỗi ký tự' })
  studentIds?: string[];
}
