import {
  IsNumber,
  Min,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RecordPaymentDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount phải là số' })
  @Min(1000, { message: 'Số tiền thanh toán phải tối thiểu 1.000 VNĐ' })
  @IsNotEmpty({ message: 'Số tiền thanh toán không được để trống' })
  amount!: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Thời điểm thanh toán không hợp lệ' })
  paymentDate?: Date;

  @IsOptional()
  @IsString({ message: 'Phương thức thanh toán phải là chuỗi' })
  paymentMethod?: string;

  @IsOptional()
  @IsString({ message: 'Ghi chú thanh toán phải là chuỗi' })
  note?: string;
}
