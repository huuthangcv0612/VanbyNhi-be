import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LinkZaloDto {
  @IsNotEmpty({ message: 'linkTicket không được để trống' })
  @IsString({ message: 'linkTicket phải là chuỗi' })
  linkTicket: string;

  @IsNotEmpty({ message: 'Email hoặc số điện thoại không được để trống' })
  @IsString({ message: 'identifier phải là chuỗi' })
  identifier: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'password phải là chuỗi' })
  @MaxLength(100, { message: 'Mật khẩu không được vượt quá 100 ký tự' })
  password: string;
}
