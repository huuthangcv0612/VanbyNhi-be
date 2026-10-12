import { IsNotEmpty, IsEnum } from 'class-validator';
import { ClassStatus } from '../../../generated/prisma/client.js';

export class TeacherUpdateClassStatusDto {
  @IsNotEmpty({ message: 'Trạng thái lớp học không được để trống' })
  @IsEnum(ClassStatus, {
    message:
      'Trạng thái lớp học phải là ACTIVE, CLOSED, INACTIVE hoặc COMPLETED',
  })
  status: ClassStatus;
}
