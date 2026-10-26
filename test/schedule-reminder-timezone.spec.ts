import { describe, it, expect } from 'vitest';
import {
  createDateFromParts,
  getDateTimeParts,
  generateWeeklyMonthlyOccurrences,
  isLeapYear,
  getDaysInMonth,
} from '../src/schedules/utils/recurrence.util.js';

describe('Schedule Reminder Timezone & Calendar Calculations', () => {
  const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

  it('tính toán mốc nhắc lịch chính xác theo UTC (buổi 19:00 nhắc 15p => 18:45, nhắc 30p => 18:30)', () => {
    // 19:00:00 VN = 12:00:00 UTC (GMT+7)
    const startAt = new Date('2026-10-26T12:00:00.000Z');

    const reminder15 = 15;
    const dueAt15 = new Date(startAt.getTime() - reminder15 * 60 * 1000);
    expect(dueAt15.toISOString()).toBe('2026-10-26T11:45:00.000Z');

    const parts15 = getDateTimeParts(dueAt15, VN_TIMEZONE);
    expect(parts15.hour).toBe(18);
    expect(parts15.minute).toBe(45);

    const reminder30 = 30;
    const dueAt30 = new Date(startAt.getTime() - reminder30 * 60 * 1000);
    expect(dueAt30.toISOString()).toBe('2026-10-26T11:30:00.000Z');

    const parts30 = getDateTimeParts(dueAt30, VN_TIMEZONE);
    expect(parts30.hour).toBe(18);
    expect(parts30.minute).toBe(30);
  });

  it('xử lý chính xác qua ngày với các mốc giờ 00:10 sáng (nhắc 15p => 23:55 ngày hôm trước)', () => {
    // Buổi học 00:10 ngày 27/10/2026 tại VN (17:10 UTC ngày 26/10)
    const startParts = {
      year: 2026,
      month: 10,
      day: 27,
      hour: 0,
      minute: 10,
      second: 0,
      millisecond: 0,
    };
    const startAt = createDateFromParts(startParts, VN_TIMEZONE);

    // Nhắc trước 15 phút
    const dueAt = new Date(startAt.getTime() - 15 * 60 * 1000);
    const dueParts = getDateTimeParts(dueAt, VN_TIMEZONE);

    expect(dueParts.year).toBe(2026);
    expect(dueParts.month).toBe(10);
    expect(dueParts.day).toBe(26); // Lùi về ngày hôm trước
    expect(dueParts.hour).toBe(23);
    expect(dueParts.minute).toBe(55);
  });

  it('xử lý chính xác chuyển giao cuối năm (00:05 ngày 01/01/2027 nhắc 15p => 23:50 ngày 31/12/2026)', () => {
    const startParts = {
      year: 2027,
      month: 1,
      day: 1,
      hour: 0,
      minute: 5,
      second: 0,
      millisecond: 0,
    };
    const startAt = createDateFromParts(startParts, VN_TIMEZONE);

    const dueAt = new Date(startAt.getTime() - 15 * 60 * 1000);
    const dueParts = getDateTimeParts(dueAt, VN_TIMEZONE);

    expect(dueParts.year).toBe(2026);
    expect(dueParts.month).toBe(12);
    expect(dueParts.day).toBe(31);
    expect(dueParts.hour).toBe(23);
    expect(dueParts.minute).toBe(50);
  });

  it('xử lý chính xác năm nhuận và tháng 2 (2028 là năm nhuận 29 ngày)', () => {
    expect(isLeapYear(2028)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
    expect(getDaysInMonth(2028, 2)).toBe(29);
    expect(getDaysInMonth(2026, 2)).toBe(28);

    // 00:05 ngày 01/03/2028 nhắc 10p => 23:55 ngày 29/02/2028
    const startParts = {
      year: 2028,
      month: 3,
      day: 1,
      hour: 0,
      minute: 5,
      second: 0,
      millisecond: 0,
    };
    const startAt = createDateFromParts(startParts, VN_TIMEZONE);
    const dueAt = new Date(startAt.getTime() - 10 * 60 * 1000);
    const dueParts = getDateTimeParts(dueAt, VN_TIMEZONE);

    expect(dueParts.year).toBe(2028);
    expect(dueParts.month).toBe(2);
    expect(dueParts.day).toBe(29);
    expect(dueParts.hour).toBe(23);
    expect(dueParts.minute).toBe(55);
  });

  it('sinh lịch lặp hàng tuần bảo toàn đúng giờ bắt đầu của từng occurrence', () => {
    // Thứ 2 hàng tuần lúc 19:30 - 21:00
    const startParts = {
      year: 2026,
      month: 10,
      day: 5,
      hour: 19,
      minute: 30,
      second: 0,
      millisecond: 0,
    };
    const endParts = {
      year: 2026,
      month: 10,
      day: 5,
      hour: 21,
      minute: 0,
      second: 0,
      millisecond: 0,
    };

    const startAt = createDateFromParts(startParts, VN_TIMEZONE);
    const endAt = createDateFromParts(endParts, VN_TIMEZONE);

    const occurrences = generateWeeklyMonthlyOccurrences(startAt, endAt, VN_TIMEZONE);

    // Có ít nhất 4 buổi trong tháng
    expect(occurrences.length).toBeGreaterThanOrEqual(4);

    for (const occ of occurrences) {
      const pStart = getDateTimeParts(occ.startAt, VN_TIMEZONE);
      const pEnd = getDateTimeParts(occ.endAt, VN_TIMEZONE);

      expect(pStart.hour).toBe(19);
      expect(pStart.minute).toBe(30);
      expect(pEnd.hour).toBe(21);
      expect(pEnd.minute).toBe(0);

      // Mốc nhắc 30 phút trước buổi học
      const occReminder = new Date(occ.startAt.getTime() - 30 * 60 * 1000);
      const pRem = getDateTimeParts(occReminder, VN_TIMEZONE);
      expect(pRem.hour).toBe(19);
      expect(pRem.minute).toBe(0);
    }
  });
});
