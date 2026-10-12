import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { MemberStatus } from '../../../generated/prisma/client.js';

export class QueryClassMembersDto {
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi ký tự' })
  search?: string;

  @IsOptional()
  @IsEnum(MemberStatus, {
    message: 'Trạng thái thành viên không hợp lệ',
  })
  status?: MemberStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang phải là số nguyên' })
  @Min(1, { message: 'Số trang phải lớn hơn hoặc bằng 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng phần tử mỗi trang phải là số nguyên' })
  @Min(1, { message: 'Số lượng phần tử mỗi trang phải lớn hơn hoặc bằng 1' })
  @Max(100, { message: 'Số lượng phần tử mỗi trang không được vượt quá 100' })
  limit?: number = 10;
}
