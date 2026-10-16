import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AttendanceCleanupService } from './attendance-cleanup.service.js';
import { CorrectionRequestStatus } from '../../generated/prisma/client.js';

describe('AttendanceCleanupService (Chính sách lưu trữ 60 ngày & dọn dẹp an toàn)', () => {
  let service: AttendanceCleanupService;
  let prismaMock: any;
  let configMock: any;

  beforeEach(() => {
    prismaMock = {
      classSession: {
        findMany: vi.fn(),
      },
      monthlyAttendanceSummary: {
        count: vi.fn(),
      },
      attendance: {
        deleteMany: vi.fn(),
      },
    };

    configMock = {
      get: vi.fn((key: string) => {
        if (key === 'ATTENDANCE_RETENTION_DAYS') return 60;
        return null;
      }),
    };

    service = new AttendanceCleanupService(prismaMock, configMock);
  });

  it('xóa an toàn bản ghi điểm danh quá 60 ngày khi kỳ học phí đã chốt và không có khiếu nại', async () => {
    const oldDate = new Date(Date.now() - 70 * 24 * 60 * 60 * 1000);

    prismaMock.classSession.findMany.mockResolvedValue([
      {
        id: 's_old',
        classId: 'c1',
        startTime: oldDate,
        endTime: oldDate,
        class: {
          attendanceConfig: { retentionDays: 60 },
        },
        attendances: [
          { id: 'att1', correctionRequests: [], changeLogs: [] },
          { id: 'att2', correctionRequests: [], changeLogs: [] },
        ],
      },
    ]);

    // Kỳ tháng đã chốt
    prismaMock.monthlyAttendanceSummary.count.mockResolvedValue(1);
    prismaMock.attendance.deleteMany.mockResolvedValue({ count: 2 });

    const result = await service.runCleanupTask();

    expect(result.scannedSessions).toBe(1);
    expect(result.purgedAttendances).toBe(2);
    expect(result.skippedUnclosedMonth).toBe(0);
    expect(result.skippedPendingRequests).toBe(0);
    expect(prismaMock.attendance.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['att1', 'att2'] } },
    });
  });

  it('bảo vệ dữ liệu: KHÔNG xóa khi kỳ học phí tháng chưa chốt (isClosed !== true)', async () => {
    const oldDate = new Date(Date.now() - 70 * 24 * 60 * 60 * 1000);

    prismaMock.classSession.findMany.mockResolvedValue([
      {
        id: 's_old_unclosed',
        classId: 'c1',
        startTime: oldDate,
        endTime: oldDate,
        class: { attendanceConfig: null },
        attendances: [
          { id: 'att1', correctionRequests: [], changeLogs: [] },
        ],
      },
    ]);

    // Chưa có summary chốt
    prismaMock.monthlyAttendanceSummary.count.mockResolvedValue(0);

    const result = await service.runCleanupTask();

    expect(result.scannedSessions).toBe(1);
    expect(result.purgedAttendances).toBe(0);
    expect(result.skippedUnclosedMonth).toBe(1);
    expect(prismaMock.attendance.deleteMany).not.toHaveBeenCalled();
  });

  it('bảo vệ dữ liệu: KHÔNG xóa khi còn yêu cầu điều chỉnh đang PENDING', async () => {
    const oldDate = new Date(Date.now() - 70 * 24 * 60 * 60 * 1000);

    prismaMock.classSession.findMany.mockResolvedValue([
      {
        id: 's_old_dispute',
        classId: 'c1',
        startTime: oldDate,
        endTime: oldDate,
        class: { attendanceConfig: null },
        attendances: [
          {
            id: 'att1',
            correctionRequests: [{ id: 'cr1', status: CorrectionRequestStatus.PENDING }],
            changeLogs: [],
          },
        ],
      },
    ]);

    prismaMock.monthlyAttendanceSummary.count.mockResolvedValue(1);

    const result = await service.runCleanupTask();

    expect(result.scannedSessions).toBe(1);
    expect(result.purgedAttendances).toBe(0);
    expect(result.skippedPendingRequests).toBe(1);
    expect(prismaMock.attendance.deleteMany).not.toHaveBeenCalled();
  });

  it('bỏ qua buổi học còn trong thời hạn lưu trữ (<= 60 ngày)', async () => {
    const recentDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);

    prismaMock.classSession.findMany.mockResolvedValue([
      {
        id: 's_recent',
        classId: 'c1',
        startTime: recentDate,
        endTime: recentDate,
        class: { attendanceConfig: { retentionDays: 60 } },
        attendances: [{ id: 'att1', correctionRequests: [], changeLogs: [] }],
      },
    ]);

    const result = await service.runCleanupTask();

    expect(result.skippedWithinRetention).toBe(1);
    expect(prismaMock.attendance.deleteMany).not.toHaveBeenCalled();
  });
});
