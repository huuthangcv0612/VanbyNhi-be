import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  UserRole,
  ClassStatus,
  MemberStatus,
  AssignmentStatus,
  NotificationType,
} from '../../generated/prisma/client.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import type { CreateAssignmentDto } from './dto/create-assignment.dto.js';
import type { UpdateAssignmentDto } from './dto/update-assignment.dto.js';
import type { QueryAssignmentsDto } from './dto/query-assignments.dto.js';
import type { SubmitAssignmentDto } from './dto/submit-assignment.dto.js';
import type { GradeSubmissionDto } from './dto/grade-submission.dto.js';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * ADMIN tạo bài tập mới cho lớp
   */
  async create(adminId: string, dto: CreateAssignmentDto) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });

    if (!classEntity) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${dto.classId}`);
    }

    if (classEntity.status !== ClassStatus.ACTIVE) {
      throw new BadRequestException('Chỉ có thể tạo bài tập cho lớp học đang hoạt động (ACTIVE)');
    }

    if (dto.sessionId) {
      const session = await this.prisma.classSession.findUnique({
        where: { id: dto.sessionId },
      });
      if (!session || session.classId !== dto.classId) {
        throw new BadRequestException('Buổi học chỉ định không tồn tại hoặc không thuộc lớp này');
      }
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        classId: dto.classId,
        sessionId: dto.sessionId,
        title: dto.title,
        description: dto.description,
        fileUrls: dto.fileUrls ?? [],
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        createdById: adminId,
      },
      include: {
        class: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
      },
    });

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
    } catch {
      // Notification dispatch failure must not fail assignment creation
    }

    return {
      message: 'Tạo bài tập thành công',
      assignment,
    };
  }

  /**
   * Lấy danh sách bài tập (ADMIN xem tất cả, STUDENT chỉ xem bài thuộc lớp mình đang theo học)
   */
  async findAll(user: { id: string; role: UserRole }, query: QueryAssignmentsDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.classId) {
      where.classId = query.classId;
    }

    if (query.sessionId) {
      where.sessionId = query.sessionId;
    }

    // Nếu là STUDENT, chỉ cho phép xem bài tập của các lớp mà học sinh có enrollment (ACTIVE)
    if (user.role === UserRole.STUDENT) {
      const studentEnrollments = await this.prisma.enrollment.findMany({
        where: {
          studentId: user.id,
          status: MemberStatus.ACTIVE,
        },
        select: { classId: true },
      });

      const allowedClassIds = studentEnrollments.map((e) => e.classId);

      if (query.classId && !allowedClassIds.includes(query.classId)) {
        throw new ForbiddenException('Bạn không tham gia lớp học này');
      }

      where.classId = { in: allowedClassIds };
    }

    const [items, total] = await Promise.all([
      this.prisma.assignment.findMany({
        where,
        include: {
          class: { select: { id: true, name: true, classCode: true } },
          createdBy: { select: { id: true, fullName: true } },
          _count: { select: { submissions: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.assignment.count({ where }),
    ]);

    return {
      items,
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
        class: { select: { id: true, name: true, classCode: true } },
        createdBy: { select: { id: true, fullName: true } },
        session: { select: { id: true, title: true, startTime: true } },
        _count: { select: { submissions: true } },
      },
    });

    if (!assignment) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID ${id}`);
    }

    if (user.role === UserRole.STUDENT) {
      const isEnrolled = await this.prisma.enrollment.findFirst({
        where: {
          classId: assignment.classId,
          studentId: user.id,
          status: MemberStatus.ACTIVE,
        },
      });

      if (!isEnrolled) {
        throw new ForbiddenException('Bạn không có quyền truy cập bài tập của lớp này');
      }
    }

    return assignment;
  }

  /**
   * ADMIN cập nhật thông tin bài tập
   */
  async update(id: string, dto: UpdateAssignmentDto) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID ${id}`);
    }

    if (dto.sessionId) {
      const session = await this.prisma.classSession.findUnique({
        where: { id: dto.sessionId },
      });
      if (!session || session.classId !== assignment.classId) {
        throw new BadRequestException('Buổi học chỉ định không tồn tại hoặc không thuộc lớp này');
      }
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.sessionId !== undefined) data.sessionId = dto.sessionId;
    if (dto.fileUrls !== undefined) data.fileUrls = dto.fileUrls;
    if (dto.dueDate !== undefined) {
      data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    const updated = await this.prisma.assignment.update({
      where: { id },
      data,
      include: {
        class: { select: { id: true, name: true } },
      },
    });

    return {
      message: 'Cập nhật bài tập thành công',
      assignment: updated,
    };
  }

  /**
   * HỌC SINH nộp bài tập (hỗ trợ nộp lại, tự động tính attemptNumber trong transaction)
   */
  async submitAssignment(
    assignmentId: string,
    studentId: string,
    dto: SubmitAssignmentDto,
  ) {
    // 1. Kiểm tra bài tập tồn tại
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID ${assignmentId}`);
    }

    // 2. Kiểm tra quyền của học sinh trong lớp (phải có enrollment ACTIVE)
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        classId: assignment.classId,
        studentId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('Bạn không tham gia lớp học có bài tập này');
    }

    // 3. Kiểm tra hạn nộp bài (dueDate) nếu có
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      throw new BadRequestException(
        `Đã quá hạn nộp bài (${assignment.dueDate.toISOString()}). Không thể nộp bài thêm.`,
      );
    }

    // Kiểm tra có ít nhất 1 nội dung nộp (content, fileUrls, hoặc externalUrl)
    const hasContent = dto.content && dto.content.trim().length > 0;
    const hasFiles = dto.fileUrls && dto.fileUrls.length > 0;
    const hasUrl = dto.externalUrl && dto.externalUrl.trim().length > 0;

    if (!hasContent && !hasFiles && !hasUrl) {
      throw new BadRequestException('Bài nộp phải có ít nhất nội dung văn bản, tệp đính kèm hoặc đường dẫn URL');
    }

    // 4. Thực hiện tạo submission trong Transaction an toàn với attemptNumber tự tăng
    return this.prisma.$transaction(async (tx) => {
      // Tìm lần nộp gần nhất của học sinh cho bài tập này
      const lastSubmission = await tx.assignmentSubmission.findFirst({
        where: {
          assignmentId,
          studentId,
        },
        orderBy: { attemptNumber: 'desc' },
        select: { attemptNumber: true },
      });

      const nextAttempt = (lastSubmission?.attemptNumber ?? 0) + 1;

      try {
        const submission = await tx.assignmentSubmission.create({
          data: {
            assignmentId,
            studentId,
            attemptNumber: nextAttempt,
            content: dto.content,
            fileUrls: dto.fileUrls ?? [],
            externalUrl: dto.externalUrl,
            status: AssignmentStatus.SUBMITTED,
          },
          include: {
            assignment: { select: { id: true, title: true } },
            student: { select: { id: true, fullName: true } },
          },
        });

        return {
          message: `Nộp bài thành công (Lần nộp thứ ${nextAttempt})`,
          submission,
        };
      } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new ConflictException(
            'Đang có một lượt nộp bài khác được ghi nhận cùng thời điểm, vui lòng thử lại',
          );
        }
        throw error;
      }
    });
  }

  /**
   * Xem danh sách các bài nộp của một bài tập (ADMIN xem tất cả, STUDENT chỉ xem bài của mình)
   */
  async getSubmissionsByAssignment(
    assignmentId: string,
    user: { id: string; role: UserRole },
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException(`Không tìm thấy bài tập với ID ${assignmentId}`);
    }

    const where: any = { assignmentId };

    if (user.role === UserRole.STUDENT) {
      where.studentId = user.id;
    }

    return this.prisma.assignmentSubmission.findMany({
      where,
      include: {
        student: { select: { id: true, fullName: true, phone: true } },
        gradedBy: { select: { id: true, fullName: true } },
      },
      orderBy: [
        { studentId: 'asc' },
        { attemptNumber: 'desc' },
      ],
    });
  }

  /**
   * Xem chi tiết một bài nộp (ADMIN xem tất cả, STUDENT chỉ xem bài của chính mình)
   */
  async getSubmission(submissionId: string, user: { id: string; role: UserRole }) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: { select: { id: true, title: true, dueDate: true, classId: true } },
        student: { select: { id: true, fullName: true, phone: true } },
        gradedBy: { select: { id: true, fullName: true } },
      },
    });

    if (!submission) {
      throw new NotFoundException(`Không tìm thấy bài nộp với ID ${submissionId}`);
    }

    if (user.role === UserRole.STUDENT && submission.studentId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền xem bài nộp của học sinh khác');
    }

    return submission;
  }

  /**
   * ADMIN chấm điểm bài nộp (Thang điểm 0 - 10)
   */
  async gradeSubmission(
    submissionId: string,
    adminId: string,
    dto: GradeSubmissionDto,
  ) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException(`Không tìm thấy bài nộp với ID ${submissionId}`);
    }

    const scoreDecimal = new Prisma.Decimal(dto.score);
    if (scoreDecimal.lt(0) || scoreDecimal.gt(10)) {
      throw new BadRequestException('Điểm số phải nằm trong khoảng từ 0.00 đến 10.00');
    }

    const updated = await this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: scoreDecimal,
        feedback: dto.feedback,
        gradedById: adminId,
        gradedAt: new Date(),
        status: dto.status ?? AssignmentStatus.GRADED,
      },
      include: {
        student: { select: { id: true, fullName: true } },
        assignment: { select: { id: true, title: true } },
        gradedBy: { select: { id: true, fullName: true } },
      },
    });

    // Thông báo cho học sinh sở hữu bài nộp
    try {
      const feedbackStr = dto.feedback ? ` Nhận xét: "${dto.feedback}"` : '';
      await this.notificationsService.createNotification({
        recipientId: updated.student.id,
        title: `Bài tập đã được chấm điểm: ${updated.assignment.title}`,
        content: `Bài nộp (lần ${submission.attemptNumber}) của bạn cho bài tập "${updated.assignment.title}" đã được chấm: ${scoreDecimal.toNumber()}/10 điểm.${feedbackStr}`,
        type: NotificationType.ASSIGNMENT,
        referenceId: updated.id,
      });
    } catch {
      // Notification dispatch failure must not fail grading
    }

    return {
      message: 'Chấm điểm bài nộp thành công',
      submission: updated,
    };
  }
}
