import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString({ message: 'Tên danh mục phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Tên danh mục không được vượt quá 100 ký tự' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Mô tả danh mục phải là chuỗi ký tự' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Mã danh mục cha phải là chuỗi ký tự' })
  parentId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })
  sortOrder?: number = 0;
}
