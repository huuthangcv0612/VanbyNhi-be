import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDocumentContentDto {
  @Type(() => Number)
  @IsInt({ message: 'expectedRevision phải là số nguyên' })
  @Min(1, { message: 'expectedRevision phải >= 1' })
  expectedRevision: number;

  @IsNotEmpty({ message: 'Nội dung tài liệu (content) không được để trống' })
  @IsObject({ message: 'Nội dung tài liệu phải là đối tượng JSON Tiptap hợp lệ' })
  content: Record<string, any>;

  @IsOptional()
  @IsString({ message: 'Lý do cập nhật phiên bản phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Lý do cập nhật không được vượt quá 255 ký tự' })
  versionReason?: string;
}
