import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  SessionStatus,
  ClassStatus,
  NotificationType,
} from '../../generated/prisma/client.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import type { CreateClassSessionDto } from './dto/create-class-session.dto.js';
import type { UpdateClassSessionDto } from './dto/update-class-session.dto.js';
import type { UpdateSessionStatusDto } from './dto/update-session-status.dto.js';
import type { QuerySessionsDto } from './dto/query-sessions.dto.js';
import type { UpsertLessonRecordDto } from './dto/upsert-lesson-record.dto.js';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * ADMIN tạo buổi học mới cho một lớp học
   */
  async create(classId: string, adminId: string, createDto: CreateClassSessionDto) {
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
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
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

    const startTime = updateDto.startTime ? new Date(updateDto.startTime) : session.startTime;
    const endTime = updateDto.endTime ? new Date(updateDto.endTime) : session.endTime;

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
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
          ],
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
    if (updateDto.description !== undefined) data.description = updateDto.description;
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
      (updateDto.startTime && new Date(updateDto.startTime).getTime() !== session.startTime.getTime()) ||
      (updateDto.endTime && new Date(updateDto.endTime).getTime() !== session.endTime.getTime());

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
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
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
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
    }

    const lessonRecord = await this.prisma.lessonRecord.upsert({
      where: { sessionId },
      create: {
        sessionId,
        content: dto.content,
        homeworkSummary: dto.homeworkSummary,
        teacherNotes: dto.teacherNotes,
      },
      update: {
        content: dto.content,
        homeworkSummary: dto.homeworkSummary,
        teacherNotes: dto.teacherNotes,
      },
    });

    return {
      message: 'Cập nhật nhật ký bài dạy thành công',
      lessonRecord,
    };
  }
}
