import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsNotEmpty({
    message: 'Tài khoản (email hoặc số điện thoại) không được để trống',
  })
  @IsString({ message: 'Tài khoản phải là chuỗi ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  identifier: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}
