import {
  IsArray,
  ArrayNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class AssignDocumentsToClassesDto {
  @IsArray({ message: 'Danh sách mã tài liệu (documentIds) phải là một mảng' })
  @ArrayNotEmpty({ message: 'Phải chọn ít nhất một tài liệu' })
  @IsString({ each: true, message: 'Mỗi documentId phải là chuỗi ký tự' })
  documentIds: string[];

  @IsArray({ message: 'Danh sách mã lớp học (classIds) phải là một mảng' })
  @ArrayNotEmpty({ message: 'Phải chọn ít nhất một lớp học' })
  @IsString({ each: true, message: 'Mỗi classId phải là chuỗi ký tự' })
  classIds: string[];

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Trạng thái xuất bản (isPublished) phải là boolean' })
  isPublished?: boolean = true;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Thời gian bắt đầu truy cập phải là định dạng ISO date hợp lệ' },
  )
  accessStartTime?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Thời gian kết thúc truy cập phải là định dạng ISO date hợp lệ' },
  )
  accessEndTime?: string;
}
