import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { R2StorageService } from '../storage/r2-storage.service.js';
import {
  AttachmentCleanupStatus,
  ReviewStatus,
  UserRole,
} from '../../generated/prisma/client.js';

export interface RetentionCleanupResult {
  dryRun: boolean;
  scannedCount: number;
  cleanedCount: number;
  failedCount: number;
  skippedKeepForeverCount: number;
  skippedUnexpiredCount: number;
  errors: { id: string; type: string; error: string }[];
}

export type AttachmentType = 'ASSIGNMENT' | 'SUBMISSION' | 'REVIEW';

@Injectable()
export class AssignmentRetentionService {
  private readonly logger = new Logger(AssignmentRetentionService.name);
  private readonly defaultRetentionDays: number;
  private readonly batchSize: number;
  private readonly maxRetries: number;
  private readonly claimTimeoutMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly r2StorageService: R2StorageService,
  ) {
    this.defaultRetentionDays = Number(
      this.configService.get<number>('ASSIGNMENT_RETENTION_DAYS') ?? 14,
    );
    this.batchSize = Number(
      this.configService.get<number>('ASSIGNMENT_RETENTION_BATCH_SIZE') ?? 50,
    );
    this.maxRetries = Number(
      this.configService.get<number>('ASSIGNMENT_RETENTION_MAX_RETRIES') ?? 3,
    );
    // Timeout cho claim: 10 phút để phục hồi nếu worker trước đó bị crash
    this.claimTimeoutMs = Number(
      this.configService.get<number>('ASSIGNMENT_RETENTION_CLAIM_TIMEOUT_MS') ??
        10 * 60 * 1000,
    );
  }

  /**
   * Tính ngày hết hạn lưu trữ dựa trên ngày mốc
   * Nếu baseDate không tồn tại (null/undefined), trả về null để không tự suy diễn ngày hết hạn
   */
  calculateRetentionExpiresAt(
    baseDate?: Date | null,
    retentionDaysOverride?: number,
  ): Date | null {
    if (!baseDate) return null;
    const days = retentionDaysOverride ?? this.defaultRetentionDays;
    return new Date(new Date(baseDate).getTime() + days * 24 * 60 * 60 * 1000);
  }

  /**
   * Tính ngày hết hạn cho tệp đề bài (phụ thuộc vào dueDate của bài tập)
   */
  getAssignmentAttachmentExpiration(dueDate?: Date | null): Date | null {
    return this.calculateRetentionExpiresAt(dueDate);
  }

  /**
   * Tính ngày hết hạn cho tệp bài nộp học sinh (phụ thuộc vào dueDate của bài tập)
   */
  getSubmissionAttachmentExpiration(dueDate?: Date | null): Date | null {
    return this.calculateRetentionExpiresAt(dueDate);
  }

  /**
   * Tính ngày hết hạn cho tệp bài chữa của giáo viên:
   * Ưu tiên 14 ngày kể từ returnedAt nếu đã trả bài (RETURNED)
   * Nếu còn là DRAFT hoặc chưa có returnedAt, trả về null (không xóa nháp)
   */
  getReviewAttachmentExpiration(
    status: ReviewStatus,
    returnedAt?: Date | null,
  ): Date | null {
    if (status !== ReviewStatus.RETURNED || !returnedAt) {
      return null;
    }
    return this.calculateRetentionExpiresAt(returnedAt);
  }

  /**
   * Tác vụ cron chạy định kỳ dọn dẹp tệp hết hạn (Mặc định 3:00 AM hàng ngày)
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleScheduledCleanup(): Promise<void> {
    this.logger.log('Bắt đầu tác vụ dọn dẹp tệp bài tập/bài nộp/bài chữa hết hạn lưu trữ...');
    const result = await this.runRetentionCleanup({ dryRun: false });
    this.logger.log(
      `Hoàn tất dọn dẹp: Đã quét ${result.scannedCount} tệp, dọn dẹp thành công ${result.cleanedCount} tệp, thất bại ${result.failedCount} tệp.`,
    );
  }

  /**
   * Thực thi dọn dẹp lưu trữ có hỗ trợ chế độ dry-run, batching và chống race condition
   */
  async runRetentionCleanup(options?: {
    dryRun?: boolean;
    batchSize?: number;
  }): Promise<RetentionCleanupResult> {
    const dryRun = options?.dryRun ?? false;
    const limit = options?.batchSize ?? this.batchSize;
    const now = new Date();
    const staleClaimCutoff = new Date(now.getTime() - this.claimTimeoutMs);

    const result: RetentionCleanupResult = {
      dryRun,
      scannedCount: 0,
      cleanedCount: 0,
      failedCount: 0,
      skippedKeepForeverCount: 0,
      skippedUnexpiredCount: 0,
      errors: [],
    };

    // Đếm các tệp được giữ vĩnh viễn (isKeepForever = true) và tệp chưa hết hạn để báo cáo
    const [keepCount, unexpiredCount] = await Promise.all([
      this.countKeepForeverAttachments(),
      this.countUnexpiredAttachments(now),
    ]);
    result.skippedKeepForeverCount = keepCount;
    result.skippedUnexpiredCount = unexpiredCount;

    // 1. Quét và xử lý AssignmentAttachment
    await this.processAttachmentCategory(
      'ASSIGNMENT',
      now,
      staleClaimCutoff,
      limit,
      dryRun,
      result,
    );

    // 2. Quét và xử lý SubmissionAttachment
    await this.processAttachmentCategory(
      'SUBMISSION',
      now,
      staleClaimCutoff,
      limit,
      dryRun,
      result,
    );

    // 3. Quét và xử lý ReviewAttachment
    await this.processAttachmentCategory(
      'REVIEW',
      now,
      staleClaimCutoff,
      limit,
      dryRun,
      result,
    );

    return result;
  }

  /**
   * Xử lý từng danh mục tệp với cơ chế claim an toàn không mở transaction trong lúc gọi R2
   */
  private async processAttachmentCategory(
    category: AttachmentType,
    now: Date,
    staleClaimCutoff: Date,
    limit: number,
    dryRun: boolean,
    result: RetentionCleanupResult,
  ): Promise<void> {
    const delegate = this.getPrismaDelegate(category);

    // Tìm các ứng viên hết hạn
    const candidates = await delegate.findMany({
      where: {
        retentionExpiresAt: {
          not: null,
          lte: now,
        },
        isKeepForever: false,
        cleanupAttempts: { lt: this.maxRetries },
        OR: [
          {
            cleanupStatus: {
              in: [
                AttachmentCleanupStatus.PENDING,
                AttachmentCleanupStatus.FAILED,
              ],
            },
          },
          {
            cleanupStatus: AttachmentCleanupStatus.PROCESSING,
            claimedAt: { lt: staleClaimCutoff },
          },
        ],
      },
      take: limit,
      select: {
        id: true,
        storageKey: true,
        cleanupAttempts: true,
      },
    });

    result.scannedCount += candidates.length;

    for (const item of candidates) {
      if (dryRun) {
        this.logger.log(
          `[Dry-Run] Tệp ${category} ID: ${item.id} (key: ${item.storageKey}) đủ điều kiện dọn dẹp.`,
        );
        result.cleanedCount++;
        continue;
      }

      // Claim item bằng update nguyên tử: chuyển trạng thái sang PROCESSING
      const claimResult = await delegate.updateMany({
        where: {
          id: item.id,
          isKeepForever: false,
          cleanupStatus: {
            in: [
              AttachmentCleanupStatus.PENDING,
              AttachmentCleanupStatus.FAILED,
              AttachmentCleanupStatus.PROCESSING,
            ],
          },
        },
        data: {
          cleanupStatus: AttachmentCleanupStatus.PROCESSING,
          claimedAt: now,
        },
      });

      // Nếu worker khác đã claim trước đó, bỏ qua
      if (claimResult.count === 0) {
        continue;
      }

      // XÓA TRÊN R2 NGOÀI TRANSACTION DATABASE
      try {
        const deleted = await this.r2StorageService.deleteObject(item.storageKey);

        if (!deleted) {
          throw new Error('R2 deleteObject trả về kết quả không thành công');
        }

        // Cập nhật trạng thái CLEANED thành công trong DB
        await delegate.update({
          where: { id: item.id },
          data: {
            cleanupStatus: AttachmentCleanupStatus.CLEANED,
            cleanedAt: new Date(),
            lastCleanupError: null,
          },
        });

        result.cleanedCount++;
        this.logger.log(
          `[Retention Cleanup] Đã dọn dẹp tệp ${category} ID: ${item.id} thành công.`,
        );
      } catch (error: any) {
        const rawMessage = (error as Error)?.message ?? 'Lỗi không xác định';
        const sanitizedError = this.sanitizeErrorMessage(rawMessage);

        await delegate.update({
          where: { id: item.id },
          data: {
            cleanupStatus: AttachmentCleanupStatus.FAILED,
            cleanupAttempts: item.cleanupAttempts + 1,
            lastCleanupError: sanitizedError,
          },
        });

        result.failedCount++;
        result.errors.push({
          id: item.id,
          type: category,
          error: sanitizedError,
        });

        this.logger.warn(
          `[Retention Cleanup] Lỗi khi dọn dẹp tệp ${category} ID: ${item.id} (lần thử ${item.cleanupAttempts + 1}/${this.maxRetries}): ${sanitizedError}`,
        );
      }
    }
  }

  /**
   * Làm sạch thông báo lỗi, loại bỏ secret, token, URL hoặc dữ liệu nhạy cảm trước khi lưu/log
   */
  private sanitizeErrorMessage(msg: string): string {
    if (!msg) return 'Unknown error';
    return msg
      .replace(/https?:\/\/[^\s]+/gi, '[URL_REDACTED]')
      .replace(/AKIA[0-9A-Z]{16}/gi, '[KEY_REDACTED]')
      .replace(/[a-zA-Z0-9_\-.]{40,}/gi, '[SECRET_REDACTED]')
      .slice(0, 500);
  }

  /**
   * Lấy delegate tương ứng cho từng loại attachment
   */
  private getPrismaDelegate(category: AttachmentType): any {
    switch (category) {
      case 'ASSIGNMENT':
        return this.prisma.assignmentAttachment;
      case 'SUBMISSION':
        return this.prisma.submissionAttachment;
      case 'REVIEW':
        return this.prisma.reviewAttachment;
    }
  }

  /**
   * Đếm số lượng tệp được đánh dấu giữ vĩnh viễn (isKeepForever = true)
   */
  private async countKeepForeverAttachments(): Promise<number> {
    const [c1, c2, c3] = await Promise.all([
      this.prisma.assignmentAttachment.count({ where: { isKeepForever: true } }),
      this.prisma.submissionAttachment.count({ where: { isKeepForever: true } }),
      this.prisma.reviewAttachment.count({ where: { isKeepForever: true } }),
    ]);
    return c1 + c2 + c3;
  }

  /**
   * Đếm số lượng tệp chưa tới hạn xóa
   */
  private async countUnexpiredAttachments(now: Date): Promise<number> {
    const [c1, c2, c3] = await Promise.all([
      this.prisma.assignmentAttachment.count({
        where: {
          retentionExpiresAt: { gt: now },
          cleanupStatus: { not: AttachmentCleanupStatus.CLEANED },
        },
      }),
      this.prisma.submissionAttachment.count({
        where: {
          retentionExpiresAt: { gt: now },
          cleanupStatus: { not: AttachmentCleanupStatus.CLEANED },
        },
      }),
      this.prisma.reviewAttachment.count({
        where: {
          retentionExpiresAt: { gt: now },
          cleanupStatus: { not: AttachmentCleanupStatus.CLEANED },
        },
      }),
    ]);
    return c1 + c2 + c3;
  }

  /**
   * Giáo viên/Admin đánh dấu giữ lại tệp vĩnh viễn (ngoại lệ lưu giữ)
   */
  async toggleAttachmentKeepForever(
    attachmentId: string,
    isKeepForever: boolean,
    user: { id: string; role: UserRole },
  ): Promise<{ message: string; isKeepForever: boolean }> {
    // 1. Kiểm tra AssignmentAttachment
    const assignAtt = await this.prisma.assignmentAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        assignment: { select: { class: { select: { teacherId: true } } } },
      },
    });

    if (assignAtt) {
      if (
        user.role !== UserRole.ADMIN &&
        assignAtt.assignment.class.teacherId !== user.id
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền quản lý tệp đính kèm của lớp này',
        );
      }

      await this.prisma.assignmentAttachment.update({
        where: { id: attachmentId },
        data: { isKeepForever },
      });

      return {
        message: isKeepForever
          ? 'Đã đánh dấu lưu giữ tệp vĩnh viễn'
          : 'Đã hủy đánh dấu lưu giữ tệp',
        isKeepForever,
      };
    }

    // 2. Kiểm tra SubmissionAttachment
    const subAtt = await this.prisma.submissionAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        submission: {
          select: {
            assignment: { select: { class: { select: { teacherId: true } } } },
          },
        },
      },
    });

    if (subAtt) {
      if (
        user.role !== UserRole.ADMIN &&
        subAtt.submission.assignment.class.teacherId !== user.id
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền quản lý tệp đính kèm của lớp này',
        );
      }

      await this.prisma.submissionAttachment.update({
        where: { id: attachmentId },
        data: { isKeepForever },
      });

      return {
        message: isKeepForever
          ? 'Đã đánh dấu lưu giữ tệp vĩnh viễn'
          : 'Đã hủy đánh dấu lưu giữ tệp',
        isKeepForever,
      };
    }

    // 3. Kiểm tra ReviewAttachment
    const reviewAtt = await this.prisma.reviewAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        review: {
          select: {
            submission: {
              select: {
                assignment: {
                  select: { class: { select: { teacherId: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (reviewAtt) {
      if (
        user.role !== UserRole.ADMIN &&
        reviewAtt.review.submission.assignment.class.teacherId !== user.id
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền quản lý tệp đính kèm của lớp này',
        );
      }

      await this.prisma.reviewAttachment.update({
        where: { id: attachmentId },
        data: { isKeepForever },
      });

      return {
        message: isKeepForever
          ? 'Đã đánh dấu lưu giữ tệp vĩnh viễn'
          : 'Đã hủy đánh dấu lưu giữ tệp',
        isKeepForever,
      };
    }

    throw new NotFoundException(`Không tìm thấy tệp đính kèm với ID ${attachmentId}`);
  }
}
