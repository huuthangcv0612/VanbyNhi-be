import { IsNotEmpty, IsString } from 'class-validator';

export class ExchangeZaloTicketDto {
  @IsNotEmpty({ message: 'Mã ticket không được để trống' })
  @IsString({ message: 'ticket phải là chuỗi' })
  ticket: string;
}
