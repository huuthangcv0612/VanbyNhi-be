import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpsertLessonRecordDto {
  @IsString({ message: 'Nội dung bài học phải là chuỗi' })
  @IsNotEmpty({ message: 'Nội dung bài học không được để trống' })
  content!: string;

  @IsOptional()
  @IsString({ message: 'Tóm tắt bài tập về nhà phải là chuỗi' })
  homeworkSummary?: string;

  @IsOptional()
  @IsString({ message: 'Ghi chú của giáo viên phải là chuỗi' })
  teacherNotes?: string;

  @IsOptional()
  @IsString({ message: 'Kiến thức trọng tâm phải là chuỗi' })
  coreKnowledge?: string;

  @IsOptional()
  @IsString({ message: 'Nội dung chưa hoàn thành phải là chuỗi' })
  incompleteContent?: string;

  @IsOptional()
  @IsString({ message: 'Nhận xét chung về buổi học phải là chuỗi' })
  generalRemarks?: string;
}

