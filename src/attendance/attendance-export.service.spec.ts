import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AttendanceExportService } from './attendance-export.service.js';
import { AttendanceStatus } from '../../generated/prisma/client.js';

describe('AttendanceExportService (Xuất báo cáo Excel & Tiếng Việt Unicode)', () => {
  let service: AttendanceExportService;
  let prismaMock: any;
  let resMock: any;

  beforeEach(() => {
    prismaMock = {
      class: {
        findUnique: vi.fn(),
      },
      classSession: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      enrollment: {
        findMany: vi.fn(),
      },
      monthlyAttendanceSummary: {
        findMany: vi.fn(),
      },
    };

    resMock = {
      setHeader: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
      on: vi.fn(),
      once: vi.fn(),
      emit: vi.fn(),
    };

    service = new AttendanceExportService(prismaMock);
  });

  it('ném NotFoundException nếu lớp học không tồn tại khi xuất chi tiết', async () => {
    prismaMock.class.findUnique.mockResolvedValue(null);

    await expect(
      service.exportDetailExcel('c999', {}, resMock),
    ).rejects.toThrow(NotFoundException);
  });

  it('chặn xuất chi tiết nếu khoảng thời gian vượt quá 90 ngày', async () => {
    prismaMock.class.findUnique.mockResolvedValue({
      id: 'c1',
      name: 'Lớp 12A',
      teacher: { fullName: 'Cô Vân' },
    });

    await expect(
      service.exportDetailExcel(
        'c1',
        {
          startDate: '2026-01-01',
          endDate: '2026-06-01', // > 150 ngày
        },
        resMock,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('xuất Excel chi tiết thành công với header và mime-type chuẩn', async () => {
    prismaMock.class.findUnique.mockResolvedValue({
      id: 'c1',
      name: 'Lớp Luyện Thi THPT',
      teacher: { fullName: 'Thầy Hùng' },
    });

    prismaMock.classSession.findMany.mockResolvedValue([
      {
        id: 's1',
        title: 'Buổi 1: Hàm số',
        startTime: new Date('2026-10-01T08:00:00Z'),
        endTime: new Date('2026-10-01T10:00:00Z'),
        attendances: [
          {
            id: 'att1',
            status: AttendanceStatus.PRESENT,
            checkedInAt: new Date('2026-10-01T08:02:00Z'),
            isMakeUp: false,
            note: 'Đến đúng giờ',
            student: { id: 'stu1', fullName: 'Nguyễn Văn An', phone: '0912345678' },
            markedBy: { fullName: 'Thầy Hùng' },
            updatedAt: new Date('2026-10-01T08:05:00Z'),
          },
        ],
      },
    ]);

    await service.exportDetailExcel(
      'c1',
      { year: 2026, month: 10 },
      resMock,
    );

    expect(resMock.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(resMock.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      expect.stringContaining('attachment; filename='),
    );
    expect(resMock.end).toHaveBeenCalled();
  });

  it('xuất Excel bảng tổng hợp tháng thành công', async () => {
    prismaMock.class.findUnique.mockResolvedValue({
      id: 'c1',
      name: 'Lớp Tiếng Anh Giao Tiếp',
      monthlyTuition: 1500000,
      teacher: { fullName: 'Cô Nhi' },
      attendanceConfig: {
        chargePresent: true,
        chargeLate: true,
        chargeExcusedAbsent: false,
        chargeUnexcusedAbsent: false,
      },
    });

    prismaMock.monthlyAttendanceSummary.findMany.mockResolvedValue([]);
    prismaMock.enrollment.findMany.mockResolvedValue([
      {
        studentId: 'stu1',
        tuitionOverride: null,
        student: { id: 'stu1', fullName: 'Trần Thị Bích', phone: '0987654321' },
      },
    ]);

    prismaMock.classSession.findMany.mockResolvedValue([
      {
        id: 's1',
        attendances: [{ studentId: 'stu1', status: AttendanceStatus.PRESENT }],
      },
      {
        id: 's2',
        attendances: [{ studentId: 'stu1', status: AttendanceStatus.LATE }],
      },
    ]);

    await service.exportSummaryExcel(
      'c1',
      { year: 2026, month: 10 },
      resMock,
    );

    expect(resMock.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(resMock.end).toHaveBeenCalled();
  });

  describe('exportSessionAttendanceExcel (Xuất Excel một buổi học cụ thể)', () => {
    it('ném NotFoundException nếu buổi học không tồn tại', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue(null);

      await expect(
        service.exportSessionAttendanceExcel('s999', resMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('xuất Excel thành công cho buổi học với danh sách học sinh và thống kê', async () => {
      prismaMock.classSession.findUnique.mockResolvedValue({
        id: 's1',
        title: 'Buổi 1: Ôn tập Văn học hiện thực',
        startTime: new Date('2026-10-15T08:00:00Z'),
        endTime: new Date('2026-10-15T10:00:00Z'),
        classId: 'c1',
        class: {
          id: 'c1',
          name: 'Lớp Chuyên Văn 12',
          classCode: 'VAN12',
          teacher: { fullName: 'Cô Vân' },
        },
        attendances: [
          {
            id: 'att1',
            studentId: 'stu1',
            status: AttendanceStatus.PRESENT,
            checkedInAt: new Date('2026-10-15T08:05:00Z'),
            isMakeUp: false,
            note: 'Phát biểu sôi nổi',
            student: { id: 'stu1', fullName: 'Lê Văn An', phone: '0901234567' },
            markedBy: { fullName: 'Cô Vân' },
            updatedAt: new Date('2026-10-15T08:10:00Z'),
          },
        ],
      });

      prismaMock.enrollment.findMany.mockResolvedValue([
        {
          studentId: 'stu1',
          student: { id: 'stu1', fullName: 'Lê Văn An', phone: '0901234567' },
        },
        {
          studentId: 'stu2',
          student: { id: 'stu2', fullName: 'Trần Thị Bình', phone: '0909876543' },
        },
      ]);

      await service.exportSessionAttendanceExcel('s1', resMock);

      expect(resMock.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(resMock.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('DiemDanh_VAN12_'),
      );
      expect(resMock.end).toHaveBeenCalled();
    });
  });
});

