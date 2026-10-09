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
}
