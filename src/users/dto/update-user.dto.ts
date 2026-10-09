import {
  IsEmail,
  IsOptional,
  IsString,
  IsDateString,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL không đúng định dạng' })
  avatarUrl?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh không đúng định dạng ISO (YYYY-MM-DD)' })
  dateOfBirth?: string;
}
