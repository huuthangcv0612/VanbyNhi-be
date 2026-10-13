import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsISO8601,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { MeetingType, ScheduleStatus } from '../../../generated/prisma/client.js';

export class UpdateScheduleDto {
  @IsOptional()
  @IsString({ message: 'Tiêu đề lịch học phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tiêu đề lịch học không được để trống khi cung cấp' })
  @MaxLength(200, { message: 'Tiêu đề lịch học không được vượt quá 200 ký tự' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả lịch học phải là chuỗi ký tự' })
  description?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'Thời gian bắt đầu phải theo định dạng ISO 8601' })
  startAt?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'Thời gian kết thúc phải theo định dạng ISO 8601' })
  endAt?: string;

  @IsOptional()
  @IsString({ message: 'Múi giờ phải là chuỗi ký tự' })
  timezone?: string;

  @IsOptional()
  @IsString({ message: 'Mã lớp học (classId) phải là chuỗi ký tự' })
  classId?: string;

  @IsOptional()
  @IsArray({ message: 'Danh sách studentIds phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi mã học sinh trong studentIds phải là chuỗi' })
  studentIds?: string[];

  @IsOptional()
  @IsEnum(MeetingType, {
    message: 'Hình thức học phải là ONLINE_MEET, ONLINE_WEB hoặc IN_PERSON',
  })
  meetingType?: MeetingType;

  @IsOptional()
  @IsString({ message: 'Đường dẫn phòng học (meetingUrl) phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Đường dẫn meetingUrl không được vượt quá 500 ký tự' })
  meetingUrl?: string;

  @IsOptional()
  @IsString({ message: 'Địa điểm học (location) phải là chuỗi ký tự' })
  @MaxLength(300, { message: 'Địa điểm không được vượt quá 300 ký tự' })
  location?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus, {
    message: 'Trạng thái lịch học phải là SCHEDULED, CANCELLED hoặc COMPLETED',
  })
  status?: ScheduleStatus;

  @IsOptional()
  @IsInt({ message: 'Số phút nhắc lịch phải là số nguyên' })
  @Min(0, { message: 'Số phút nhắc lịch không được nhỏ hơn 0' })
  reminderMinutes?: number;

  @IsOptional()
  @IsString({ message: 'Mã nhãn lịch (labelId) phải là chuỗi ký tự' })
  labelId?: string;
}
