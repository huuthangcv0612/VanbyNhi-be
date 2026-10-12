import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class StudentJoinClassDto {
  @IsNotEmpty({ message: 'Mã tham gia không được để trống' })
  @IsString({ message: 'Mã tham gia phải là chuỗi ký tự' })
  @MaxLength(64, { message: 'Mã tham gia không hợp lệ' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  joinCode: string;
}
