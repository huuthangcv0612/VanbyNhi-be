import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  UserRole,
  ClassStatus,
  MemberStatus,
  AssignmentStatus,
  ReviewStatus,
  UploadTargetType,
  AttachmentCleanupStatus,
  UploadSessionStatus,
  NotificationType,
} from '../../generated/prisma/client.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { R2StorageService } from '../storage/r2-storage.service.js';
import { AssignmentRetentionService } from './assignment-retention.service.js';
import type { CreateAssignmentDto } from './dto/create-assignment.dto.js';
import type { UpdateAssignmentDto } from './dto/update-assignment.dto.js';
import type { QueryAssignmentsDto } from './dto/query-assignments.dto.js';
import type { SubmitAssignmentDto } from './dto/submit-assignment.dto.js';
import type { GradeSubmissionDto } from './dto/grade-submission.dto.js';
import type { ReviewSubmissionDto } from './dto/review-submission.dto.js';
import type { QuerySubmissionsDto } from './dto/query-submissions.dto.js';
import type { InitAssignmentUploadDto } from './dto/init-assignment-upload.dto.js';

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly r2StorageService: R2StorageService,
    private readonly assignmentRetentionService: AssignmentRetentionService,
  ) {}

  /**
   * Chuyển đổi attachment sang format an toàn cho JSON (BigInt -> Number)
   */
  private formatAttachment(att: any) {
    if (!att) return null;
    return {
      id: att.id,
      storageKey: att.storageKey,
      originalName: att.originalName,
      mimeType: att.mimeType,
      sizeBytes: att.sizeBytes ? Number(att.sizeBytes) : 0,
      uploadedById: att.uploadedById,
      retentionExpiresAt: att.retentionExpiresAt ?? null,
      isKeepForever: att.isKeepForever ?? false,
      cleanupStatus: att.cleanupStatus ?? AttachmentCleanupStatus.PENDING,
      cleanedAt: att.cleanedAt ?? null,
      createdAt: att.createdAt,
    };
  }

  /**
   * Format danh sách attachments
   */
  private formatAttachments(attachments?: any[]) {
    if (!attachments || !Array.isArray(attachments)) return [];
    return attachments.map((a) => this.formatAttachment(a));
  }

  /**
   * Kiểm tra quyền quản lý lớp của giáo viên hoặc admin
   */
  async validateTeacherOrAdminClassAccess(
    classId: string,
    userId: string,
    role: UserRole,
  ) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        name: true,
        teacherId: true,
        status: true,
      },
    });

    if (!classEntity) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${classId}`);
    }

    if (role !== UserRole.ADMIN && classEntity.teacherId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền quản lý bài tập của lớp học này',
      );
    }

    return classEntity;
  }

  /**
   * Kiểm tra quyền tham gia lớp của học sinh (phải có enrollment ACTIVE)
   */
  async validateStudentClassAccess(classId: string, studentId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        classId,
        studentId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'Bạn không phải là học sinh đang hoạt động (ACTIVE) trong lớp học này',
      );
    }

    return enrollment;
  }

  /**
   * Khởi tạo presigned PUT URL cho upload attachment
   */
  async initUpload(
    userId: string,
    role: UserRole,
    dto: InitAssignmentUploadDto,
  ) {
    // Phân quyền targetType
    if (
      (dto.targetType === UploadTargetType.ASSIGNMENT ||
        dto.targetType === UploadTargetType.REVIEW) &&
      role !== UserRole.ADMIN &&
      role !== UserRole.TEACHER
    ) {
      throw new ForbiddenException(
        'Chỉ giáo viên hoặc admin mới có quyền upload đề bài hoặc bài chữa',
      );
    }

    if (
      dto.targetType === UploadTargetType.SUBMISSION &&
      role !== UserRole.STUDENT
    ) {
      throw new ForbiddenException(
        'Chỉ học sinh mới có quyền upload tệp bài nộp',
      );
    }

    const folderPrefix =
      dto.targetType === UploadTargetType.ASSIGNMENT
        ? 'assignments'
        : dto.targetType === UploadTargetType.SUBMISSION
          ? 'submissions'
          : 'reviews';

    const storageKey = this.r2StorageService.generateStorageKey(
      dto.targetId ? `${folderPrefix}/${dto.targetId}` : folderPrefix,
    );

    const presigned = await this.r2StorageService.createPresignedPutUrl(
      storageKey,
      dto.mimeType,
      dto.sizeBytes,
    );

    const expiresAt = new Date(Date.now() + presigned.expiresInSeconds * 1000);

    const session = await this.prisma.uploadSession.create({
      data: {
        userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        storageKey,
        originalName: dto.originalName.trim(),
        mimeType: dto.mimeType,
        sizeBytes: BigInt(dto.sizeBytes),
        title: dto.originalName.trim(),
        status: UploadSessionStatus.PENDING,
        expiresAt,
      },
    });

    return {
      uploadUrl: presigned.uploadUrl,
      storageKey: presigned.storageKey,
      uploadSessionId: session.id,
      expiresInSeconds: presigned.expiresInSeconds,
      requiredHeaders: presigned.requiredHeaders,
    };
  }

  /**
   * Xác thực và chuyển đổi các upload session sang attachment records
   */
  private async processAndVerifyUploadSessions(
    tx: Prisma.TransactionClient,
    storageKeys: string[],
    targetType: UploadTargetType,
    userId: string,
  ) {
    if (!storageKeys || storageKeys.length === 0) return [];

    const sessions = await tx.uploadSession.findMany({
      where: {
        storageKey: { in: storageKeys },
      },
    });

    if (sessions.length !== storageKeys.length) {
      throw new BadRequestException(
        'Một hoặc nhiều tệp đính kèm không tồn tại trong phiên upload hợp lệ',
      );
    }

    const verifiedAttachments: {
      storageKey: string;
      originalName: string;
      mimeType: string;
      sizeBytes: bigint;
      uploadedById: string;
    }[] = [];

    for (const session of sessions) {
      // Chống IDOR: Tệp phải được tạo bởi chính người gọi
      if (session.userId !== userId) {
        throw new ForbiddenException(
          `Bạn không sở hữu tệp đính kèm có mã ${session.storageKey}`,
        );
      }

      if (session.targetType !== targetType) {
        throw new BadRequestException(
          `Tệp đính kèm ${session.storageKey} không phù hợp với mục đích ${targetType}`,
        );
      }

      // Xác minh file có thực sự tồn tại trên R2
      const metadata = await this.r2StorageService.getObjectMetadata(
        session.storageKey,
      );
      if (!metadata) {
        throw new BadRequestException(
          `Tệp ${session.originalName} chưa được upload thành công lên lưu trữ đám mây Cloudflare R2`,
        );
      }

      // Cập nhật trạng thái session
      await tx.uploadSession.update({
        where: { id: session.id },
        data: { status: UploadSessionStatus.COMPLETED },
      });

      verifiedAttachments.push({
        storageKey: session.storageKey,
        originalName: session.originalName,
        mimeType: session.mimeType,
        sizeBytes: session.sizeBytes,
        uploadedById: userId,
      });
    }

    return verifiedAttachments;
  }

  /**
   * Tạo bài tập mới (Giáo viên phụ trách hoặc ADMIN)
   */
  async create(
    userId: string,
    role: UserRole,
    dto: CreateAssignmentDto,
  ) {
    const classEntity = await this.validateTeacherOrAdminClassAccess(
      dto.classId,
      userId,
      role,
    );

    if (classEntity.status !== ClassStatus.ACTIVE) {
      throw new BadRequestException(
        'Chỉ có thể tạo bài tập cho lớp học đang hoạt động (ACTIVE)',
      );
    }

    if (dto.sessionId) {
      const session = await this.prisma.classSession.findUnique({
        where: { id: dto.sessionId },
      });
      if (!session || session.classId !== dto.classId) {
        throw new BadRequestException(
          'Buổi học chỉ định không tồn tại hoặc không thuộc lớp này',
        );
      }
    }

    const maxScore =
      dto.maxScore !== undefined
        ? new Prisma.Decimal(dto.maxScore)
        : new Prisma.Decimal(10.0);
    const allowResubmission = dto.allowResubmission ?? true;
    const maxAttempts = dto.maxAttempts ?? null;

    const assignment = await this.prisma.$transaction(async (tx) => {
      // 1. Tạo assignment
      const created = await tx.assignment.create({
        data: {
          classId: dto.classId,
          sessionId: dto.sessionId,
          title: dto.title.trim(),
          description: dto.description?.trim(),
          fileUrls: dto.fileUrls ?? [],
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          maxScore,
          allowResubmission,
          maxAttempts,
          createdById: userId,
        },
      });

      // 2. Xử lý attachments nếu có
      if (dto.attachmentKeys && dto.attachmentKeys.length > 0) {
        const verifiedAttachments =
          await this.processAndVerifyUploadSessions(
            tx,
            dto.attachmentKeys,
            UploadTargetType.ASSIGNMENT,
            userId,
          );

        const retentionExpiresAt =
          this.assignmentRetentionService.getAssignmentAttachmentExpiration(
            dto.dueDate,
          );

        await tx.assignmentAttachment.createMany({
          data: verifiedAttachments.map((att) => ({
            ...att,
            assignmentId: created.id,
            retentionExpiresAt,
          })),
        });
      }

      return tx.assignment.findUnique({
        where: { id: created.id },
        include: {
          class: { select: { id: true, name: true, classCode: true } },
          createdBy: { select: { id: true, fullName: true, role: true } },
          session: { select: { id: true, title: true, startTime: true } },
          attachments: true,
        },
      });
    });

    if (!assignment) {
      throw new BadRequestException('Không thể tạo bài tập');
    }

    // Thông báo cho tất cả học sinh đang ACTIVE trong lớp
    try {
      const dueStr = assignment.dueDate
        ? ` (Hạn nộp: ${assignment.dueDate.toLocaleDateString('vi-VN')})`
        : '';
      await this.notificationsService.notifyClassStudents(dto.classId, {
        title: `Bài tập mới: ${assignment.title}`,
        content: `Lớp "${assignment.class.name}" có bài tập mới: "${assignment.title}"${dueStr}.`,
        type: NotificationType.ASSIGNMENT,
        referenceId: assignment.id,
      });
    } catch (err) {
      this.logger.warn(`Lỗi gửi thông báo bài tập mới: ${(err as Error).message}`);
    }

    return {
      message: 'Tạo bài tập thành công',
      assignment: {
        ...assignment,
        maxScore: Number(assignment.maxScore),
        attachments: this.formatAttachments(assignment.attachments),
      },
    };
  }

  /**
   * Lấy danh sách bài tập (ADMIN xem tất cả, TEACHER xem lớp mình dạy, STUDENT xem lớp mình học)
   */
  async findAll(
    user: { id: string; role: UserRole },
    query: QueryAssignmentsDto,
  ) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Prisma.AssignmentWhereInput = {};

    if (query.classId) {
      where.classId = query.classId;
    }

    if (query.sessionId) {
      where.sessionId = query.sessionId;
    }

    // Phân quyền phạm vi lớp
    if (user.role === UserRole.TEACHER) {
      const teacherClasses = await this.prisma.class.findMany({
        where: { teacherId: user.id },
        select: { id: true },
      });
      const allowedClassIds = teacherClasses.map((c) => c.id);

      if (query.classId && !allowedClassIds.includes(query.classId)) {
        throw new ForbiddenException(
          'Bạn không có quyền xem bài tập của lớp học này',
        );
      }

      where.classId = query.classId ? query.classId : { in: allowedClassIds };
    } else if (user.role === UserRole.STUDENT) {
      const studentEnrollments = await this.prisma.enrollment.findMany({
        where: {
          studentId: user.id,
          status: MemberStatus.ACTIVE,
        },
        select: { classId: true },
      });

      const allowedClassIds = studentEnrollments.map((e) => e.classId);

      if (query.classId && !allowedClassIds.includes(query.classId)) {
        throw new ForbiddenException(
          'Bạn không tham gia lớp học này hoặc chưa được duyệt',
        );
      }

      where.classId = query.classId ? query.classId : { in: allowedClassIds };
    }

    const [items, total] = await Promise.all([
      this.prisma.assignment.findMany({
        where,
        include: {
          class: { select: { id: true, name: true, classCode: true } },
          createdBy: { select: { id: true, fullName: true } },
          session: { select: { id: true, title: true, startTime: true } },
          attachments: true,
          _count: { select: { submissions: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.assignment.count({ where }),
    ]);

    return {
      items: items.map((a) => ({
        ...a,
        maxScore: Number(a.maxScore),
        attachments: this.formatAttachments(a.attachments),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Xem chi tiết một bài tập
   */
  async findOne(id: string, user: { id: string; role: UserRole }) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: {
        class: {
          select: { id: true, name: true, classCode: true, teacherId: true },
        },
        createdBy: { select: { id: true, fullName: true, role: true } },
        session: { select: { id: true, title: true, startTime: true } },
        attachments: true,
        _count: { select: { submissions: true } },
      },
    });

    if (!assignment) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID ${id}`);
    }

    if (user.role === UserRole.TEACHER && assignment.class.teacherId !== user.id) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập bài tập của lớp này',
      );
    }

    if (user.role === UserRole.STUDENT) {
      await this.validateStudentClassAccess(assignment.classId, user.id);
    }

    return {
      ...assignment,
      maxScore: Number(assignment.maxScore),
      attachments: this.formatAttachments(assignment.attachments),
    };
  }

  /**
   * Cập nhật thông tin bài tập (Giáo viên phụ trách hoặc ADMIN)
   */
  async update(
    id: string,
    userId: string,
    role: UserRole,
    dto: UpdateAssignmentDto,
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { class: { select: { teacherId: true } } },
    });

    if (!assignment) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID ${id}`);
    }

    if (role !== UserRole.ADMIN && assignment.class.teacherId !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa bài tập của lớp này',
      );
    }

    if (dto.sessionId) {
      const session = await this.prisma.classSession.findUnique({
        where: { id: dto.sessionId },
      });
      if (!session || session.classId !== assignment.classId) {
        throw new BadRequestException(
          'Buổi học chỉ định không tồn tại hoặc không thuộc lớp này',
        );
      }
    }

    const data: Prisma.AssignmentUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim();
    if (dto.sessionId !== undefined) {
      data.session = dto.sessionId
        ? { connect: { id: dto.sessionId } }
        : { disconnect: true };
    }
    if (dto.maxScore !== undefined) {
      data.maxScore = new Prisma.Decimal(dto.maxScore);
    }
    if (dto.allowResubmission !== undefined) {
      data.allowResubmission = dto.allowResubmission;
    }
    if (dto.maxAttempts !== undefined) {
      data.maxAttempts = dto.maxAttempts;
    }
    if (dto.fileUrls !== undefined) {
      data.fileUrls = dto.fileUrls;
    }
    if (dto.dueDate !== undefined) {
      data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Nếu dueDate thay đổi, đồng bộ lại retentionExpiresAt cho các tệp chưa bị dọn dẹp
      if (dto.dueDate !== undefined) {
        const newDueDate = dto.dueDate ? new Date(dto.dueDate) : null;
        const newRetentionExpiresAt =
          this.assignmentRetentionService.getAssignmentAttachmentExpiration(
            newDueDate,
          );

        await tx.assignmentAttachment.updateMany({
          where: {
            assignmentId: id,
            isKeepForever: false,
            cleanupStatus: { not: AttachmentCleanupStatus.CLEANED },
          },
          data: { retentionExpiresAt: newRetentionExpiresAt },
        });

        await tx.submissionAttachment.updateMany({
          where: {
            submission: { assignmentId: id },
            isKeepForever: false,
            cleanupStatus: { not: AttachmentCleanupStatus.CLEANED },
          },
          data: { retentionExpiresAt: newRetentionExpiresAt },
        });
      }

      if (dto.attachmentKeys && dto.attachmentKeys.length > 0) {
        const verifiedAttachments =
          await this.processAndVerifyUploadSessions(
            tx,
            dto.attachmentKeys,
            UploadTargetType.ASSIGNMENT,
            userId,
          );

        const effectiveDueDate =
          dto.dueDate !== undefined
            ? dto.dueDate
              ? new Date(dto.dueDate)
              : null
            : assignment.dueDate;

        const retentionExpiresAt =
          this.assignmentRetentionService.getAssignmentAttachmentExpiration(
            effectiveDueDate,
          );

        await tx.assignmentAttachment.createMany({
          data: verifiedAttachments.map((att) => ({
            ...att,
            assignmentId: id,
            retentionExpiresAt,
          })),
        });
      }

      return tx.assignment.update({
        where: { id },
        data,
        include: {
          class: { select: { id: true, name: true } },
          attachments: true,
        },
      });
    });

    return {
      message: 'Cập nhật bài tập thành công',
      assignment: {
        ...updated,
        maxScore: Number(updated.maxScore),
        attachments: this.formatAttachments(updated.attachments),
      },
    };
  }

  /**
   * Xóa bài tập (Giáo viên phụ trách hoặc ADMIN)
   */
  async remove(id: string, userId: string, role: UserRole) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: {
        class: { select: { teacherId: true } },
        attachments: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID ${id}`);
    }

    if (role !== UserRole.ADMIN && assignment.class.teacherId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa bài tập này');
    }

    const submissionCount = await this.prisma.assignmentSubmission.count({
      where: { assignmentId: id },
    });
    if (submissionCount > 0) {
      throw new BadRequestException(
        'Không thể xóa bài tập đã có học sinh nộp bài.',
      );
    }

    // Xóa assignment trong DB
    await this.prisma.assignment.delete({
      where: { id },
    });

    // Dọn dẹp tệp trên R2 nếu có
    if (assignment.attachments && assignment.attachments.length > 0) {
      const keys = assignment.attachments.map((a) => a.storageKey);
      await this.r2StorageService.deleteObjects(keys);
    }

    return { message: 'Xóa bài tập thành công' };
  }

  /**
   * Xem danh sách học sinh đủ điều kiện và trạng thái nộp/chấm bài
   * Thống kê từ enrollment ACTIVE, xác định rõ trạng thái:
   * CHƯA NỘP / ĐÃ NỘP / NỘP MUỘN / CHỜ CHẤM / ĐÃ CHẤM / ĐÃ TRẢ BÀI
   */
  async getEligibleStudents(
    assignmentId: string,
    user: { id: string; role: UserRole },
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: { select: { id: true, teacherId: true, name: true } },
      },
    });

    if (!assignment) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID ${assignmentId}`);
    }

    if (
      user.role === UserRole.TEACHER &&
      assignment.class.teacherId !== user.id
    ) {
      throw new ForbiddenException('Bạn không có quyền xem thống kê lớp này');
    }

    // 1. Lấy tất cả học sinh có enrollment hợp lệ (ACTIVE)
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        classId: assignment.classId,
        status: MemberStatus.ACTIVE,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { student: { fullName: 'asc' } },
    });

    // 2. Lấy tất cả bài nộp của bài tập này
    const submissions = await this.prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        review: true,
      },
      orderBy: [{ studentId: 'asc' }, { attemptNumber: 'desc' }],
    });

    // Nhóm submissions theo studentId
    const submissionsByStudent = new Map<string, typeof submissions>();
    for (const sub of submissions) {
      const list = submissionsByStudent.get(sub.studentId) ?? [];
      list.push(sub);
      submissionsByStudent.set(sub.studentId, list);
    }

    const now = new Date();
    const isPastDue = assignment.dueDate ? now > assignment.dueDate : false;

    const studentList = enrollments.map((enr) => {
      const studentSubs = submissionsByStudent.get(enr.studentId) ?? [];
      const submissionCount = studentSubs.length;
      const latestSubmission = studentSubs.length > 0 ? studentSubs[0] : null;

      let status = 'NOT_SUBMITTED';
      let statusText = isPastDue ? 'Chưa nộp (Quá hạn)' : 'Chưa nộp';
      let isLate = false;
      let score: number | null = null;
      let reviewStatus: ReviewStatus | null = null;

      if (latestSubmission) {
        isLate =
          latestSubmission.isLate ||
          (assignment.dueDate
            ? new Date(latestSubmission.submittedAt) > new Date(assignment.dueDate)
            : false);

        if (latestSubmission.review) {
          reviewStatus = latestSubmission.review.status;
          score = latestSubmission.review.score
            ? Number(latestSubmission.review.score)
            : null;

          if (latestSubmission.review.status === ReviewStatus.RETURNED) {
            status = 'RETURNED';
            statusText = 'Đã trả bài';
          } else {
            status = 'GRADED';
            statusText = 'Đã chấm (Bản nháp)';
          }
        } else {
          if (isLate) {
            status = 'LATE';
            statusText = 'Nộp muộn (Chờ chấm)';
          } else {
            status = 'SUBMITTED';
            statusText = 'Đã nộp (Chờ chấm)';
          }
        }
      }

      return {
        studentId: enr.student.id,
        fullName: enr.student.fullName,
        phone: enr.student.phone,
        email: enr.student.email,
        avatarUrl: enr.student.avatarUrl,
        enrollmentStatus: enr.status,
        submissionCount,
        latestSubmissionId: latestSubmission?.id ?? null,
        attemptNumber: latestSubmission?.attemptNumber ?? null,
        submittedAt: latestSubmission?.submittedAt ?? null,
        status,
        statusText,
        isLate,
        score,
        reviewStatus,
      };
    });

    return {
      assignmentId,
      title: assignment.title,
      dueDate: assignment.dueDate,
      maxScore: Number(assignment.maxScore),
      totalEligible: enrollments.length,
      students: studentList,
    };
  }

  /**
   * Thống kê tổng hợp số liệu bài nộp cho giáo viên
   */
  async getAssignmentStats(
    assignmentId: string,
    user: { id: string; role: UserRole },
  ) {
    const studentData = await this.getEligibleStudents(assignmentId, user);
    const students = studentData.students;

    const totalEligible = students.length;
    let submittedCount = 0;
    let notSubmittedCount = 0;
    let lateCount = 0;
    let pendingReviewCount = 0;
    let draftReviewCount = 0;
    let returnedCount = 0;
    let totalScore = 0;
    let scoredCount = 0;

    for (const s of students) {
      if (s.submissionCount > 0) {
        submittedCount++;
        if (s.isLate) lateCount++;

        if (s.status === 'RETURNED') {
          returnedCount++;
          if (s.score !== null) {
            totalScore += s.score;
            scoredCount++;
          }
        } else if (s.status === 'GRADED') {
          draftReviewCount++;
        } else {
          pendingReviewCount++;
        }
      } else {
        notSubmittedCount++;
      }
    }

    const averageScore =
      scoredCount > 0 ? Math.round((totalScore / scoredCount) * 100) / 100 : null;

    return {
      assignmentId,
      title: studentData.title,
      dueDate: studentData.dueDate,
      maxScore: studentData.maxScore,
      totalEligible,
      submittedCount,
      notSubmittedCount,
      lateCount,
      pendingReviewCount,
      draftReviewCount,
      returnedCount,
      averageScore,
    };
  }

  /**
   * HỌC SINH nộp bài hoặc nộp lại theo chính sách (Transaction an toàn chống race condition)
   */
  async submitAssignment(
    assignmentId: string,
    studentId: string,
    dto: SubmitAssignmentDto,
  ) {
    // 1. Kiểm tra bài tập tồn tại
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        class: { select: { id: true, name: true } },
      },
    });

    if (!assignment) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID ${assignmentId}`);
    }

    // 2. Kiểm tra học sinh có enrollment ACTIVE trong lớp không
    await this.validateStudentClassAccess(assignment.classId, studentId);

    // 3. Kiểm tra nội dung bài nộp (phải có content, fileUrls, attachmentKeys hoặc externalUrl)
    const hasContent = dto.content && dto.content.trim().length > 0;
    const hasFiles = dto.fileUrls && dto.fileUrls.length > 0;
    const hasAttachments = dto.attachmentKeys && dto.attachmentKeys.length > 0;
    const hasUrl = dto.externalUrl && dto.externalUrl.trim().length > 0;

    if (!hasContent && !hasFiles && !hasAttachments && !hasUrl) {
      throw new BadRequestException(
        'Bài nộp phải có ít nhất nội dung văn bản, tệp đính kèm hoặc đường dẫn URL',
      );
    }

    const now = new Date();
    const isLate = assignment.dueDate ? now > assignment.dueDate : false;

    // 4. Thực hiện tạo bài nộp trong transaction
    return this.prisma.$transaction(async (tx) => {
      // Đếm số lần nộp trước đó của học sinh
      const previousSubmissions = await tx.assignmentSubmission.findMany({
        where: { assignmentId, studentId },
        orderBy: { attemptNumber: 'desc' },
      });

      const previousAttempts = previousSubmissions.length;

      // Kiểm tra chính sách nộp lại
      if (previousAttempts > 0 && !assignment.allowResubmission) {
        throw new BadRequestException(
          'Bài tập này không cho phép nộp lại sau khi đã nộp bài',
        );
      }

      if (
        assignment.maxAttempts !== null &&
        previousAttempts >= assignment.maxAttempts
      ) {
        throw new BadRequestException(
          `Bạn đã đạt giới hạn số lần nộp bài tối đa (${assignment.maxAttempts} lần)`,
        );
      }

      const nextAttempt =
        previousSubmissions.length > 0
          ? previousSubmissions[0].attemptNumber + 1
          : 1;

      // Xác thực attachments nếu có
      let verifiedAttachments: any[] = [];
      if (dto.attachmentKeys && dto.attachmentKeys.length > 0) {
        verifiedAttachments = await this.processAndVerifyUploadSessions(
          tx,
          dto.attachmentKeys,
          UploadTargetType.SUBMISSION,
          studentId,
        );
      }

      try {
        const submission = await tx.assignmentSubmission.create({
          data: {
            assignmentId,
            studentId,
            attemptNumber: nextAttempt,
            content: dto.content?.trim(),
            fileUrls: dto.fileUrls ?? [],
            externalUrl: dto.externalUrl?.trim(),
            isLate,
            status: AssignmentStatus.SUBMITTED,
          },
        });

        const retentionExpiresAt =
          this.assignmentRetentionService.getSubmissionAttachmentExpiration(
            assignment.dueDate,
          );

        // Lưu attachments
        if (verifiedAttachments.length > 0) {
          await tx.submissionAttachment.createMany({
            data: verifiedAttachments.map((att) => ({
              ...att,
              submissionId: submission.id,
              retentionExpiresAt,
            })),
          });
        }

        const fullSubmission = await tx.assignmentSubmission.findUnique({
          where: { id: submission.id },
          include: {
            student: { select: { id: true, fullName: true, phone: true } },
            assignment: { select: { id: true, title: true, dueDate: true } },
            attachments: true,
          },
        });

        const lateNotice = isLate ? ' (Nộp muộn)' : '';
        return {
          message: `Nộp bài thành công (Lần nộp thứ ${nextAttempt})${lateNotice}`,
          submission: {
            ...fullSubmission,
            score: fullSubmission?.score ? Number(fullSubmission.score) : null,
            attachments: this.formatAttachments(fullSubmission?.attachments),
          },
        };
      } catch (error: any) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException(
            'Lượt nộp bài đang được xử lý đồng thời, vui lòng thử lại',
          );
        }
        throw error;
      }
    });
  }

  /**
   * Lấy danh sách các bài nộp của một bài tập
   * TEACHER/ADMIN xem tất cả, STUDENT chỉ xem các lần nộp của chính mình
   */
  async getSubmissionsByAssignment(
    assignmentId: string,
    user: { id: string; role: UserRole },
    query?: QuerySubmissionsDto,
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { class: { select: { teacherId: true } } },
    });

    if (!assignment) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID ${assignmentId}`);
    }

    if (
      user.role === UserRole.TEACHER &&
      assignment.class.teacherId !== user.id
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền xem bài nộp của lớp học này',
      );
    }

    const where: Prisma.AssignmentSubmissionWhereInput = { assignmentId };

    if (user.role === UserRole.STUDENT) {
      // Học sinh CHỈ ĐƯỢC XEM BÀI NỘP CỦA CHÍNH MÌNH (Chống IDOR)
      where.studentId = user.id;
    } else if (query?.studentId) {
      where.studentId = query.studentId;
    }

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.isLate !== undefined) {
      where.isLate = query.isLate;
    }

    const submissions = await this.prisma.assignmentSubmission.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            avatarUrl: true,
          },
        },
        attachments: true,
        review: {
          include: {
            reviewer: { select: { id: true, fullName: true } },
            attachments: true,
          },
        },
        gradedBy: { select: { id: true, fullName: true } },
      },
      orderBy: [{ studentId: 'asc' }, { attemptNumber: 'desc' }],
    });

    // Xử lý bảo mật kết quả:
    // NẾU LÀ HỌC SINH: Không bao giờ để lộ Review ở trạng thái DRAFT!
    return submissions.map((sub) => {
      const isStudent = user.role === UserRole.STUDENT;
      const isDraftReview = sub.review?.status === ReviewStatus.DRAFT;

      let reviewPayload: any = null;
      let displayScore = sub.score ? Number(sub.score) : null;
      let displayFeedback = sub.feedback;

      if (sub.review) {
        if (isStudent && isDraftReview) {
          // Ẩn review draft khỏi học sinh
          reviewPayload = null;
          displayScore = null;
          displayFeedback = null;
        } else {
          reviewPayload = {
            id: sub.review.id,
            score: sub.review.score ? Number(sub.review.score) : null,
            feedback: sub.review.feedback,
            status: sub.review.status,
            returnedAt: sub.review.returnedAt,
            reviewer: sub.review.reviewer,
            attachments: this.formatAttachments(sub.review.attachments),
          };
        }
      }

      return {
        id: sub.id,
        assignmentId: sub.assignmentId,
        studentId: sub.studentId,
        attemptNumber: sub.attemptNumber,
        content: sub.content,
        fileUrls: sub.fileUrls,
        externalUrl: sub.externalUrl,
        isLate: sub.isLate,
        submittedAt: sub.submittedAt,
        status:
          isStudent && isDraftReview ? AssignmentStatus.SUBMITTED : sub.status,
        score: displayScore,
        feedback: displayFeedback,
        student: sub.student,
        attachments: this.formatAttachments(sub.attachments),
        review: reviewPayload,
      };
    });
  }

  /**
   * Xem chi tiết một bài nộp
   * TEACHER/ADMIN xem đầy đủ. STUDENT chỉ xem bài của mình và CHỈ xem review đã RETURNED.
   */
  async getSubmission(
    submissionId: string,
    user: { id: string; role: UserRole },
  ) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            maxScore: true,
            classId: true,
            class: { select: { teacherId: true, name: true } },
          },
        },
        student: {
          select: { id: true, fullName: true, phone: true, avatarUrl: true },
        },
        attachments: true,
        review: {
          include: {
            reviewer: { select: { id: true, fullName: true } },
            attachments: true,
          },
        },
        gradedBy: { select: { id: true, fullName: true } },
      },
    });

    if (!submission) {
      throw new NotFoundException(`Không tìm thấy bài nộp với ID ${submissionId}`);
    }

    // Kiểm tra quyền truy cập (Chống IDOR)
    if (user.role === UserRole.STUDENT && submission.studentId !== user.id) {
      throw new ForbiddenException(
        'Bạn không có quyền xem bài nộp của học sinh khác',
      );
    }

    if (
      user.role === UserRole.TEACHER &&
      submission.assignment.class.teacherId !== user.id
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền xem bài nộp của lớp học này',
      );
    }

    const isStudent = user.role === UserRole.STUDENT;
    const isDraftReview = submission.review?.status === ReviewStatus.DRAFT;

    let reviewPayload: any = null;
    let displayScore = submission.score ? Number(submission.score) : null;
    let displayFeedback = submission.feedback;

    if (submission.review) {
      if (isStudent && isDraftReview) {
        reviewPayload = null;
        displayScore = null;
        displayFeedback = null;
      } else {
        reviewPayload = {
          id: submission.review.id,
          score: submission.review.score ? Number(submission.review.score) : null,
          feedback: submission.review.feedback,
          status: submission.review.status,
          returnedAt: submission.review.returnedAt,
          reviewer: submission.review.reviewer,
          attachments: this.formatAttachments(submission.review.attachments),
        };
      }
    }

    return {
      id: submission.id,
      assignmentId: submission.assignmentId,
      studentId: submission.studentId,
      attemptNumber: submission.attemptNumber,
      content: submission.content,
      fileUrls: submission.fileUrls,
      externalUrl: submission.externalUrl,
      isLate: submission.isLate,
      submittedAt: submission.submittedAt,
      status:
        isStudent && isDraftReview
          ? AssignmentStatus.SUBMITTED
          : submission.status,
      score: displayScore,
      feedback: displayFeedback,
      assignment: {
        ...submission.assignment,
        maxScore: Number(submission.assignment.maxScore),
      },
      student: submission.student,
      attachments: this.formatAttachments(submission.attachments),
      review: reviewPayload,
    };
  }

  /**
   * Giáo viên lưu đánh giá (Hỗ trợ lưu DRAFT và RETURN riêng biệt, đính kèm bài chữa)
   */
  async reviewSubmission(
    submissionId: string,
    reviewerId: string,
    role: UserRole,
    dto: ReviewSubmissionDto,
  ) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            maxScore: true,
            classId: true,
            class: { select: { teacherId: true } },
          },
        },
        student: { select: { id: true, fullName: true } },
        review: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(`Không tìm thấy bài nộp với ID ${submissionId}`);
    }

    if (
      role !== UserRole.ADMIN &&
      submission.assignment.class.teacherId !== reviewerId
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền chấm bài cho bài nộp của lớp này',
      );
    }

    const maxScore = Number(submission.assignment.maxScore);

    // Kiểm tra điểm số
    let scoreDecimal: Prisma.Decimal | null = null;
    if (dto.score !== undefined && dto.score !== null) {
      if (dto.score < 0 || dto.score > maxScore) {
        throw new BadRequestException(
          `Điểm số phải nằm trong khoảng từ 0.00 đến thang điểm tối đa (${maxScore})`,
        );
      }
      scoreDecimal = new Prisma.Decimal(dto.score);
    }

    const reviewStatus = dto.status ?? ReviewStatus.DRAFT;

    // Nếu trả bài trực tiếp (RETURNED) thì bắt buộc phải có điểm
    if (reviewStatus === ReviewStatus.RETURNED && scoreDecimal === null) {
      throw new BadRequestException('Vui lòng nhập điểm trước khi trả bài');
    }

    const returnedAt =
      reviewStatus === ReviewStatus.RETURNED ? new Date() : null;

    const result = await this.prisma.$transaction(async (tx) => {
      // Xác thực attachments bài chữa nếu có
      let verifiedAttachments: any[] = [];
      if (dto.attachmentKeys && dto.attachmentKeys.length > 0) {
        verifiedAttachments = await this.processAndVerifyUploadSessions(
          tx,
          dto.attachmentKeys,
          UploadTargetType.REVIEW,
          reviewerId,
        );
      }

      // Tạo hoặc cập nhật review
      let review = await tx.submissionReview.findUnique({
        where: { submissionId },
      });

      if (review) {
        review = await tx.submissionReview.update({
          where: { submissionId },
          data: {
            reviewerId,
            score: scoreDecimal !== null ? scoreDecimal : review.score,
            feedback:
              dto.feedback !== undefined ? dto.feedback?.trim() : review.feedback,
            status: reviewStatus,
            returnedAt: returnedAt ?? review.returnedAt,
          },
        });
      } else {
        review = await tx.submissionReview.create({
          data: {
            submissionId,
            reviewerId,
            score: scoreDecimal,
            feedback: dto.feedback?.trim(),
            status: reviewStatus,
            returnedAt,
          },
        });
      }

      const effectiveReturnedAt =
        reviewStatus === ReviewStatus.RETURNED
          ? returnedAt ?? review.returnedAt
          : null;

      const retentionExpiresAt =
        this.assignmentRetentionService.getReviewAttachmentExpiration(
          reviewStatus,
          effectiveReturnedAt,
        );

      // Lưu attachments bài chữa
      if (verifiedAttachments.length > 0) {
        await tx.reviewAttachment.createMany({
          data: verifiedAttachments.map((att) => ({
            ...att,
            reviewId: review.id,
            retentionExpiresAt,
          })),
        });
      }

      // Nếu chuyển trạng thái sang RETURNED, cập nhật retentionExpiresAt cho các bài chữa cũ chưa dọn dẹp
      if (reviewStatus === ReviewStatus.RETURNED && effectiveReturnedAt) {
        await tx.reviewAttachment.updateMany({
          where: {
            reviewId: review.id,
            isKeepForever: false,
            cleanupStatus: { not: AttachmentCleanupStatus.CLEANED },
          },
          data: { retentionExpiresAt },
        });
      }

      // Cập nhật trạng thái bài nộp tương ứng
      const submissionStatus =
        reviewStatus === ReviewStatus.RETURNED
          ? AssignmentStatus.RETURNED
          : AssignmentStatus.GRADED;

      const updatedSubmission = await tx.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          score: scoreDecimal !== null ? scoreDecimal : submission.score,
          feedback:
            dto.feedback !== undefined
              ? dto.feedback?.trim()
              : submission.feedback,
          gradedById: reviewerId,
          gradedAt: new Date(),
          status: submissionStatus,
        },
        include: {
          review: {
            include: {
              attachments: true,
              reviewer: { select: { id: true, fullName: true } },
            },
          },
        },
      });

      return updatedSubmission;
    });

    // Nếu trả bài ngay, gửi thông báo cho học sinh
    if (reviewStatus === ReviewStatus.RETURNED) {
      try {
        const feedbackStr = dto.feedback ? ` Nhận xét: "${dto.feedback}"` : '';
        await this.notificationsService.createNotification({
          recipientId: submission.student.id,
          title: `Bài tập đã được trả bài: ${submission.assignment.title}`,
          content: `Bài nộp (lần ${submission.attemptNumber}) của bạn cho bài tập "${submission.assignment.title}" đã được trả bài: ${dto.score}/${maxScore} điểm.${feedbackStr}`,
          type: NotificationType.ASSIGNMENT,
          referenceId: submission.id,
        });
      } catch (err) {
        this.logger.warn(`Lỗi gửi thông báo trả bài: ${(err as Error).message}`);
      }
    }

    const actionText =
      reviewStatus === ReviewStatus.RETURNED
        ? 'Đã trả bài cho học sinh'
        : 'Đã lưu bản nháp chấm bài';

    return {
      message: actionText,
      review: {
        id: result.review?.id,
        status: result.review?.status,
        score: result.review?.score ? Number(result.review.score) : null,
        feedback: result.review?.feedback,
        returnedAt: result.review?.returnedAt,
        reviewer: result.review?.reviewer,
        attachments: this.formatAttachments(result.review?.attachments),
      },
    };
  }

  /**
   * Hành động TRẢ BÀI riêng biệt từ bản nháp
   */
  async returnSubmissionReview(
    submissionId: string,
    reviewerId: string,
    role: UserRole,
  ) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            maxScore: true,
            classId: true,
            class: { select: { teacherId: true } },
          },
        },
        student: { select: { id: true, fullName: true } },
        review: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(`Không tìm thấy bài nộp với ID ${submissionId}`);
    }

    if (
      role !== UserRole.ADMIN &&
      submission.assignment.class.teacherId !== reviewerId
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền trả bài cho bài nộp của lớp này',
      );
    }

    if (!submission.review) {
      throw new BadRequestException(
        'Bài nộp chưa có bản đánh giá. Vui lòng chấm bài trước khi trả bài.',
      );
    }

    if (submission.review.score === null) {
      throw new BadRequestException(
        'Bản đánh giá chưa có điểm số. Vui lòng bổ sung điểm trước khi trả bài.',
      );
    }

    const returnedAt = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const review = await tx.submissionReview.update({
        where: { submissionId },
        data: {
          status: ReviewStatus.RETURNED,
          returnedAt,
        },
        include: {
          reviewer: { select: { id: true, fullName: true } },
          attachments: true,
        },
      });

      // Đồng bộ retentionExpiresAt cho các bài chữa thuộc review này
      const retentionExpiresAt =
        this.assignmentRetentionService.getReviewAttachmentExpiration(
          ReviewStatus.RETURNED,
          returnedAt,
        );

      await tx.reviewAttachment.updateMany({
        where: {
          reviewId: review.id,
          isKeepForever: false,
          cleanupStatus: { not: AttachmentCleanupStatus.CLEANED },
        },
        data: { retentionExpiresAt },
      });

      await tx.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          status: AssignmentStatus.RETURNED,
          gradedById: reviewerId,
          gradedAt: returnedAt,
        },
      });

      return review;
    });

    // Gửi thông báo đến học sinh
    try {
      const scoreNum = Number(updated.score);
      const maxScoreNum = Number(submission.assignment.maxScore);
      const feedbackStr = updated.feedback
        ? ` Nhận xét: "${updated.feedback}"`
        : '';

      await this.notificationsService.createNotification({
        recipientId: submission.student.id,
        title: `Bài tập đã được trả bài: ${submission.assignment.title}`,
        content: `Bài nộp (lần ${submission.attemptNumber}) của bạn cho bài tập "${submission.assignment.title}" đã được trả bài: ${scoreNum}/${maxScoreNum} điểm.${feedbackStr}`,
        type: NotificationType.ASSIGNMENT,
        referenceId: submission.id,
      });
    } catch (err) {
      this.logger.warn(`Lỗi gửi thông báo trả bài: ${(err as Error).message}`);
    }

    return {
      message: 'Trả bài thành công. Học sinh đã có thể xem điểm và nhận xét.',
      review: {
        id: updated.id,
        status: updated.status,
        score: Number(updated.score),
        feedback: updated.feedback,
        returnedAt: updated.returnedAt,
        reviewer: updated.reviewer,
        attachments: this.formatAttachments(updated.attachments),
      },
    };
  }

  /**
   * Giữ tương thích với API chấm bài cũ
   */
  async gradeSubmission(
    submissionId: string,
    adminId: string,
    dto: GradeSubmissionDto,
  ) {
    return this.reviewSubmission(submissionId, adminId, UserRole.ADMIN, {
      score: dto.score,
      feedback: dto.feedback,
      status: ReviewStatus.RETURNED,
    });
  }

  /**
   * Lấy URL tải tệp đính kèm an toàn (Assignment prompt, Submission, hoặc Review bài chữa)
   * Kiểm tra nghiêm ngặt phân quyền và tính riêng tư của file
   */
  async getAttachmentDownloadUrl(
    attachmentId: string,
    user: { id: string; role: UserRole },
  ) {
    // 1. Thử tìm trong AssignmentAttachment
    const assignAtt = await this.prisma.assignmentAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        assignment: { select: { classId: true, class: { select: { teacherId: true } } } },
      },
    });

    if (assignAtt) {
      if (assignAtt.cleanupStatus === AttachmentCleanupStatus.CLEANED) {
        throw new BadRequestException(
          'Tệp đính kèm đã hết hạn lưu trữ và được dọn dẹp theo chính sách hệ thống',
        );
      }

      if (
        user.role === UserRole.TEACHER &&
        assignAtt.assignment.class.teacherId !== user.id
      ) {
        throw new ForbiddenException('Bạn không có quyền truy cập tệp đề bài này');
      }

      if (user.role === UserRole.STUDENT) {
        await this.validateStudentClassAccess(
          assignAtt.assignment.classId,
          user.id,
        );
      }

      const presigned = await this.r2StorageService.createPresignedGetUrl(
        assignAtt.storageKey,
        assignAtt.originalName,
      );

      return {
        downloadUrl: presigned.downloadUrl,
        expiresInSeconds: presigned.expiresInSeconds,
        originalName: assignAtt.originalName,
        mimeType: assignAtt.mimeType,
      };
    }

    // 2. Thử tìm trong SubmissionAttachment
    const subAtt = await this.prisma.submissionAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        submission: {
          select: {
            studentId: true,
            assignment: {
              select: { class: { select: { teacherId: true } } },
            },
          },
        },
      },
    });

    if (subAtt) {
      if (subAtt.cleanupStatus === AttachmentCleanupStatus.CLEANED) {
        throw new BadRequestException(
          'Tệp đính kèm đã hết hạn lưu trữ và được dọn dẹp theo chính sách hệ thống',
        );
      }

      if (
        user.role === UserRole.STUDENT &&
        subAtt.submission.studentId !== user.id
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền xem tệp bài nộp của học sinh khác',
        );
      }

      if (
        user.role === UserRole.TEACHER &&
        subAtt.submission.assignment.class.teacherId !== user.id
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền xem tệp bài nộp của lớp học này',
        );
      }

      const presigned = await this.r2StorageService.createPresignedGetUrl(
        subAtt.storageKey,
        subAtt.originalName,
      );

      return {
        downloadUrl: presigned.downloadUrl,
        expiresInSeconds: presigned.expiresInSeconds,
        originalName: subAtt.originalName,
        mimeType: subAtt.mimeType,
      };
    }

    // 3. Thử tìm trong ReviewAttachment
    const reviewAtt = await this.prisma.reviewAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        review: {
          select: {
            status: true,
            submission: {
              select: {
                studentId: true,
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
      if (reviewAtt.cleanupStatus === AttachmentCleanupStatus.CLEANED) {
        throw new BadRequestException(
          'Tệp đính kèm đã hết hạn lưu trữ và được dọn dẹp theo chính sách hệ thống',
        );
      }

      // Học sinh chỉ được xem nếu review đã RETURNED
      if (user.role === UserRole.STUDENT) {
        if (reviewAtt.review.submission.studentId !== user.id) {
          throw new ForbiddenException(
            'Bạn không có quyền xem bài chữa của học sinh khác',
          );
        }
        if (reviewAtt.review.status === ReviewStatus.DRAFT) {
          throw new ForbiddenException(
            'Bài chữa đang ở trạng thái bản nháp, chưa được công khai',
          );
        }
      }

      if (
        user.role === UserRole.TEACHER &&
        reviewAtt.review.submission.assignment.class.teacherId !== user.id
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền xem bài chữa của lớp học này',
        );
      }

      const presigned = await this.r2StorageService.createPresignedGetUrl(
        reviewAtt.storageKey,
        reviewAtt.originalName,
      );

      return {
        downloadUrl: presigned.downloadUrl,
        expiresInSeconds: presigned.expiresInSeconds,
        originalName: reviewAtt.originalName,
        mimeType: reviewAtt.mimeType,
      };
    }

    throw new NotFoundException(
      `Không tìm thấy tệp đính kèm với ID ${attachmentId}`,
    );
  }

  /**
   * Đánh dấu giữ tệp vĩnh viễn (ngoại lệ lưu giữ)
   */
  async toggleAttachmentKeepForever(
    attachmentId: string,
    isKeepForever: boolean,
    user: { id: string; role: UserRole },
  ) {
    return this.assignmentRetentionService.toggleAttachmentKeepForever(
      attachmentId,
      isKeepForever,
      user,
    );
  }
}
