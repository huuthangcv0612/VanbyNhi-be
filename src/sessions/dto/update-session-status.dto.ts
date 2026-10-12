import { IsEnum, IsNotEmpty } from 'class-validator';
import { SessionStatus } from '../../../generated/prisma/client.js';

export class UpdateSessionStatusDto {
  @IsNotEmpty({ message: 'Trạng thái buổi học không được để trống' })
  @IsEnum(SessionStatus, {
    message:
      'Trạng thái phải là SCHEDULED, IN_PROGRESS, COMPLETED hoặc CANCELLED',
  })
  status!: SessionStatus;
}
