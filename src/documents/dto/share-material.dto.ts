import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ShareMaterialDto {
  @IsNotEmpty({ message: 'Mã tài liệu (documentId) không được để trống' })
  @IsString({ message: 'Mã tài liệu phải là chuỗi ký tự' })
  documentId: string;

  @IsOptional()
  @IsString({ message: 'Tiêu đề hiển thị phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tiêu đề không được vượt quá 255 ký tự' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Trạng thái xuất bản (isPublished) phải là boolean' })
  isPublished?: boolean = true;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })
  order?: number = 0;

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
