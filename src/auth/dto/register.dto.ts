import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  fullName: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @Matches(/^[0-9+]{9,15}$/, {
    message: 'Số điện thoại không đúng định dạng hợp lệ (9-15 chữ số)',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  phone: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Ngày sinh không đúng định dạng ngày (YYYY-MM-DD)' },
  )
  dateOfBirth?: string;
}
