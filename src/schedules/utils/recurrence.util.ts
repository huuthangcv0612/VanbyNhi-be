import { BadRequestException } from '@nestjs/common';

export enum ScheduleRecurrence {
  NONE = 'NONE',
  WEEKLY_FOR_MONTH = 'WEEKLY_FOR_MONTH',
}

export interface ScheduleOccurrence {
  startAt: Date;
  endAt: Date;
  index: number;
}

export interface DateTimeParts {
  year: number;
  month: number; // 1 - 12
  day: number; // 1 - 31
  hour: number; // 0 - 23
  minute: number; // 0 - 59
  second: number; // 0 - 59
  millisecond: number; // 0 - 999
}

/**
 * Kiểm tra xem một năm có phải là năm nhuận theo lịch Gregory hay không.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Lấy số ngày tối đa trong một tháng cụ thể của một năm cụ thể.
 * @param year Năm (ví dụ: 2026)
 * @param month Tháng (1 đến 12)
 */
export function getDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) {
    throw new BadRequestException(`Tháng không hợp lệ: ${month}`);
  }

  switch (month) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      return 31;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    case 2:
      return isLeapYear(year) ? 29 : 28;
    default:
      return 30;
  }
}

/**
 * Trích xuất các thành phần ngày/tháng/năm/giờ/phút/giây/mili-giây theo múi giờ IANA.
 */
export function getDateTimeParts(
  date: Date,
  timeZone: string = 'Asia/Ho_Chi_Minh',
): DateTimeParts {
  if (isNaN(date.getTime())) {
    throw new BadRequestException('Thời gian không hợp lệ');
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      fractionalSecondDigits: 3,
      hourCycle: 'h23',
    });

    const parts = formatter.formatToParts(date);
    const map: Record<string, number> = {};
    for (const part of parts) {
      if (part.type !== 'literal') {
        map[part.type] = parseInt(part.value, 10);
      }
    }

    return {
      year: map.year,
      month: map.month,
      day: map.day,
      hour: map.hour === 24 ? 0 : (map.hour ?? 0),
      minute: map.minute ?? 0,
      second: map.second ?? 0,
      millisecond: map.fractionalSecond ?? date.getMilliseconds(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new BadRequestException(`Múi giờ không hợp lệ "${timeZone}": ${message}`);
  }
}

/**
 * Tạo một Date object từ các thành phần ngày giờ trong một múi giờ IANA cụ thể.
 */
export function createDateFromParts(
  parts: DateTimeParts,
  timeZone: string = 'Asia/Ho_Chi_Minh',
): Date {
  const utcGuess = new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
      parts.millisecond,
    ),
  );

  const formatted = getDateTimeParts(utcGuess, timeZone);
  const formattedAsUtc = new Date(
    Date.UTC(
      formatted.year,
      formatted.month - 1,
      formatted.day,
      formatted.hour,
      formatted.minute,
      formatted.second,
      formatted.millisecond,
    ),
  );

  const diff = utcGuess.getTime() - formattedAsUtc.getTime();
  let candidate = new Date(utcGuess.getTime() + diff);

  const verify = getDateTimeParts(candidate, timeZone);
  const verifyAsUtc = new Date(
    Date.UTC(
      verify.year,
      verify.month - 1,
      verify.day,
      verify.hour,
      verify.minute,
      verify.second,
      verify.millisecond,
    ),
  );

  if (verifyAsUtc.getTime() !== utcGuess.getTime()) {
    const diff2 = utcGuess.getTime() - verifyAsUtc.getTime();
    candidate = new Date(candidate.getTime() + diff2);
  }

  return candidate;
}

/**
 * Tính mốc kết thúc bằng cách cộng 1 tháng lịch vào ngày bắt đầu.
 * Quy tắc cộng tháng an toàn:
 * - Nếu tháng 12 thì chuyển sang tháng 1 năm sau.
 * - Giữ ngày trong tháng đích ở mức nhỏ hơn giữa ngày ban đầu và ngày cuối cùng của tháng đích.
 * - Giờ, phút, giây, mili-giây và múi giờ được giữ nguyên vẹn.
 */
export function calculateMonthEndCutoff(
  startAt: Date,
  timeZone: string = 'Asia/Ho_Chi_Minh',
): Date {
  const parts = getDateTimeParts(startAt, timeZone);
  const targetYear = parts.month === 12 ? parts.year + 1 : parts.year;
  const targetMonth = parts.month === 12 ? 1 : parts.month + 1;
  const maxDaysInTargetMonth = getDaysInMonth(targetYear, targetMonth);
  const targetDay = Math.min(parts.day, maxDaysInTargetMonth);

  const cutoffParts: DateTimeParts = {
    year: targetYear,
    month: targetMonth,
    day: targetDay,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
    millisecond: parts.millisecond,
  };

  return createDateFromParts(cutoffParts, timeZone);
}

/**
 * Tính toàn bộ danh sách các buổi học lặp lại hàng tuần trong một tháng kể từ ngày bắt đầu.
 * - Bao gồm ngày bắt đầu, loại trừ mốc kết thúc (occurrenceStart < cutoffDate).
 * - Các buổi cách nhau đúng 7 ngày lịch.
 * - Giữ nguyên thứ trong tuần, giờ bắt đầu và giờ kết thúc trong múi giờ đã cho.
 */
export function generateWeeklyMonthlyOccurrences(
  startAt: Date,
  endAt: Date,
  timeZone: string = 'Asia/Ho_Chi_Minh',
): ScheduleOccurrence[] {
  if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
    throw new BadRequestException('Thời gian bắt đầu hoặc kết thúc không hợp lệ');
  }

  if (startAt >= endAt) {
    throw new BadRequestException(
      'Thời gian bắt đầu (startAt) phải trước thời gian kết thúc (endAt)',
    );
  }

  const cutoffDate = calculateMonthEndCutoff(startAt, timeZone);
  const startParts = getDateTimeParts(startAt, timeZone);
  const endParts = getDateTimeParts(endAt, timeZone);

  const occurrences: ScheduleOccurrence[] = [];
  let index = 0;

  while (true) {
    const daysToAdd = index * 7;
    const nextStartUtc = new Date(
      Date.UTC(startParts.year, startParts.month - 1, startParts.day + daysToAdd),
    );
    const nextEndUtc = new Date(
      Date.UTC(endParts.year, endParts.month - 1, endParts.day + daysToAdd),
    );

    const occStartParts: DateTimeParts = {
      year: nextStartUtc.getUTCFullYear(),
      month: nextStartUtc.getUTCMonth() + 1,
      day: nextStartUtc.getUTCDate(),
      hour: startParts.hour,
      minute: startParts.minute,
      second: startParts.second,
      millisecond: startParts.millisecond,
    };

    const occEndParts: DateTimeParts = {
      year: nextEndUtc.getUTCFullYear(),
      month: nextEndUtc.getUTCMonth() + 1,
      day: nextEndUtc.getUTCDate(),
      hour: endParts.hour,
      minute: endParts.minute,
      second: endParts.second,
      millisecond: endParts.millisecond,
    };

    const occStart = createDateFromParts(occStartParts, timeZone);
    const occEnd = createDateFromParts(occEndParts, timeZone);

    // Bao gồm ngày bắt đầu, loại trừ mốc kết thúc
    if (occStart.getTime() >= cutoffDate.getTime()) {
      break;
    }

    occurrences.push({
      startAt: occStart,
      endAt: occEnd,
      index,
    });

    index++;
  }

  return occurrences;
}
