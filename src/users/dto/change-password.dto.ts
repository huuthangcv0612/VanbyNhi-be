import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  @IsString({ message: 'Mật khẩu hiện tại phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Mật khẩu hiện tại không được vượt quá 100 ký tự' })
  currentPassword: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu mới tối thiểu 6 ký tự' })
  @MaxLength(72, { message: 'Mật khẩu mới không được vượt quá 72 ký tự' })
  newPassword: string;
}
