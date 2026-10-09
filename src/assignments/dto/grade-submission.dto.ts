import {
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssignmentStatus } from '../../../generated/prisma/client.js';

export class GradeSubmissionDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Điểm số phải là số' })
  @Min(0, { message: 'Điểm số tối thiểu là 0' })
  @Max(10, { message: 'Điểm số tối đa là 10' })
  score!: number;

  @IsOptional()
  @IsString({ message: 'Nhận xét phải là chuỗi' })
  feedback?: string;

  @IsOptional()
  @IsEnum(AssignmentStatus, {
    message: 'Trạng thái chấm điểm phải là GRADED hoặc RESUBMIT_REQUESTED',
  })
  status?: AssignmentStatus = AssignmentStatus.GRADED;
}
