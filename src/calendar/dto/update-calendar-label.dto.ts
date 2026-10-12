import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';

export class UpdateCalendarLabelDto {
  @IsOptional()
  @IsString({ message: 'Tên nhãn phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Tên nhãn không được vượt quá 100 ký tự' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Mã màu phải là chuỗi ký tự' })
  @Matches(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
    message: 'Mã màu phải là định dạng HEX hợp lệ (#RGB hoặc #RRGGBB)',
  })
  color?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả nhãn phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Mô tả nhãn không được vượt quá 255 ký tự' })
  description?: string | null;
}
