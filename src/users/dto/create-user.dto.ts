import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../../generated/prisma/client.js';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  fullName: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^[0-9+]{9,15}$/, { message: 'Số điện thoại không đúng định dạng hợp lệ' })
  phone: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email?: string;

  @IsNotEmpty({ message: 'Vai trò (role) không được để trống' })
  @IsEnum([UserRole.TEACHER, UserRole.STUDENT], {
    message: 'Chỉ được tạo tài khoản TEACHER hoặc STUDENT qua endpoint này',
  })
  role: UserRole;

  @IsOptional()
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu ban đầu tối thiểu 6 ký tự' })
  initialPassword?: string;
}
