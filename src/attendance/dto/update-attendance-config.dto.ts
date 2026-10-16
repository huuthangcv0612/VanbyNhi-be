import { IsOptional, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAttendanceConfigDto {
  @IsOptional()
  @IsBoolean({ message: 'chargePresent phải là boolean' })
  chargePresent?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'chargeLate phải là boolean' })
  chargeLate?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'chargeExcusedAbsent phải là boolean' })
  chargeExcusedAbsent?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'chargeUnexcusedAbsent phải là boolean' })
  chargeUnexcusedAbsent?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'allowMakeUpSession phải là boolean' })
  allowMakeUpSession?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'retentionDays phải là số nguyên' })
  @Min(1, { message: 'retentionDays tối thiểu là 1' })
  @Max(365, { message: 'retentionDays tối đa là 365' })
  retentionDays?: number;
}
