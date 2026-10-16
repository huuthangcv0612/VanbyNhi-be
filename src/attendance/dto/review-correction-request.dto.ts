import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CorrectionRequestStatus } from '../../../generated/prisma/client.js';

export class ReviewCorrectionRequestDto {
  @IsNotEmpty({ message: 'Trạng thái duyệt không được để trống' })
  @IsEnum(CorrectionRequestStatus, {
    message: 'Trạng thái xử lý phải là APPROVED hoặc REJECTED',
  })
  status!: CorrectionRequestStatus;

  @IsOptional()
  @IsString({ message: 'Phản hồi / ghi chú đánh giá phải là chuỗi' })
  @MaxLength(1000, { message: 'Ghi chú không được vượt quá 1000 ký tự' })
  reviewNote?: string;
}
