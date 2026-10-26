import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ImportDocumentDto {
  @IsNotEmpty({ message: 'Mã lưu trữ tệp DOCX (storageKey) là bắt buộc' })
  @IsString({ message: 'storageKey phải là chuỗi ký tự' })
  storageKey: string;

  @IsOptional()
  @IsString({ message: 'Tiêu đề tài liệu phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tiêu đề tài liệu không được vượt quá 255 ký tự' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Mã danh mục phải là chuỗi ký tự' })
  categoryId?: string | null;
}
