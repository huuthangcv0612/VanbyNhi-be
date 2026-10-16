import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { CorrectionRequestStatus } from '../../generated/prisma/client.js';

export interface CleanupResult {
  scannedSessions: number;
  purgedAttendances: number;
  skippedUnclosedMonth: number;
  skippedPendingRequests: number;
  skippedWithinRetention: number;
  errors: string[];
}

@Injectable()
export class AttendanceCleanupService {
  private readonly logger = new Logger(AttendanceCleanupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Tác vụ dọn dẹp dữ liệu điểm danh chi tiết quá hạn (> 60 ngày hoặc theo cấu hình)
   * Chạy tự động lúc 2:00 sáng hàng ngày
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleScheduledCleanup() {
    this.logger.log('Bắt đầu tác vụ dọn dẹp dữ liệu điểm danh quá hạn...');
    const result = await this.runCleanupTask();
    this.logger.log(
      `Hoàn tất tác vụ dọn dẹp: Đã quét ${result.scannedSessions} buổi học, xóa ${result.purgedAttendances} bản ghi chi tiết, bỏ qua ${result.skippedUnclosedMonth} do chưa chốt kỳ, bỏ qua ${result.skippedPendingRequests} do có yêu cầu điều chỉnh đang chờ xử lý.`,
    );
  }

  /**
   * Phương thức thực thi dọn dẹp an toàn có thể gọi tự động hoặc thủ công
   */
  async runCleanupTask(defaultRetentionDaysOverride?: number): Promise<CleanupResult> {
    const globalDays =
      defaultRetentionDaysOverride ??
      this.configService.get<number>('ATTENDANCE_RETENTION_DAYS') ??
      60;

    const result: CleanupResult = {
      scannedSessions: 0,
      purgedAttendances: 0,
      skippedUnclosedMonth: 0,
      skippedPendingRequests: 0,
      skippedWithinRetention: 0,
      errors: [],
    };

    try {
      const now = new Date();
      // Tìm các buổi học đã kết thúc hơn 30 ngày (để kiểm tra xem có vượt quá retention của lớp không)
      const potentialSessions = await this.prisma.classSession.findMany({
        where: {
          endTime: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        },
        include: {
          class: {
            include: {
              attendanceConfig: true,
            },
          },
          attendances: {
            select: {
              id: true,
              correctionRequests: {
                select: { id: true, status: true },
              },
              changeLogs: {
                select: { id: true },
              },
            },
          },
        },
      });

      result.scannedSessions = potentialSessions.length;

      for (const session of potentialSessions) {
        const classRetention =
          session.class.attendanceConfig?.retentionDays ?? globalDays;
        const sessionCutoff = new Date(
          now.getTime() - classRetention * 24 * 60 * 60 * 1000,
        );

        // 1. Kiểm tra thời hạn lưu trữ của buổi học
        if (session.endTime > sessionCutoff) {
          result.skippedWithinRetention++;
          continue;
        }

        const sessionDate = new Date(session.startTime);
        const billingYear = sessionDate.getFullYear();
        const billingMonth = sessionDate.getMonth() + 1;

        // 2. Kiểm tra kỳ học phí / bảng tổng hợp của tháng đó đã được chốt hay chưa
        // Nếu lớp học chưa chốt kỳ điểm danh/học phí tháng này -> TUYỆT ĐỐI KHÔNG XÓA
        const closedSummaryCount =
          await this.prisma.monthlyAttendanceSummary.count({
            where: {
              classId: session.classId,
              billingYear,
              billingMonth,
              isClosed: true,
            },
          });

        if (closedSummaryCount === 0) {
          result.skippedUnclosedMonth++;
          this.logger.debug(
            `Buổi học ${session.id} (lớp ${session.classId}) chưa được chốt kỳ tháng ${billingMonth}/${billingYear}. Bỏ qua dọn dẹp.`,
          );
          continue;
        }

        // 3. Kiểm tra xem có yêu cầu điều chỉnh (AttendanceCorrectionRequest) nào đang PENDING không
        const hasPendingRequest = session.attendances.some((att) =>
          att.correctionRequests.some(
            (cr) => cr.status === CorrectionRequestStatus.PENDING,
          ),
        );

        if (hasPendingRequest) {
          result.skippedPendingRequests++;
          this.logger.debug(
            `Buổi học ${session.id} còn yêu cầu điều chỉnh PENDING. Giữ lại để đối soát.`,
          );
          continue;
        }

        // 4. Lọc các bản ghi điểm danh an toàn để dọn dẹp:
        // Các bản ghi không có changeLog hoặc không có khiếu nại
        // Để bảo toàn tính toàn vẹn audit, ta chỉ xóa các attendance không có relation restrict
        // Hoặc xóa an toàn trong transaction
        const safeAttendanceIds = session.attendances
          .filter((att) => att.changeLogs.length === 0 && att.correctionRequests.length === 0)
          .map((att) => att.id);

        if (safeAttendanceIds.length > 0) {
          const deleteRes = await this.prisma.attendance.deleteMany({
            where: { id: { in: safeAttendanceIds } },
          });
          result.purgedAttendances += deleteRes.count;
        }
      }
    } catch (err: any) {
      this.logger.error('Lỗi khi thực hiện dọn dẹp dữ liệu điểm danh:', err);
      result.errors.push(err.message || String(err));
    }

    return result;
  }
}
