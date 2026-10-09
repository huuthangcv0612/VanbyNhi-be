import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEnrollmentTuitionDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Mức học phí tùy chỉnh phải >= 0' })
  tuitionOverride?: number | null;
}
