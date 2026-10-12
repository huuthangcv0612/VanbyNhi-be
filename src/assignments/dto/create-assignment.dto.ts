import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUrl,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssignmentDto {
  @IsString({ message: 'classId phải là chuỗi' })
  @IsNotEmpty({ message: 'classId không được để trống' })
  classId!: string;

  @IsOptional()
  @IsString({ message: 'sessionId phải là chuỗi' })
  sessionId?: string;

  @IsString({ message: 'Tiêu đề bài tập phải là chuỗi' })
  @IsNotEmpty({ message: 'Tiêu đề bài tập không được để trống' })
  title!: string;

  @IsOptional()
  @IsString({ message: 'Mô tả bài tập phải là chuỗi' })
  description?: string;

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
  dueDate?: Date;
}
