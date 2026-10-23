import {
  IsString,
  IsOptional,
  IsArray,
  IsUrl,
  IsDate,
  IsNumber,
  Min,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAssignmentDto {
  @IsOptional()
  @IsString({ message: 'Tiêu đề bài tập phải là chuỗi' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả bài tập phải là chuỗi' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'sessionId phải là chuỗi' })
  sessionId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Thang điểm tối đa phải là số' })
  @Min(0.01, { message: 'Thang điểm tối đa phải lớn hơn 0' })
  maxScore?: number;

  @IsOptional()
  @IsBoolean({ message: 'allowResubmission phải là boolean' })
  allowResubmission?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'maxAttempts phải là số nguyên' })
  @Min(1, { message: 'Số lần nộp tối đa phải từ 1 trở lên' })
  maxAttempts?: number | null;

  @IsOptional()
  @IsArray({ message: 'fileUrls phải là mảng chuỗi URL' })
  @IsUrl(
    { require_protocol: true },
    { each: true, message: 'URL tệp đính kèm không hợp lệ' },
  )
  fileUrls?: string[];

  @IsOptional()
  @IsArray({ message: 'attachmentKeys phải là mảng chuỗi' })
  @IsString({ each: true, message: 'Mỗi attachmentKey phải là chuỗi' })
  attachmentKeys?: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Hạn nộp dueDate không hợp lệ' })
  dueDate?: Date | null;
}
