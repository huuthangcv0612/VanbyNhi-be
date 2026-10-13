import { IsNotEmpty, IsString } from 'class-validator';

export class LinkZaloDto {
  @IsNotEmpty({ message: 'linkTicket không được để trống' })
  @IsString({ message: 'linkTicket phải là chuỗi' })
  linkTicket: string;

  @IsNotEmpty({ message: 'Email hoặc số điện thoại không được để trống' })
  @IsString({ message: 'identifier phải là chuỗi' })
  identifier: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'password phải là chuỗi' })
  password: string;
}
