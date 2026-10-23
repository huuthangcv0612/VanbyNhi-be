import { IsBoolean } from 'class-validator';

export class ToggleKeepForeverDto {
  @IsBoolean({ message: 'isKeepForever phải là giá trị boolean' })
  isKeepForever!: boolean;
}
