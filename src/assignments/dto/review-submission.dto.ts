import {
  IsNumber,
  Min,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReviewStatus } from '../../../generated/prisma/client.js';

export class ReviewSubmissionDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Điểm số phải là số' })
  @Min(0, { message: 'Điểm số tối thiểu là 0' })
  score?: number;

  @IsOptional()
  @IsString({ message: 'Nhận xét phải là chuỗi' })
  feedback?: string;

  @IsOptional()
  @IsEnum(ReviewStatus, {
    message: 'Trạng thái chấm bài phải là DRAFT hoặc RETURNED',
  })
  status?: ReviewStatus = ReviewStatus.DRAFT;

  @IsOptional()
  @IsArray({ message: 'attachmentKeys phải là mảng chuỗi' })
  @IsString({ each: true, message: 'Mỗi attachmentKey phải là chuỗi' })
  attachmentKeys?: string[];
}
