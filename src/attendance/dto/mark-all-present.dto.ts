import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class MarkAllPresentDto {
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  note?: string;

  @IsOptional()
  @IsBoolean({ message: 'overrideExisting phải là boolean' })
  overrideExisting?: boolean;
}
