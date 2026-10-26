import { describe, it, expect } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import {
  isLeapYear,
  getDaysInMonth,
  getDateTimeParts,
  createDateFromParts,
  calculateMonthEndCutoff,
  generateWeeklyMonthlyOccurrences,
} from './recurrence.util.js';

describe('Recurrence Utility (Tính ngày lặp lại hàng tuần trong một tháng)', () => {
  describe('isLeapYear & getDaysInMonth', () => {
    it('nhận diện chính xác năm nhuận và năm không nhuận', () => {
      expect(isLeapYear(2024)).toBe(true); // chia hết cho 4
      expect(isLeapYear(2026)).toBe(false); // không chia hết cho 4
      expect(isLeapYear(1900)).toBe(false); // chia hết cho 100 nhưng không chia hết cho 400
      expect(isLeapYear(2000)).toBe(true); // chia hết cho 400
    });

    it('trả về đúng số ngày của các tháng 31 ngày', () => {
      [1, 3, 5, 7, 8, 10, 12].forEach((m) => {
        expect(getDaysInMonth(2026, m)).toBe(31);
      });
    });

    it('trả về đúng số ngày của các tháng 30 ngày', () => {
      [4, 6, 9, 11].forEach((m) => {
        expect(getDaysInMonth(2026, m)).toBe(30);
      });
    });

    it('trả về 28 ngày cho tháng 2 năm thường và 29 ngày cho tháng 2 năm nhuận', () => {
      expect(getDaysInMonth(2026, 2)).toBe(28);
      expect(getDaysInMonth(2024, 2)).toBe(29);
      expect(getDaysInMonth(2000, 2)).toBe(29);
      expect(getDaysInMonth(1900, 2)).toBe(28);
    });

    it('ném lỗi BadRequestException nếu tháng < 1 hoặc > 12', () => {
      expect(() => getDaysInMonth(2026, 0)).toThrow(BadRequestException);
      expect(() => getDaysInMonth(2026, 13)).toThrow(BadRequestException);
    });
  });

  describe('getDateTimeParts & createDateFromParts (timezone roundtrip)', () => {
    it('trích xuất đúng các thành phần ngày giờ tại Asia/Ho_Chi_Minh', () => {
      const date = new Date('2026-10-27T01:00:00.000Z'); // 08:00 AM VN (UTC+7)
      const parts = getDateTimeParts(date, 'Asia/Ho_Chi_Minh');

      expect(parts.year).toBe(2026);
      expect(parts.month).toBe(10);
      expect(parts.day).toBe(27);
      expect(parts.hour).toBe(8);
      expect(parts.minute).toBe(0);
      expect(parts.second).toBe(0);
    });

    it('tạo lại Date từ parts giữ nguyên giá trị giờ địa phương', () => {
      const parts = {
        year: 2026,
        month: 10,
        day: 27,
        hour: 14,
        minute: 30,
        second: 0,
        millisecond: 0,
      };
      const date = createDateFromParts(parts, 'Asia/Ho_Chi_Minh');
      const retrieved = getDateTimeParts(date, 'Asia/Ho_Chi_Minh');

      expect(retrieved.year).toBe(2026);
      expect(retrieved.month).toBe(10);
      expect(retrieved.day).toBe(27);
      expect(retrieved.hour).toBe(14);
      expect(retrieved.minute).toBe(30);
    });

    it('ném lỗi BadRequestException nếu timezone không hợp lệ', () => {
      const date = new Date();
      expect(() => getDateTimeParts(date, 'Invalid/Timezone_Name')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('calculateMonthEndCutoff (Quy tắc cộng một tháng)', () => {
    it('cộng một tháng cho ngày 27/10/2026 thành mốc 27/11/2026 cùng giờ', () => {
      const start = new Date('2026-10-27T01:00:00.000Z'); // 08:00 VN
      const cutoff = calculateMonthEndCutoff(start, 'Asia/Ho_Chi_Minh');
      const parts = getDateTimeParts(cutoff, 'Asia/Ho_Chi_Minh');

      expect(parts.year).toBe(2026);
      expect(parts.month).toBe(11);
      expect(parts.day).toBe(27);
      expect(parts.hour).toBe(8);
      expect(parts.minute).toBe(0);
    });

    it('an toàn khi bắt đầu ngày 31/01 ở năm không nhuận: ngày cuối tháng 2 là 28', () => {
      // 31/01/2026 09:00 VN -> cutoff 28/02/2026 09:00 VN
      const start = createDateFromParts(
        {
          year: 2026,
          month: 1,
          day: 31,
          hour: 9,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );
      const cutoff = calculateMonthEndCutoff(start, 'Asia/Ho_Chi_Minh');
      const parts = getDateTimeParts(cutoff, 'Asia/Ho_Chi_Minh');

      expect(parts.year).toBe(2026);
      expect(parts.month).toBe(2);
      expect(parts.day).toBe(28); // 2026 không nhuận
      expect(parts.hour).toBe(9);
    });

    it('an toàn khi bắt đầu ngày 31/01 ở năm nhuận: ngày cuối tháng 2 là 29', () => {
      // 31/01/2024 09:00 VN -> cutoff 29/02/2024 09:00 VN
      const start = createDateFromParts(
        {
          year: 2024,
          month: 1,
          day: 31,
          hour: 9,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );
      const cutoff = calculateMonthEndCutoff(start, 'Asia/Ho_Chi_Minh');
      const parts = getDateTimeParts(cutoff, 'Asia/Ho_Chi_Minh');

      expect(parts.year).toBe(2024);
      expect(parts.month).toBe(2);
      expect(parts.day).toBe(29); // 2024 là năm nhuận
      expect(parts.hour).toBe(9);
    });

    it('ngày 30/01 cộng 1 tháng ở năm thường cũng thành ngày cuối tháng 2 (28/02)', () => {
      const start = createDateFromParts(
        {
          year: 2026,
          month: 1,
          day: 30,
          hour: 15,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );
      const cutoff = calculateMonthEndCutoff(start, 'Asia/Ho_Chi_Minh');
      const parts = getDateTimeParts(cutoff, 'Asia/Ho_Chi_Minh');

      expect(parts.year).toBe(2026);
      expect(parts.month).toBe(2);
      expect(parts.day).toBe(28);
      expect(parts.hour).toBe(15);
    });

    it('ngày 31/03 sang tháng 4 (30 ngày) thành 30/04', () => {
      const start = createDateFromParts(
        {
          year: 2026,
          month: 3,
          day: 31,
          hour: 10,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );
      const cutoff = calculateMonthEndCutoff(start, 'Asia/Ho_Chi_Minh');
      const parts = getDateTimeParts(cutoff, 'Asia/Ho_Chi_Minh');

      expect(parts.year).toBe(2026);
      expect(parts.month).toBe(4);
      expect(parts.day).toBe(30);
      expect(parts.hour).toBe(10);
    });

    it('ngày 31/12 chuyển năm sang 31/01 năm sau', () => {
      const start = createDateFromParts(
        {
          year: 2026,
          month: 12,
          day: 31,
          hour: 8,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );
      const cutoff = calculateMonthEndCutoff(start, 'Asia/Ho_Chi_Minh');
      const parts = getDateTimeParts(cutoff, 'Asia/Ho_Chi_Minh');

      expect(parts.year).toBe(2027);
      expect(parts.month).toBe(1);
      expect(parts.day).toBe(31);
      expect(parts.hour).toBe(8);
    });

    it('ngày 29/02 năm nhuận cộng một tháng thành 29/03', () => {
      const start = createDateFromParts(
        {
          year: 2024,
          month: 2,
          day: 29,
          hour: 8,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );
      const cutoff = calculateMonthEndCutoff(start, 'Asia/Ho_Chi_Minh');
      const parts = getDateTimeParts(cutoff, 'Asia/Ho_Chi_Minh');

      expect(parts.year).toBe(2024);
      expect(parts.month).toBe(3);
      expect(parts.day).toBe(29);
      expect(parts.hour).toBe(8);
    });
  });

  describe('generateWeeklyMonthlyOccurrences (Tạo chuỗi lịch lặp)', () => {
    it('Tình huống ví dụ đề bài: Bắt đầu thứ Ba 27/10/2026 tạo đúng 5 buổi 27/10, 03/11, 10/11, 17/11, 24/11', () => {
      const startAt = createDateFromParts(
        {
          year: 2026,
          month: 10,
          day: 27,
          hour: 8,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );
      const endAt = createDateFromParts(
        {
          year: 2026,
          month: 10,
          day: 27,
          hour: 10,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );

      const occurrences = generateWeeklyMonthlyOccurrences(
        startAt,
        endAt,
        'Asia/Ho_Chi_Minh',
      );

      // Đúng 5 buổi
      expect(occurrences).toHaveLength(5);

      const expectedDates = [
        { day: 27, month: 10, year: 2026 },
        { day: 3, month: 11, year: 2026 },
        { day: 10, month: 11, year: 2026 },
        { day: 17, month: 11, year: 2026 },
        { day: 24, month: 11, year: 2026 },
      ];

      occurrences.forEach((occ, idx) => {
        const startParts = getDateTimeParts(occ.startAt, 'Asia/Ho_Chi_Minh');
        const endParts = getDateTimeParts(occ.endAt, 'Asia/Ho_Chi_Minh');

        expect(startParts.day).toBe(expectedDates[idx].day);
        expect(startParts.month).toBe(expectedDates[idx].month);
        expect(startParts.year).toBe(expectedDates[idx].year);
        expect(startParts.hour).toBe(8);
        expect(startParts.minute).toBe(0);

        expect(endParts.day).toBe(expectedDates[idx].day);
        expect(endParts.month).toBe(expectedDates[idx].month);
        expect(endParts.year).toBe(expectedDates[idx].year);
        expect(endParts.hour).toBe(10);
        expect(endParts.minute).toBe(0);

        // Thứ trong tuần: thứ Ba (day = 2)
        expect(occ.startAt.getDay()).toBe(startAt.getDay());
        expect(occ.index).toBe(idx);
      });

      // Mốc 27/11/2026 không được bao gồm
      const hasCutoffOrAfter = occurrences.some((occ) => {
        const p = getDateTimeParts(occ.startAt, 'Asia/Ho_Chi_Minh');
        return p.month === 11 && p.day >= 27;
      });
      expect(hasCutoffOrAfter).toBe(false);
    });

    it('Loại trừ mốc kết thúc: trường hợp đúng 4 tuần (tháng 2 năm thường 28 ngày)', () => {
      // Bắt đầu 01/02/2027 (thứ Hai) -> cutoff 01/03/2027
      // 01/02 (ngày 0), 08/02 (ngày 7), 15/02 (ngày 14), 22/02 (ngày 21)
      // 01/03 (ngày 28): 01/03 >= 01/03 -> BỊ LOẠI TRỪ
      const startAt = createDateFromParts(
        {
          year: 2027,
          month: 2,
          day: 1,
          hour: 9,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );
      const endAt = createDateFromParts(
        {
          year: 2027,
          month: 2,
          day: 1,
          hour: 11,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );

      const occurrences = generateWeeklyMonthlyOccurrences(
        startAt,
        endAt,
        'Asia/Ho_Chi_Minh',
      );
      expect(occurrences).toHaveLength(4);

      const days = occurrences.map(
        (o) => getDateTimeParts(o.startAt, 'Asia/Ho_Chi_Minh').day,
      );
      expect(days).toEqual([1, 8, 15, 22]);
    });

    it('Bắt đầu 31/01/2024 (năm nhuận): tạo đúng 5 buổi', () => {
      // 31/01/2024 cutoff là 29/02/2024
      // Các buổi: 31/01, 07/02, 14/02, 21/02, 28/02 (< 29/02)
      const startAt = createDateFromParts(
        {
          year: 2024,
          month: 1,
          day: 31,
          hour: 14,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );
      const endAt = createDateFromParts(
        {
          year: 2024,
          month: 1,
          day: 31,
          hour: 16,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );

      const occurrences = generateWeeklyMonthlyOccurrences(
        startAt,
        endAt,
        'Asia/Ho_Chi_Minh',
      );
      expect(occurrences).toHaveLength(5);

      const days = occurrences.map((o) => {
        const p = getDateTimeParts(o.startAt, 'Asia/Ho_Chi_Minh');
        return `${p.day}/${p.month}`;
      });
      expect(days).toEqual([
        '31/1',
        '7/2',
        '14/2',
        '21/2',
        '28/2',
      ]);
    });

    it('Bắt đầu 31/01/2026 (năm không nhuận): tạo đúng 4 buổi vì cutoff là 28/02', () => {
      // 31/01/2026 cutoff là 28/02/2026
      // Các buổi: 31/01, 07/02, 14/02, 21/02
      // 28/02 >= 28/02 -> BỊ LOẠI TRỪ
      const startAt = createDateFromParts(
        {
          year: 2026,
          month: 1,
          day: 31,
          hour: 14,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );
      const endAt = createDateFromParts(
        {
          year: 2026,
          month: 1,
          day: 31,
          hour: 16,
          minute: 0,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );

      const occurrences = generateWeeklyMonthlyOccurrences(
        startAt,
        endAt,
        'Asia/Ho_Chi_Minh',
      );
      expect(occurrences).toHaveLength(4);

      const days = occurrences.map((o) => {
        const p = getDateTimeParts(o.startAt, 'Asia/Ho_Chi_Minh');
        return `${p.day}/${p.month}`;
      });
      expect(days).toEqual(['31/1', '7/2', '14/2', '21/2']);
    });

    it('Xuyên năm: 31/12/2026 sang tháng 1/2027', () => {
      const startAt = createDateFromParts(
        {
          year: 2026,
          month: 12,
          day: 31,
          hour: 18,
          minute: 30,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );
      const endAt = createDateFromParts(
        {
          year: 2026,
          month: 12,
          day: 31,
          hour: 20,
          minute: 30,
          second: 0,
          millisecond: 0,
        },
        'Asia/Ho_Chi_Minh',
      );

      const occurrences = generateWeeklyMonthlyOccurrences(
        startAt,
        endAt,
        'Asia/Ho_Chi_Minh',
      );

      // 31/12 (thứ 5), 07/01 (thứ 5), 14/01 (thứ 5), 21/01 (thứ 5), 28/01 (thứ 5) < 31/01
      expect(occurrences).toHaveLength(5);
      const dates = occurrences.map((o) => {
        const p = getDateTimeParts(o.startAt, 'Asia/Ho_Chi_Minh');
        return `${p.day}/${p.month}/${p.year}`;
      });
      expect(dates).toEqual([
        '31/12/2026',
        '7/1/2027',
        '14/1/2027',
        '21/1/2027',
        '28/1/2027',
      ]);
    });

    it('Kiểm tra lỗi: thời gian bắt đầu hoặc kết thúc không hợp lệ', () => {
      expect(() =>
        generateWeeklyMonthlyOccurrences(new Date('invalid'), new Date()),
      ).toThrow(BadRequestException);
    });

    it('Kiểm tra lỗi: thời gian bắt đầu >= kết thúc', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 1000);
      expect(() => generateWeeklyMonthlyOccurrences(now, past)).toThrow(
        BadRequestException,
      );
      expect(() => generateWeeklyMonthlyOccurrences(now, now)).toThrow(
        BadRequestException,
      );
    });
  });
});
