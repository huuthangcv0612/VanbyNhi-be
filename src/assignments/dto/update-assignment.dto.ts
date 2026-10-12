import { IsString, IsOptional, IsArray, IsUrl, IsDate } from 'class-validator';
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
  @IsArray({ message: 'fileUrls phải là mảng chuỗi URL' })
  @IsUrl(
    { require_protocol: true },
    { each: true, message: 'URL tệp đính kèm không hợp lệ' },
  )
  fileUrls?: string[];

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Hạn nộp dueDate không hợp lệ' })
  dueDate?: Date | null;
}
