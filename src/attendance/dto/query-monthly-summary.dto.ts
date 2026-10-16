import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMonthlySummaryDto {
  @IsNotEmpty({ message: 'billingYear không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'billingYear phải là số nguyên' })
  @Min(2000, { message: 'Năm không hợp lệ' })
  billingYear!: number;

  @IsNotEmpty({ message: 'billingMonth không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'billingMonth phải là số nguyên từ 1 đến 12' })
  @Min(1, { message: 'Tháng từ 1 đến 12' })
  @Max(12, { message: 'Tháng từ 1 đến 12' })
  billingMonth!: number;
}
