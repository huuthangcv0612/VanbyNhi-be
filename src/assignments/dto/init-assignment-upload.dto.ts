import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UploadTargetType } from '../../../generated/prisma/client.js';

export class InitAssignmentUploadDto {
  @IsEnum(UploadTargetType, {
    message: 'targetType phải là ASSIGNMENT, SUBMISSION hoặc REVIEW',
  })
  targetType!: UploadTargetType;

  @IsString({ message: 'Tên file gốc phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên file gốc không được để trống' })
  originalName!: string;

  @IsString({ message: 'Loại MIME phải là chuỗi' })
  @IsNotEmpty({ message: 'Loại MIME không được để trống' })
  mimeType!: string;

  @Type(() => Number)
  @IsInt({ message: 'Dung lượng file (sizeBytes) phải là số nguyên' })
  @Min(1, { message: 'Dung lượng file phải lớn hơn 0 bytes' })
  @Max(104857600, { message: 'Dung lượng file tối đa là 100MB' })
  sizeBytes!: number;

  @IsOptional()
  @IsString({ message: 'targetId phải là chuỗi' })
  targetId?: string;
}
