import { IsString, IsOptional, IsArray, IsUrl } from 'class-validator';

export class SubmitAssignmentDto {
  @IsOptional()
  @IsString({ message: 'Nội dung bài làm phải là chuỗi' })
  content?: string;

  @IsOptional()
  @IsArray({ message: 'fileUrls phải là mảng chuỗi URL' })
  @IsUrl(
    { require_protocol: true },
    { each: true, message: 'URL tệp nộp không hợp lệ' },
  )
  fileUrls?: string[];

  @IsOptional()
  @IsArray({ message: 'attachmentKeys phải là mảng chuỗi storageKey' })
  @IsString({ each: true, message: 'Mỗi attachmentKey phải là chuỗi' })
  attachmentKeys?: string[];

  @IsOptional()
  @IsUrl(
    { require_protocol: true },
    { message: 'URL liên kết ngoài không hợp lệ' },
  )
  externalUrl?: string;
}
