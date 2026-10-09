import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
  IsDate,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateTuitionFeeDto {
  @IsNotEmpty({ message: 'enrollmentId không được để trống' })
  @IsString({ message: 'enrollmentId phải là chuỗi' })
  enrollmentId!: string;

  @Type(() => Number)
  @IsInt({ message: 'billingYear phải là số nguyên' })
  @Min(2000, { message: 'billingYear phải >= 2000' })
  @Max(2100, { message: 'billingYear phải <= 2100' })
  billingYear!: number;

  @Type(() => Number)
  @IsInt({ message: 'billingMonth phải là số nguyên' })
  @Min(1, { message: 'billingMonth phải từ 1 đến 12' })
  @Max(12, { message: 'billingMonth phải từ 1 đến 12' })
  billingMonth!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amountDue phải là số' })
  @Min(0, { message: 'amountDue phải >= 0' })
  amountDue?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'dueDate không hợp lệ' })
  dueDate?: Date;

  @IsOptional()
  @IsString({ message: 'note phải là chuỗi' })
  note?: string;
}
