import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import ExcelJS from 'exceljs';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AttendanceStatus,
} from '../../generated/prisma/client.js';
import type { ExportAttendanceDto } from './dto/export-attendance.dto.js';

const STATUS_VN: Record<string, string> = {
  [AttendanceStatus.PRESENT]: 'Có mặt',
  [AttendanceStatus.LATE]: 'Đi muộn',
  [AttendanceStatus.EXCUSED_ABSENT]: 'Vắng có phép',
  [AttendanceStatus.UNEXCUSED_ABSENT]: 'Vắng không phép',
  [AttendanceStatus.NOT_MARKED]: 'Chưa điểm danh',
  [AttendanceStatus.ABSENT]: 'Vắng mặt',
};

@Injectable()
export class AttendanceExportService {
  constructor(private readonly prisma: PrismaService) {}

  private formatDateVN(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  }

  private formatDateTimeVN(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d);
  }

  /**
   * Xuất chi tiết điểm danh theo lớp, tháng hoặc khoảng ngày
   */
  async exportDetailExcel(
    classId: string,
    query: ExportAttendanceDto,
    res: Response,
  ) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { teacher: { select: { fullName: true } } },
    });

    if (!classEntity) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${classId}`);
    }

    // Xác định khoảng thời gian
    let startDate: Date;
    let endDate: Date;

    if (query.year && query.month) {
      startDate = new Date(query.year, query.month - 1, 1, 0, 0, 0);
      endDate = new Date(query.year, query.month, 0, 23, 59, 59, 999);
    } else if (query.startDate && query.endDate) {
      startDate = new Date(query.startDate);
      endDate = new Date(query.endDate);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Khoảng ngày không hợp lệ');
      }
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Mặc định 30 ngày gần nhất
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    // Giới hạn khoảng thời gian xuất tối đa 90 ngày để tránh quá tải
    const diffDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays > 92) {
      throw new BadRequestException(
        'Khoảng thời gian xuất chi tiết tối đa là 90 ngày',
      );
    }

    // Lấy danh sách buổi học trong khoảng thời gian
    const sessions = await this.prisma.classSession.findMany({
      where: {
        classId,
        startTime: { gte: startDate, lte: endDate },
      },
      include: {
        attendances: {
          include: {
            student: {
              select: { id: true, fullName: true, phone: true },
            },
            markedBy: {
              select: { fullName: true },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'VanbyNhi Education';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Chi tiết điểm danh');

    // Tiêu đề báo cáo
    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `BẢNG CHI TIẾT ĐIỂM DANH - LỚP: ${classEntity.name.toUpperCase()}`;
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1F4E79' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    worksheet.mergeCells('A2:L2');
    const subTitleCell = worksheet.getCell('A2');
    subTitleCell.value = `Thời gian: Từ ${this.formatDateVN(startDate)} đến ${this.formatDateVN(endDate)} | Giáo viên: ${classEntity.teacher.fullName}`;
    subTitleCell.font = { name: 'Arial', size: 11, italic: true };
    subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 20;

    // Header bảng
    const headerRow = worksheet.getRow(4);
    headerRow.values = [
      'STT',
      'Tên lớp',
      'Buổi học',
      'Ngày học',
      'Mã học sinh',
      'Họ và tên',
      'Số điện thoại',
      'Trạng thái',
      'Giờ check-in',
      'Học bù',
      'Ghi chú',
      'Người cập nhật',
      'Thời gian cập nhật',
    ];
    headerRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4E79' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    let rowIndex = 5;
    let stt = 1;

    for (const session of sessions) {
      for (const att of session.attendances) {
        const row = worksheet.getRow(rowIndex);
        row.values = [
          stt++,
          classEntity.name,
          session.title,
          this.formatDateVN(session.startTime),
          att.student.id,
          att.student.fullName,
          att.student.phone,
          STATUS_VN[att.status] || att.status,
          att.checkedInAt ? this.formatDateTimeVN(att.checkedInAt) : '',
          att.isMakeUp ? 'Có' : 'Không',
          att.note || '',
          att.markedBy?.fullName || '',
          this.formatDateTimeVN(att.updatedAt),
        ];

        row.font = { name: 'Arial', size: 10 };
        row.alignment = { vertical: 'middle' };
        row.getCell(1).alignment = { horizontal: 'center' };
        row.getCell(4).alignment = { horizontal: 'center' };
        row.getCell(5).alignment = { horizontal: 'center' };
        row.getCell(7).alignment = { horizontal: 'center' };
        row.getCell(8).alignment = { horizontal: 'center' };
        row.getCell(9).alignment = { horizontal: 'center' };
        row.getCell(10).alignment = { horizontal: 'center' };
        row.getCell(13).alignment = { horizontal: 'center' };

        // Tô màu nhẹ theo trạng thái
        if (att.status === AttendanceStatus.PRESENT) {
          row.getCell(8).font = { name: 'Arial', color: { argb: 'FF2E7D32' }, bold: true };
        } else if (att.status === AttendanceStatus.LATE) {
          row.getCell(8).font = { name: 'Arial', color: { argb: 'FFE65100' }, bold: true };
        } else if (
          att.status === AttendanceStatus.EXCUSED_ABSENT ||
          att.status === AttendanceStatus.UNEXCUSED_ABSENT ||
          att.status === AttendanceStatus.ABSENT
        ) {
          row.getCell(8).font = { name: 'Arial', color: { argb: 'FFC62828' }, bold: true };
        }

        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          };
        });

        rowIndex++;
      }
    }

    // Tự động căn chỉnh độ rộng cột
    worksheet.columns = [
      { width: 6 },  // STT
      { width: 18 }, // Tên lớp
      { width: 22 }, // Buổi học
      { width: 14 }, // Ngày học
      { width: 18 }, // Mã học sinh
      { width: 24 }, // Họ và tên
      { width: 15 }, // Số điện thoại
      { width: 18 }, // Trạng thái
      { width: 20 }, // Giờ check-in
      { width: 10 }, // Học bù
      { width: 25 }, // Ghi chú
      { width: 20 }, // Người cập nhật
      { width: 20 }, // Thời gian cập nhật
    ];

    const fileName = `DiemDanh_ChiTiet_${classEntity.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Xuất bảng tổng hợp tháng theo học sinh
   */
  async exportSummaryExcel(
    classId: string,
    query: ExportAttendanceDto,
    res: Response,
  ) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: { select: { fullName: true } },
        attendanceConfig: true,
      },
    });

    if (!classEntity) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${classId}`);
    }

    const now = new Date();
    const billingYear = query.year ?? now.getFullYear();
    const billingMonth = query.month ?? now.getMonth() + 1;

    const startDate = new Date(billingYear, billingMonth - 1, 1, 0, 0, 0);
    const endDate = new Date(billingYear, billingMonth, 0, 23, 59, 59, 999);

    // Lấy snapshots đã lưu nếu có
    const summaries = await this.prisma.monthlyAttendanceSummary.findMany({
      where: {
        classId,
        billingYear,
        billingMonth,
      },
      include: {
        student: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { student: { fullName: 'asc' } },
    });

    const summaryMap = new Map<string, (typeof summaries)[0]>();
    for (const s of summaries) {
      summaryMap.set(s.studentId, s);
    }

    // Lấy danh sách thành viên lớp trong tháng đó
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        classId,
        joinedAt: { lte: endDate },
      },
      include: {
        student: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { student: { fullName: 'asc' } },
    });

    // Lấy danh sách buổi học trong tháng
    const sessions = await this.prisma.classSession.findMany({
      where: {
        classId,
        startTime: { gte: startDate, lte: endDate },
      },
      include: {
        attendances: true,
      },
    });

    const config = classEntity.attendanceConfig ?? {
      chargePresent: true,
      chargeLate: true,
      chargeExcusedAbsent: false,
      chargeUnexcusedAbsent: false,
    };

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'VanbyNhi Education';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(`TongHop_T${billingMonth}_${billingYear}`);

    // Tiêu đề báo cáo
    worksheet.mergeCells('A1:M1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `BẢNG TỔNG HỢP ĐIỂM DANH & HỌC PHÍ THÁNG ${billingMonth}/${billingYear}`;
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1F4E79' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    worksheet.mergeCells('A2:M2');
    const subTitleCell = worksheet.getCell('A2');
    subTitleCell.value = `Lớp: ${classEntity.name} | Giáo viên: ${classEntity.teacher.fullName} | Học phí chuẩn: ${Number(classEntity.monthlyTuition).toLocaleString('vi-VN')} đ`;
    subTitleCell.font = { name: 'Arial', size: 11, italic: true };
    subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 20;

    // Header
    const headerRow = worksheet.getRow(4);
    headerRow.values = [
      'STT',
      'Mã học sinh',
      'Họ và tên',
      'Số điện thoại',
      'Có mặt',
      'Đi muộn',
      'Vắng có phép',
      'Vắng không phép',
      'Chưa đánh dấu',
      'Tổng số buổi',
      'Số buổi tính phí',
      'Học phí dự kiến (VNĐ)',
      'Trạng thái chốt kỳ',
    ];
    headerRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4E79' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    let rowIndex = 5;
    let stt = 1;

    for (const enr of enrollments) {
      const snap = summaryMap.get(enr.studentId);

      let presentCount = 0;
      let lateCount = 0;
      let excusedCount = 0;
      let unexcusedCount = 0;
      let notMarkedCount = 0;
      let totalSessions = sessions.length;
      let chargeableSessions = 0;
      let isClosed = false;

      if (snap) {
        presentCount = snap.presentCount;
        lateCount = snap.lateCount;
        excusedCount = snap.excusedAbsentCount;
        unexcusedCount = snap.unexcusedAbsentCount;
        notMarkedCount = snap.notMarkedCount;
        totalSessions = snap.totalSessions;
        chargeableSessions = snap.chargeableSessions;
        isClosed = snap.isClosed;
      } else {
        for (const s of sessions) {
          const att = s.attendances.find((a) => a.studentId === enr.studentId);
          if (!att || att.status === AttendanceStatus.NOT_MARKED) {
            notMarkedCount++;
          } else if (att.status === AttendanceStatus.PRESENT) {
            presentCount++;
          } else if (att.status === AttendanceStatus.LATE) {
            lateCount++;
          } else if (att.status === AttendanceStatus.EXCUSED_ABSENT) {
            excusedCount++;
          } else if (
            att.status === AttendanceStatus.UNEXCUSED_ABSENT ||
            att.status === AttendanceStatus.ABSENT
          ) {
            unexcusedCount++;
          }
        }

        if (config.chargePresent) chargeableSessions += presentCount;
        if (config.chargeLate) chargeableSessions += lateCount;
        if (config.chargeExcusedAbsent) chargeableSessions += excusedCount;
        if (config.chargeUnexcusedAbsent) chargeableSessions += unexcusedCount;
      }

      const effectiveTuition =
        enr.tuitionOverride ?? classEntity.monthlyTuition;

      const row = worksheet.getRow(rowIndex);
      row.values = [
        stt++,
        enr.student.id,
        enr.student.fullName,
        enr.student.phone,
        presentCount,
        lateCount,
        excusedCount,
        unexcusedCount,
        notMarkedCount,
        totalSessions,
        chargeableSessions,
        effectiveTuition ? Number(effectiveTuition).toLocaleString('vi-VN') : '0',
        isClosed ? 'ĐÃ CHỐT' : 'CHƯA CHỐT',
      ];

      row.font = { name: 'Arial', size: 10 };
      row.alignment = { vertical: 'middle' };
      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(2).alignment = { horizontal: 'center' };
      row.getCell(4).alignment = { horizontal: 'center' };
      row.getCell(5).alignment = { horizontal: 'center' };
      row.getCell(6).alignment = { horizontal: 'center' };
      row.getCell(7).alignment = { horizontal: 'center' };
      row.getCell(8).alignment = { horizontal: 'center' };
      row.getCell(9).alignment = { horizontal: 'center' };
      row.getCell(10).alignment = { horizontal: 'center' };
      row.getCell(11).alignment = { horizontal: 'center' };
      row.getCell(12).alignment = { horizontal: 'right' };
      row.getCell(13).alignment = { horizontal: 'center' };

      if (isClosed) {
        row.getCell(13).font = { name: 'Arial', color: { argb: 'FF2E7D32' }, bold: true };
      } else {
        row.getCell(13).font = { name: 'Arial', color: { argb: 'FFE65100' }, italic: true };
      }

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        };
      });

      rowIndex++;
    }

    worksheet.columns = [
      { width: 6 },  // STT
      { width: 18 }, // Mã HS
      { width: 24 }, // Họ tên
      { width: 15 }, // SĐT
      { width: 12 }, // Có mặt
      { width: 12 }, // Đi muộn
      { width: 14 }, // Vắng phép
      { width: 16 }, // Vắng không phép
      { width: 15 }, // Chưa đánh dấu
      { width: 14 }, // Tổng số buổi
      { width: 16 }, // Số buổi tính phí
      { width: 20 }, // Học phí
      { width: 16 }, // Trạng thái chốt
    ];

    const fileName = `TongHop_DiemDanh_${classEntity.name.replace(/[^a-zA-Z0-9]/g, '_')}_T${billingMonth}_${billingYear}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
