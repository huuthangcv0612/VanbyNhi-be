import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  SessionStatus,
  ClassStatus,
  NotificationType,
  UserRole,
  MemberStatus,
  AttendanceStatus,
} from '../../generated/prisma/client.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { MeetAccessService } from './meet-access.service.js';
import type { CreateClassSessionDto } from './dto/create-class-session.dto.js';
import type { UpdateClassSessionDto } from './dto/update-class-session.dto.js';
import type { UpdateSessionStatusDto } from './dto/update-session-status.dto.js';
import type { QuerySessionsDto } from './dto/query-sessions.dto.js';
import type { UpsertLessonRecordDto } from './dto/upsert-lesson-record.dto.js';
import type { QueryStudentClassSessionsDto } from './dto/query-student-class-sessions.dto.js';
import type { StudentCheckInDto } from './dto/student-check-in.dto.js';

@Injectable()
export class SessionsService {
  private readonly meetAccessService: MeetAccessService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    meetAccessService?: MeetAccessService,
  ) {
    this.meetAccessService = meetAccessService ?? new MeetAccessService(prisma);
  }

  /**
   * ADMIN tạo buổi học mới cho một lớp học
   */
  async create(
    classId: string,
    adminId: string,
    createDto: CreateClassSessionDto,
  ) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { teacher: true },
    });

    if (!classEntity) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${classId}`);
    }

    if (classEntity.status !== ClassStatus.ACTIVE) {
      throw new BadRequestException(
        'Chỉ có thể tạo buổi học cho lớp học đang hoạt động (ACTIVE)',
      );
    }

    const startTime = new Date(createDto.startTime);
    const endTime = new Date(createDto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException(
        'Thời gian kết thúc buổi học (endTime) phải sau thời gian bắt đầu (startTime)',
      );
    }

    // Kiểm tra trùng lịch: giáo viên phụ trách lớp này có buổi học nào khác đang diễn ra cùng thời gian không
    // Trùng khi: (startA < endB) && (endA > startB) và trạng thái không phải CANCELLED
    const teacherConflict = await this.prisma.classSession.findFirst({
      where: {
        status: { not: SessionStatus.CANCELLED },
        class: {
          teacherId: classEntity.teacherId,
        },
        AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
      },
      include: {
        class: { select: { name: true } },
      },
    });

    if (teacherConflict) {
      throw new ConflictException(
        `Giáo viên đã có lịch dạy lớp "${teacherConflict.class.name}" trong khoảng thời gian này`,
      );
    }

    const session = await this.prisma.classSession.create({
      data: {
        classId,
        title: createDto.title,
        description: createDto.description,
        startTime,
        endTime,
        meetUrl: createDto.meetUrl,
        status: SessionStatus.SCHEDULED,
        createdById: adminId,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            defaultMeetUrl: true,
          },
        },
      },
    });

    // Thông báo cho tất cả học sinh ACTIVE trong lớp
    try {
      const timeStr = `${startTime.toLocaleDateString('vi-VN')} (${startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`;
      await this.notificationsService.notifyClassStudents(classId, {
        title: `Lịch học mới: ${session.title}`,
        content: `Lớp "${session.class.name}" đã lên lịch buổi học mới: "${session.title}" vào ngày ${timeStr}.`,
        type: NotificationType.SESSION,
        referenceId: session.id,
      });
    } catch {
      // Notification dispatch failure must not fail session creation
    }

    return {
      message: 'Tạo buổi học thành công',
      session: {
        ...session,
        effectiveMeetUrl: session.meetUrl ?? session.class.defaultMeetUrl,
      },
    };
  }

  /**
   * ADMIN lấy danh sách buổi học của một lớp học
   */
  async findByClass(classId: string, query: QuerySessionsDto) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classEntity) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${classId}`);
    }

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: any = { classId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.from || query.to) {
      where.startTime = {};
      if (query.from) {
        where.startTime.gte = new Date(query.from);
      }
      if (query.to) {
        where.startTime.lte = new Date(query.to);
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.classSession.findMany({
        where,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              defaultMeetUrl: true,
            },
          },
          lessonRecord: {
            select: { id: true, createdAt: true, updatedAt: true },
          },
          _count: {
            select: {
              attendances: true,
              materials: true,
              assignments: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.classSession.count({ where }),
    ]);

    const enrichedItems = items.map((session) => ({
      ...session,
      effectiveMeetUrl: session.meetUrl ?? session.class.defaultMeetUrl,
    }));

    return {
      items: enrichedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * ADMIN xem chi tiết một buổi học
   */
  async findOne(id: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            classCode: true,
            defaultMeetUrl: true,
            status: true,
            teacher: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        lessonRecord: true,
        _count: {
          select: {
            attendances: true,
            materials: true,
            assignments: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${id}`);
    }

    return {
      ...session,
      effectiveMeetUrl: session.meetUrl ?? session.class.defaultMeetUrl,
    };
  }

  /**
   * GIÁO VIÊN xem danh sách buổi học của lớp mình dạy (kiểm tra quyền sở hữu)
   */
  async findTeacherClassSessions(
    teacherId: string,
    classId: string,
    query: QuerySessionsDto,
  ) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, teacherId: true },
    });

    if (!classEntity) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${classId}`);
    }

    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền quản lý lớp học này');
    }

    return this.findByClass(classId, query);
  }

  /**
   * GIÁO VIÊN xem chi tiết buổi học của lớp mình dạy (kiểm tra quyền sở hữu)
   */
  async findTeacherSessionDetail(teacherId: string, sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        class: {
          select: {
            id: true,
            teacherId: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(
        `Không tìm thấy buổi học với ID ${sessionId}`,
      );
    }

    if (session.class.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền truy cập buổi học này');
    }

    return this.findOne(sessionId);
  }

  /**
   * ADMIN cập nhật thông tin buổi học
   */
  async update(id: string, updateDto: UpdateClassSessionDto) {
    const session = await this.prisma.classSession.findUnique({
      where: { id },
      include: {
        class: { select: { teacherId: true, defaultMeetUrl: true } },
      },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${id}`);
    }

    const startTime = updateDto.startTime
      ? new Date(updateDto.startTime)
      : session.startTime;
    const endTime = updateDto.endTime
      ? new Date(updateDto.endTime)
      : session.endTime;

    if (endTime <= startTime) {
      throw new BadRequestException(
        'Thời gian kết thúc buổi học (endTime) phải sau thời gian bắt đầu (startTime)',
      );
    }

    // Nếu thay đổi thời gian, kiểm tra trùng lịch giáo viên
    if (updateDto.startTime || updateDto.endTime) {
      const teacherConflict = await this.prisma.classSession.findFirst({
        where: {
          id: { not: id },
          status: { not: SessionStatus.CANCELLED },
          class: {
            teacherId: session.class.teacherId,
          },
          AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
        },
        include: {
          class: { select: { name: true } },
        },
      });

      if (teacherConflict) {
        throw new ConflictException(
          `Giáo viên đã có lịch dạy lớp "${teacherConflict.class.name}" trong khoảng thời gian này`,
        );
      }
    }

    const data: any = {};
    if (updateDto.title !== undefined) data.title = updateDto.title;
    if (updateDto.description !== undefined)
      data.description = updateDto.description;
    if (updateDto.startTime !== undefined) data.startTime = startTime;
    if (updateDto.endTime !== undefined) data.endTime = endTime;
    if (updateDto.meetUrl !== undefined) data.meetUrl = updateDto.meetUrl;

    const updated = await this.prisma.classSession.update({
      where: { id },
      data,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            defaultMeetUrl: true,
          },
        },
      },
    });

    // Nếu có sự thay đổi về thời gian (lịch học), thông báo cho học sinh trong lớp
    const isScheduleChanged =
      (updateDto.startTime &&
        new Date(updateDto.startTime).getTime() !==
          session.startTime.getTime()) ||
      (updateDto.endTime &&
        new Date(updateDto.endTime).getTime() !== session.endTime.getTime());

    if (isScheduleChanged) {
      try {
        const timeStr = `${updated.startTime.toLocaleDateString('vi-VN')} (${updated.startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${updated.endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`;
        await this.notificationsService.notifyClassStudents(updated.classId, {
          title: `Thay đổi lịch học: ${updated.title}`,
          content: `Lịch học của buổi "${updated.title}" (lớp "${updated.class.name}") đã được cập nhật thành: ${timeStr}.`,
          type: NotificationType.SESSION,
          referenceId: updated.id,
        });
      } catch {
        // Notification dispatch failure must not fail session update
      }
    }

    return {
      message: 'Cập nhật buổi học thành công',
      session: {
        ...updated,
        effectiveMeetUrl: updated.meetUrl ?? updated.class.defaultMeetUrl,
      },
    };
  }

  /**
   * ADMIN cập nhật trạng thái buổi học
   */
  async updateStatus(id: string, statusDto: UpdateSessionStatusDto) {
    const session = await this.prisma.classSession.findUnique({
      where: { id },
      include: {
        class: { select: { defaultMeetUrl: true } },
      },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${id}`);
    }

    const updated = await this.prisma.classSession.update({
      where: { id },
      data: { status: statusDto.status },
      include: {
        class: { select: { defaultMeetUrl: true } },
      },
    });

    return {
      message: `Cập nhật trạng thái buổi học thành ${statusDto.status} thành công`,
      session: {
        ...updated,
        effectiveMeetUrl: updated.meetUrl ?? updated.class.defaultMeetUrl,
      },
    };
  }

  /**
   * Xem LessonRecord của buổi học
   */
  async getLessonRecord(sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(
        `Không tìm thấy buổi học với ID ${sessionId}`,
      );
    }

    const lessonRecord = await this.prisma.lessonRecord.findUnique({
      where: { sessionId },
    });

    if (!lessonRecord) {
      throw new NotFoundException(
        `Chưa có nhật ký bài học (LessonRecord) cho buổi học ID ${sessionId}`,
      );
    }

    return lessonRecord;
  }

  /**
   * Tạo hoặc cập nhật LessonRecord (tối đa 1 record cho mỗi session)
   */
  async upsertLessonRecord(sessionId: string, dto: UpsertLessonRecordDto) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(
        `Không tìm thấy buổi học với ID ${sessionId}`,
      );
    }

    const recordData = {
      content: dto.content,
      homeworkSummary: dto.homeworkSummary,
      teacherNotes: dto.teacherNotes,
      coreKnowledge: dto.coreKnowledge,
      incompleteContent: dto.incompleteContent,
      generalRemarks: dto.generalRemarks,
    };

    const lessonRecord = await this.prisma.lessonRecord.upsert({
      where: { sessionId },
      create: {
        sessionId,
        ...recordData,
      },
      update: recordData,
    });

    return {
      message: 'Cập nhật nhật ký bài dạy thành công',
      lessonRecord,
    };
  }

  /**
   * Giáo viên phụ trách hoặc ADMIN bắt đầu buổi học (Chuyển sang IN_PROGRESS / LIVE)
   * Không tự chuyển LIVE chỉ vì đến giờ.
   */
  async startSession(id: string, userId: string, role: UserRole) {
    const session = await this.prisma.classSession.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            teacherId: true,
            defaultMeetUrl: true,
            meetSpace: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${id}`);
    }

    if (role === UserRole.TEACHER && session.class.teacherId !== userId) {
      throw new ForbiddenException(
        'Bạn không phải là giáo viên phụ trách của lớp học này',
      );
    }

    if (session.status === SessionStatus.CANCELLED) {
      throw new BadRequestException(
        'Không thể bắt đầu buổi học đã bị hủy (CANCELLED)',
      );
    }

    if (session.status === SessionStatus.COMPLETED) {
      throw new BadRequestException(
        'Không thể bắt đầu lại buổi học đã kết thúc (COMPLETED)',
      );
    }

    const effectiveMeetUrl =
      session.meetUrl ??
      session.class.meetSpace?.meetingUri ??
      session.class.defaultMeetUrl;

    if (
      session.class.meetSpace &&
      session.class.meetSpace.status !== 'READY' &&
      !effectiveMeetUrl
    ) {
      throw new BadRequestException(
        'Lớp học chưa có phòng Google Meet ở trạng thái sẵn sàng (READY). Vui lòng thử tạo lại phòng trong trang quản lý lớp.',
      );
    }

    if (session.status === SessionStatus.IN_PROGRESS) {
      return {
        message: 'Buổi học đã đang trong trạng thái diễn ra (LIVE)',
        meetingUri: effectiveMeetUrl,
        session: {
          ...session,
          effectiveMeetUrl,
        },
      };
    }

    const updated = await this.prisma.classSession.update({
      where: { id },
      data: { status: SessionStatus.IN_PROGRESS },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            teacherId: true,
            defaultMeetUrl: true,
            meetSpace: true,
          },
        },
      },
    });

    // Thông báo cho học sinh trong lớp buổi học đã bắt đầu LIVE
    try {
      await this.notificationsService.notifyClassStudents(session.classId, {
        title: `Buổi học đang diễn ra: ${updated.title}`,
        content: `Buổi học "${updated.title}" của lớp "${session.class.name}" đã bắt đầu. Hãy tham gia ngay!`,
        type: NotificationType.SESSION,
        referenceId: updated.id,
      });
    } catch {
      // Bỏ qua lỗi gửi thông báo để không gián đoạn chuyển trạng thái
    }

    return {
      message: 'Bắt đầu buổi học thành công (LIVE)',
      meetingUri: effectiveMeetUrl,
      session: {
        ...updated,
        effectiveMeetUrl,
      },
    };
  }

  /**
   * Giáo viên phụ trách hoặc ADMIN kết thúc buổi học (Chuyển sang COMPLETED)
   */
  async endSession(id: string, userId: string, role: UserRole) {
    const session = await this.prisma.classSession.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            teacherId: true,
            defaultMeetUrl: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${id}`);
    }

    if (role === UserRole.TEACHER && session.class.teacherId !== userId) {
      throw new ForbiddenException(
        'Bạn không phải là giáo viên phụ trách của lớp học này',
      );
    }

    if (session.status === SessionStatus.CANCELLED) {
      throw new BadRequestException(
        'Không thể kết thúc buổi học đã bị hủy (CANCELLED)',
      );
    }

    if (session.status === SessionStatus.SCHEDULED) {
      throw new BadRequestException(
        'Không thể kết thúc buổi học chưa được bắt đầu (SCHEDULED)',
      );
    }

    if (session.status === SessionStatus.COMPLETED) {
      return {
        message: 'Buổi học đã được kết thúc trước đó',
        session: {
          ...session,
          effectiveMeetUrl: session.meetUrl ?? session.class.defaultMeetUrl,
        },
      };
    }

    const updated = await this.prisma.classSession.update({
      where: { id },
      data: { status: SessionStatus.COMPLETED },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            teacherId: true,
            defaultMeetUrl: true,
          },
        },
      },
    });

    return {
      message: 'Kết thúc buổi học thành công (COMPLETED)',
      session: {
        ...updated,
        effectiveMeetUrl: updated.meetUrl ?? updated.class.defaultMeetUrl,
      },
    };
  }

  /**
   * HỌC SINH lấy danh sách buổi học của lớp mình đã tham gia (ACTIVE)
   * Không trả Meet URL nếu chưa đủ điều kiện (cửa sổ 15 phút, trạng thái).
   */
  async getStudentClassSessions(
    studentId: string,
    classId: string,
    query: QueryStudentClassSessionsDto,
  ) {
    // 1. Kiểm tra học sinh có là thành viên ACTIVE không
    const membership = await this.prisma.enrollment.findFirst({
      where: {
        classId,
        studentId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Bạn không phải là thành viên đang hoạt động của lớp học này',
      );
    }

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: any = { classId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.from || query.to) {
      where.startTime = {};
      if (query.from) {
        where.startTime.gte = new Date(query.from);
      }
      if (query.to) {
        where.startTime.lte = new Date(query.to);
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.classSession.findMany({
        where,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              defaultMeetUrl: true,
            },
          },
          lessonRecord: {
            select: { id: true, content: true, homeworkSummary: true },
          },
          materials: {
            select: { id: true },
          },
          assignments: {
            select: { id: true },
          },
          attendances: {
            where: { studentId },
            select: {
              id: true,
              status: true,
              checkedInAt: true,
              note: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.classSession.count({ where }),
    ]);

    const now = new Date();
    const formattedItems = items.map((session) => {
      const meetAccess = this.meetAccessService.checkJoinWindow(session, now);

      return {
        id: session.id,
        title: session.title,
        description: session.description,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        canJoinMeet: meetAccess.canJoin,
        // Chỉ trả URL khi đạt điều kiện mở cửa sổ
        meetUrl: meetAccess.canJoin ? meetAccess.meetUrl : null,
        joinWindow: {
          opensAt: meetAccess.opensAt,
          closesAt: meetAccess.closesAt,
          isOpen: meetAccess.canJoin,
          reason: meetAccess.canJoin ? undefined : meetAccess.reason,
        },
        myAttendance: session.attendances[0] ?? null,
        hasLessonRecord: !!session.lessonRecord,
        lessonRecordSummary: session.lessonRecord
          ? {
              homeworkSummary: session.lessonRecord.homeworkSummary,
            }
          : null,
        materialsCount: session.materials.length,
        assignmentsCount: session.assignments.length,
      };
    });

    return {
      items: formattedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * HỌC SINH xem chi tiết một buổi học
   */
  async getStudentSessionDetail(studentId: string, sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            classCode: true,
            defaultMeetUrl: true,
            teacher: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        lessonRecord: true,
        materials: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            fileUrl: true,
            externalUrl: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
            publishedAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        assignments: {
          select: {
            id: true,
            title: true,
            description: true,
            dueDate: true,
            fileUrls: true,
          },
        },
        attendances: {
          where: { studentId },
          select: {
            id: true,
            status: true,
            checkedInAt: true,
            note: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
    }

    // Kiểm tra học sinh có phải thành viên ACTIVE của lớp không
    const membership = await this.prisma.enrollment.findFirst({
      where: {
        classId: session.class.id,
        studentId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Bạn không phải là thành viên đang hoạt động của lớp học này',
      );
    }

    const now = new Date();
    const meetAccess = this.meetAccessService.checkJoinWindow(session, now);

    return {
      id: session.id,
      title: session.title,
      description: session.description,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      class: {
        id: session.class.id,
        name: session.class.name,
        classCode: session.class.classCode,
        teacher: session.class.teacher,
      },
      meetAccess: {
        canJoin: meetAccess.canJoin,
        reason: meetAccess.canJoin ? undefined : meetAccess.reason,
        meetUrl: meetAccess.canJoin ? meetAccess.meetUrl : null,
        opensAt: meetAccess.opensAt,
        closesAt: meetAccess.closesAt,
        isLive: meetAccess.isLive,
      },
      myAttendance: session.attendances[0] ?? null,
      lessonRecord: session.lessonRecord
        ? {
            id: session.lessonRecord.id,
            sessionId: session.lessonRecord.sessionId,
            content: session.lessonRecord.content,
            homeworkSummary: session.lessonRecord.homeworkSummary,
            coreKnowledge: session.lessonRecord.coreKnowledge,
            incompleteContent: session.lessonRecord.incompleteContent,
            generalRemarks: session.lessonRecord.generalRemarks,
            createdAt: session.lessonRecord.createdAt,
            updatedAt: session.lessonRecord.updatedAt,
          }
        : null,
      materials: session.materials,
      assignments: session.assignments,
    };
  }

  /**
   * HỌC SINH lấy link Google Meet (Kiểm tra nghiêm ngặt quyền & cửa sổ 15 phút)
   * Không coi click mở Meet là bằng chứng đã tham dự (không auto điểm danh).
   */
  async getMeetJoinUrl(studentId: string, sessionId: string) {
    const access = await this.meetAccessService.getStudentMeetAccess(
      sessionId,
      studentId,
      new Date(),
    );

    if (!access.canJoin) {
      throw new ForbiddenException(
        access.reason ?? 'Chưa đủ điều kiện tham gia phòng Google Meet',
      );
    }

    return {
      canJoin: true,
      meetUrl: access.meetUrl,
      sessionId: access.sessionId,
      title: access.title,
      startTime: access.startTime,
      endTime: access.endTime,
      status: access.status,
      isLive: access.isLive,
    };
  }

  /**
   * HỌC SINH tự xác nhận điểm danh trong buổi học
   * Điều kiện: Thành viên ACTIVE, buổi học đang LIVE hoặc trong khung giờ học hợp lệ.
   * Ngăn chặn trùng lặp, tính đúng giờ/muộn theo mốc thời gian.
   */
  async studentCheckIn(
    studentId: string,
    sessionId: string,
    dto?: StudentCheckInDto,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const session = await tx.classSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
      }

      if (session.status === SessionStatus.CANCELLED) {
        throw new BadRequestException(
          'Buổi học đã bị hủy (CANCELLED), không thể điểm danh',
        );
      }

      if (session.status === SessionStatus.COMPLETED) {
        throw new BadRequestException(
          'Buổi học đã kết thúc (COMPLETED), không thể tự điểm danh',
        );
      }

      // Kiểm tra thành viên ACTIVE
      const membership = await tx.enrollment.findFirst({
        where: {
          classId: session.classId,
          studentId,
          status: MemberStatus.ACTIVE,
        },
      });

      if (!membership) {
        throw new ForbiddenException(
          'Bạn không phải là thành viên đang hoạt động của lớp học này',
        );
      }

      const now = new Date();
      const startTime = new Date(session.startTime);
      const endTime = new Date(session.endTime);
      const windowStart = new Date(startTime.getTime() - 15 * 60 * 1000); // 15 phút trước giờ bắt đầu

      const isLive = session.status === SessionStatus.IN_PROGRESS;
      const isWithinTimeWindow = now >= windowStart && now <= endTime;

      if (!isLive && !isWithinTimeWindow) {
        if (now < windowStart) {
          throw new BadRequestException(
            'Chưa đến thời gian điểm danh cho buổi học (cửa sổ mở trước 15 phút)',
          );
        } else {
          throw new BadRequestException(
            'Đã quá thời gian kết thúc buổi học, không thể điểm danh',
          );
        }
      }

      // Kiểm tra xem đã có bản ghi điểm danh chưa
      const existing = await tx.attendance.findUnique({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId,
          },
        },
      });

      if (existing) {
        if (
          existing.status === AttendanceStatus.PRESENT ||
          existing.status === AttendanceStatus.LATE
        ) {
          return {
            message: 'Bạn đã hoàn tất điểm danh cho buổi học này',
            alreadyCheckedIn: true,
            attendance: existing,
          };
        }
      }

      // Điểm danh đúng giờ nếu check-in trước hoặc trong vòng 15 phút sau khi buổi học bắt đầu
      const lateThreshold = new Date(startTime.getTime() + 15 * 60 * 1000);
      const calculatedStatus =
        now <= lateThreshold
          ? AttendanceStatus.PRESENT
          : AttendanceStatus.LATE;

      let savedAttendance;
      if (existing) {
        savedAttendance = await tx.attendance.update({
          where: { id: existing.id },
          data: {
            status: calculatedStatus,
            checkedInAt: now,
            note: dto?.note ?? existing.note ?? 'Học sinh tự xác nhận tham dự',
          },
        });

        await tx.attendanceChangeLog.create({
          data: {
            attendanceId: existing.id,
            oldStatus: existing.status,
            newStatus: calculatedStatus,
            changedById: studentId,
            reason: 'Học sinh tự điểm danh',
          },
        });
      } else {
        savedAttendance = await tx.attendance.create({
          data: {
            sessionId,
            studentId,
            status: calculatedStatus,
            checkedInAt: now,
            note: dto?.note ?? 'Học sinh tự điểm danh',
          },
        });
      }

      return {
        message:
          calculatedStatus === AttendanceStatus.PRESENT
            ? 'Điểm danh đúng giờ thành công'
            : 'Điểm danh muộn thành công',
        alreadyCheckedIn: false,
        attendance: savedAttendance,
      };
    });
  }

  /**
   * GIÁO VIÊN cập nhật liên kết Google Meet cho buổi học của lớp mình dạy
   */
  async updateTeacherSessionMeetUrl(
    teacherId: string,
    sessionId: string,
    meetUrl: string,
  ) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: { select: { id: true, teacherId: true, defaultMeetUrl: true } },
      },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
    }

    if (session.class.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không phải là giáo viên phụ trách của lớp học này',
      );
    }

    if (session.status === SessionStatus.CANCELLED) {
      throw new BadRequestException(
        'Không thể cập nhật liên kết Meet cho buổi học đã bị hủy (CANCELLED)',
      );
    }

    if (!this.meetAccessService.isValidMeetUrl(meetUrl)) {
      throw new BadRequestException(
        'Đường dẫn Google Meet không hợp lệ (yêu cầu https://meet.google.com/...)',
      );
    }

    const updated = await this.prisma.classSession.update({
      where: { id: sessionId },
      data: { meetUrl: meetUrl.trim() },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            defaultMeetUrl: true,
          },
        },
      },
    });

    return {
      message: 'Cập nhật liên kết Google Meet thành công',
      session: {
        ...updated,
        effectiveMeetUrl: updated.meetUrl ?? updated.class.defaultMeetUrl,
      },
    };
  }

  /**
   * GIÁO VIÊN lấy liên kết Google Meet để mở trong tab mới
   */
  async getTeacherMeetAccess(teacherId: string, sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            teacherId: true,
            defaultMeetUrl: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
    }

    if (session.class.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không phải là giáo viên phụ trách của lớp học này',
      );
    }

    const effectiveMeetUrl =
      session.meetUrl?.trim() || session.class.defaultMeetUrl?.trim() || null;
    const isValid = this.meetAccessService.isValidMeetUrl(effectiveMeetUrl);

    return {
      sessionId: session.id,
      title: session.title,
      classId: session.classId,
      className: session.class.name,
      status: session.status,
      startTime: session.startTime,
      endTime: session.endTime,
      isLive: session.status === SessionStatus.IN_PROGRESS,
      canJoin: isValid && session.status !== SessionStatus.CANCELLED,
      meetUrl: isValid ? effectiveMeetUrl : null,
      effectiveMeetUrl: isValid ? effectiveMeetUrl : null,
      hasValidMeetUrl: isValid,
    };
  }

  /**
   * GIÁO VIÊN xem nhật ký bài học (LessonRecord) của buổi học
   */
  async getTeacherLessonRecord(teacherId: string, sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: { select: { teacherId: true } },
      },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
    }

    if (session.class.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không phải là giáo viên phụ trách của buổi học này',
      );
    }

    const lessonRecord = await this.prisma.lessonRecord.findUnique({
      where: { sessionId },
    });

    if (!lessonRecord) {
      throw new NotFoundException(
        `Chưa có nhật ký bài học cho buổi học ID ${sessionId}`,
      );
    }

    return lessonRecord;
  }

  /**
   * GIÁO VIÊN tạo hoặc cập nhật nhật ký bài học (LessonRecord)
   */
  async upsertTeacherLessonRecord(
    teacherId: string,
    sessionId: string,
    dto: UpsertLessonRecordDto,
  ) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: { select: { teacherId: true } },
      },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
    }

    if (session.class.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không phải là giáo viên phụ trách của buổi học này',
      );
    }

    const recordData = {
      content: dto.content,
      homeworkSummary: dto.homeworkSummary,
      teacherNotes: dto.teacherNotes,
      coreKnowledge: dto.coreKnowledge,
      incompleteContent: dto.incompleteContent,
      generalRemarks: dto.generalRemarks,
    };

    const lessonRecord = await this.prisma.lessonRecord.upsert({
      where: { sessionId },
      create: {
        sessionId,
        ...recordData,
      },
      update: recordData,
    });

    return {
      message: 'Cập nhật nhật ký bài dạy thành công',
      lessonRecord,
    };
  }
}

