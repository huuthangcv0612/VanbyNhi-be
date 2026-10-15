import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteUploadDto {
  @IsNotEmpty({ message: 'Mã storageKey không được để trống' })
  @IsString({ message: 'Mã storageKey phải là chuỗi ký tự' })
  storageKey: string;
}
