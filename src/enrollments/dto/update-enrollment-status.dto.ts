import { IsEnum } from 'class-validator';
import { MemberStatus } from '../../../generated/prisma/client.js';

export class UpdateEnrollmentStatusDto {
  @IsEnum(MemberStatus, {
    message: 'Trạng thái phải là ACTIVE, INACTIVE hoặc LEFT',
  })
  status!: MemberStatus;
}
