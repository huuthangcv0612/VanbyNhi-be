import { IsOptional, IsISO8601, IsString } from 'class-validator';

export class QueryCalendarEventsDto {
  @IsOptional()
  @IsISO8601(
    {},
    { message: 'Tham số "from" phải có định dạng ISO 8601 hợp lệ' },
  )
  from?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'Tham số "to" phải có định dạng ISO 8601 hợp lệ' })
  to?: string;

  @IsOptional()
  @IsString({ message: 'labelId phải là chuỗi ký tự' })
  labelId?: string;
}
