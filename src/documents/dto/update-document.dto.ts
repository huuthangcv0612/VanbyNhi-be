import { IsOptional, IsString, MaxLength, IsEnum } from 'class-validator';
import { DocumentStatus } from '../../../generated/prisma/client.js';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString({ message: 'Tiêu đề tài liệu phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tiêu đề tài liệu không được vượt quá 255 ký tự' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả tài liệu phải là chuỗi ký tự' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Mã danh mục phải là chuỗi ký tự' })
  categoryId?: string | null;

  @IsOptional()
  @IsEnum(DocumentStatus, { message: 'Trạng thái tài liệu không hợp lệ' })
  status?: DocumentStatus;
}
