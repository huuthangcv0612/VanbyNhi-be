import { IsOptional, IsString, MaxLength } from 'class-validator';

export class StudentCheckInDto {
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Ghi chú tối đa 255 ký tự' })
  note?: string;
}
