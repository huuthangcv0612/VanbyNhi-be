import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpdateMaterialDto {
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
  isPublished?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })
  order?: number;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Thời gian bắt đầu truy cập phải là định dạng ISO date hợp lệ' },
  )
  accessStartTime?: string | null;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Thời gian kết thúc truy cập phải là định dạng ISO date hợp lệ' },
  )
  accessEndTime?: string | null;
}
