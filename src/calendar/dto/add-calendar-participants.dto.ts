import { IsOptional, IsString, IsArray } from 'class-validator';

export class AddCalendarParticipantsDto {
  @IsOptional()
  @IsString({ message: 'studentId phải là chuỗi ký tự' })
  studentId?: string;

  @IsOptional()
  @IsArray({ message: 'studentIds phải là mảng chuỗi ID' })
  @IsString({
    each: true,
    message: 'Mỗi studentId trong studentIds phải là chuỗi ký tự',
  })
  studentIds?: string[];
}
