import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDto {
  @IsNotEmpty({ message: 'Trạng thái isActive không được để trống' })
  @IsBoolean({ message: 'isActive phải là giá trị boolean (true/false)' })
  isActive: boolean;
}
