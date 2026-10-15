import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InitUploadDto {
  @IsNotEmpty({ message: 'Tiêu đề tài liệu không được để trống' })
  @IsString({ message: 'Tiêu đề tài liệu phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tiêu đề tài liệu không được vượt quá 255 ký tự' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Mô tả tài liệu phải là chuỗi ký tự' })
  description?: string;

  @IsNotEmpty({ message: 'Tên file gốc không được để trống' })
  @IsString({ message: 'Tên file gốc phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tên file gốc không được vượt quá 255 ký tự' })
  originalName: string;

  @IsNotEmpty({ message: 'Loại MIME không được để trống' })
  @IsString({ message: 'Loại MIME phải là chuỗi ký tự' })
  mimeType: string;

  @IsNotEmpty({ message: 'Dung lượng file không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'Dung lượng file phải là số nguyên (bytes)' })
  @Min(1, { message: 'Dung lượng file phải lớn hơn 0' })
  sizeBytes: number;

  @IsOptional()
  @IsString({ message: 'Mã danh mục phải là chuỗi ký tự' })
  categoryId?: string;
}
