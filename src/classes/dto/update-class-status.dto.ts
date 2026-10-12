import { IsEnum, IsNotEmpty } from 'class-validator';
import { ClassStatus } from '../../../generated/prisma/client.js';

export class UpdateClassStatusDto {
  @IsNotEmpty({ message: 'Trạng thái lớp không được để trống' })
  @IsEnum(ClassStatus, {
    message: 'Trạng thái lớp phải là ACTIVE, INACTIVE hoặc COMPLETED',
  })
  status: ClassStatus;
}
