import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class GoogleLinkDto {
  @IsNotEmpty({ message: 'Mã liên kết linkTicket là bắt buộc' })
  @IsString()
  linkTicket: string;

  @IsNotEmpty({ message: 'Vui lòng cung cấp email hoặc số điện thoại tài khoản VanbyNhi' })
  @IsString()
  identifier: string;

  @IsNotEmpty({ message: 'Mật khẩu là bắt buộc để xác minh quyền sở hữu tài khoản' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}
