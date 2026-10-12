import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class VoidPaymentDto {
  @IsNotEmpty({
    message: 'Lý do hủy thanh toán (voidReason) không được để trống',
  })
  @IsString({ message: 'Lý do hủy thanh toán phải là chuỗi' })
  @MinLength(5, { message: 'Lý do hủy thanh toán phải có ít nhất 5 ký tự' })
  voidReason!: string;
}
