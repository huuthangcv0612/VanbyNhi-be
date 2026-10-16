import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdateSessionMeetUrlDto {
  @IsString({ message: 'Đường dẫn Google Meet phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Đường dẫn Google Meet không được để trống' })
  @Matches(
    /^https:\/\/meet\.google\.com\/[a-z0-9-]+$/i,
    {
      message:
        'URL phòng học phải là đường dẫn Google Meet hợp lệ (định dạng https://meet.google.com/xxx-yyyy-zzz)',
    },
  )
  meetUrl!: string;
}
