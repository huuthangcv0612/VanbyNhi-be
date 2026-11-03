import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleExchangeDto {
  @IsNotEmpty({ message: 'Mã xác thực ticket là bắt buộc' })
  @IsString()
  ticket: string;
}
