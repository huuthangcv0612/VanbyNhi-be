import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  UserRole,
  CalendarNotificationStatus,
  MemberStatus,
} from '../../generated/prisma/client.js';
import type { QueryCalendarEventsDto } from './dto/query-calendar-events.dto.js';
import type { CreateCalendarEventDto } from './dto/create-calendar-event.dto.js';
import type { UpdateCalendarEventDto } from './dto/update-calendar-event.dto.js';
import type { CreateCalendarLabelDto } from './dto/create-calendar-label.dto.js';
import type { UpdateCalendarLabelDto } from './dto/update-calendar-label.dto.js';
import type { AddCalendarParticipantsDto } from './dto/add-calendar-participants.dto.js';
import {
  ScheduleRecurrence,
  generateWeeklyMonthlyOccurrences,
  type ScheduleOccurrence,
} from '../schedules/utils/recurrence.util.js';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // TEACHER EVENTS
  // ==========================================

  /**
   * Giáo viên xem danh sách ca dạy theo khoảng thời gian (tuần / tháng)
   */
  async getTeacherEvents(teacherId: string, query: QueryCalendarEventsDto) {
    if (query.from && query.to) {
      const fromDate = new Date(query.from);
      const toDate = new Date(query.to);
      if (fromDate > toDate) {
        throw new BadRequestException('Tham số "from" không được lớn hơn "to"');
      }
    }

    const where: any = {
      teacherId,
    };

    if (query.labelId) {
      where.labelId = query.labelId;
    }

    if (query.from || query.to) {
      const conditions: any[] = [];
      if (query.from) {
        // Sự kiện kết thúc sau thời điểm "from"
        conditions.push({ endAt: { gte: new Date(query.from) } });
      }
      if (query.to) {
        // Sự kiện bắt đầu trước thời điểm "to"
        conditions.push({ startAt: { lte: new Date(query.to) } });
      }
      where.AND = conditions;
    }

    const events = await this.prisma.teacherCalendarEvent.findMany({
      where,
      include: {
        label: {
          select: {
            id: true,
            name: true,
            color: true,
            description: true,
          },
        },
        participants: {
          select: {
            id: true,
            studentId: true,
            createdAt: true,
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
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        startAt: 'asc',
      },
    });

    return {
      total: events.length,
      events,
    };
  }

  /**
   * Giáo viên xem chi tiết một ca dạy
   */
  async getTeacherEventById(teacherId: string, eventId: string) {
    const event = await this.prisma.teacherCalendarEvent.findUnique({
      where: { id: eventId },
      include: {
        label: {
          select: {
            id: true,
            name: true,
            color: true,
            description: true,
          },
        },
        participants: {
          select: {
            id: true,
            studentId: true,
            createdAt: true,
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
        },
        notifications: {
          select: {
            id: true,
            recipientId: true,
            scheduledAt: true,
            status: true,
            sentAt: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Không tìm thấy ca dạy với ID ${eventId}`);
    }

    if (event.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền truy cập ca dạy này');
    }

    return event;
  }

  /**
   * Giáo viên tạo ca dạy mới
   */
  async createTeacherEvent(teacherId: string, dto: CreateCalendarEventDto) {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);

    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
      throw new BadRequestException(
        'Thời gian bắt đầu hoặc kết thúc không hợp lệ',
      );
    }

    if (startAt >= endAt) {
      throw new BadRequestException(
        'Thời gian bắt đầu (startAt) phải trước thời gian kết thúc (endAt)',
      );
    }

    // Kiểm tra quyền sở hữu nhãn nếu có truyền labelId
    if (dto.labelId) {
      const label = await this.prisma.teacherCalendarLabel.findUnique({
        where: { id: dto.labelId },
      });

      if (!label) {
        throw new NotFoundException(
          `Không tìm thấy nhãn với ID ${dto.labelId}`,
        );
      }

      if (label.teacherId !== teacherId) {
        throw new ForbiddenException(
          'Bạn không thể sử dụng nhãn của giáo viên khác',
        );
      }
    }

    // Xác minh và nạp danh sách học sinh ACTIVE nếu có truyền classId
    const studentIdSet = new Set(dto.studentIds ?? []);

    if (dto.classId) {
      const classEntity = await this.prisma.class.findUnique({
        where: { id: dto.classId },
      });

      if (!classEntity) {
        throw new NotFoundException(
          `Không tìm thấy lớp học với ID ${dto.classId}`,
        );
      }

      if (classEntity.teacherId !== teacherId) {
        throw new ForbiddenException(
          'Bạn không thể tạo ca dạy cho lớp học của giáo viên khác',
        );
      }

      const activeMembers = await this.prisma.enrollment.findMany({
        where: {
          classId: dto.classId,
          status: MemberStatus.ACTIVE,
        },
        select: { studentId: true },
      });

      for (const m of activeMembers) {
        studentIdSet.add(m.studentId);
      }
    }

    const studentIds = Array.from(studentIdSet);
    if (studentIds.length > 0) {
      const students = await this.prisma.user.findMany({
        where: {
          id: { in: studentIds },
        },
        select: {
          id: true,
          fullName: true,
          role: true,
          isActive: true,
        },
      });

      if (students.length !== studentIds.length) {
        const foundIds = new Set(students.map((s) => s.id));
        const missing = studentIds.filter((id) => !foundIds.has(id));
        throw new BadRequestException(
          `Một số học sinh không tồn tại trong hệ thống: ${missing.join(', ')}`,
        );
      }

      for (const student of students) {
        if (!student.isActive) {
          throw new BadRequestException(
            `Học sinh "${student.fullName}" đã bị vô hiệu hóa`,
          );
        }
        if (student.role !== UserRole.STUDENT) {
          throw new BadRequestException(
            `Người dùng "${student.fullName}" không có vai trò là STUDENT`,
          );
        }
      }
    }

    const isRecurring = dto.recurrence === ScheduleRecurrence.WEEKLY_FOR_MONTH;

    let conflicts: any[] = [];
    let occurrences: ScheduleOccurrence[] = [];

    if (isRecurring) {
      occurrences = generateWeeklyMonthlyOccurrences(
        startAt,
        endAt,
        'Asia/Ho_Chi_Minh',
      );
      conflicts = await this.prisma.teacherCalendarEvent.findMany({
        where: {
          teacherId,
          OR: occurrences.map((occ) => ({
            startAt: { lt: occ.endAt },
            endAt: { gt: occ.startAt },
          })),
        },
        select: {
          id: true,
          title: true,
          startAt: true,
          endAt: true,
        },
      });
    } else {
      conflicts = await this.prisma.teacherCalendarEvent.findMany({
        where: {
          teacherId,
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
        select: {
          id: true,
          title: true,
          startAt: true,
          endAt: true,
        },
      });
    }

    // Nếu không phải ca dạy lặp lại: giữ nguyên hoàn toàn luồng và hành vi hiện tại
    if (!isRecurring) {
      const createdEvent = await this.prisma.$transaction(async (tx) => {
        const event = await tx.teacherCalendarEvent.create({
          data: {
            teacherId,
            classId: dto.classId,
            title: dto.title,
            address: dto.address,
            meetUrl: dto.meetUrl,
            startAt,
            endAt,
            labelId: dto.labelId,
            reminderMinutes: dto.reminderMinutes,
            note: dto.note,
          },
        });

        // Tạo participants
        if (studentIds.length > 0) {
          await tx.calendarEventParticipant.createMany({
            data: studentIds.map((studentId) => ({
              eventId: event.id,
              studentId,
            })),
          });
        }

        // Tạo thông báo nhắc lịch cho giáo viên và học sinh nếu có reminderMinutes và sự kiện chưa bắt đầu
        if (
          dto.reminderMinutes !== undefined &&
          dto.reminderMinutes !== null &&
          dto.reminderMinutes >= 0 &&
          startAt > new Date()
        ) {
          const scheduledAt = new Date(
            startAt.getTime() - dto.reminderMinutes * 60 * 1000,
          );
          const recipients = [teacherId, ...studentIds];

          await tx.calendarNotification.createMany({
            data: recipients.map((recipientId) => ({
              eventId: event.id,
              recipientId,
              scheduledAt,
              status: CalendarNotificationStatus.PENDING,
            })),
          });
        }

        return tx.teacherCalendarEvent.findUnique({
          where: { id: event.id },
          include: {
            label: true,
            participants: {
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
            },
            _count: {
              select: { participants: true },
            },
          },
        });
      });

      return {
        message: 'Tạo ca dạy thành công',
        event: createdEvent,
        hasConflict: conflicts.length > 0,
        conflicts,
      };
    }

    // Khi lặp lại hàng tuần trong một tháng: tạo nhiều bản ghi ca dạy độc lập trong transaction
    const createdEvents = await this.prisma.$transaction(async (tx) => {
      const events: any[] = [];
      const now = new Date();

      for (const occ of occurrences) {
        const event = await tx.teacherCalendarEvent.create({
          data: {
            teacherId,
            classId: dto.classId,
            title: dto.title,
            address: dto.address,
            meetUrl: dto.meetUrl,
            startAt: occ.startAt,
            endAt: occ.endAt,
            labelId: dto.labelId,
            reminderMinutes: dto.reminderMinutes,
            note: dto.note,
          },
        });

        if (studentIds.length > 0) {
          await tx.calendarEventParticipant.createMany({
            data: studentIds.map((studentId) => ({
              eventId: event.id,
              studentId,
            })),
          });
        }

        if (
          dto.reminderMinutes !== undefined &&
          dto.reminderMinutes !== null &&
          dto.reminderMinutes >= 0 &&
          occ.startAt > now
        ) {
          const scheduledAt = new Date(
            occ.startAt.getTime() - dto.reminderMinutes * 60 * 1000,
          );
          const recipients = [teacherId, ...studentIds];

          await tx.calendarNotification.createMany({
            data: recipients.map((recipientId) => ({
              eventId: event.id,
              recipientId,
              scheduledAt,
              status: CalendarNotificationStatus.PENDING,
            })),
          });
        }

        const fullEvent = await tx.teacherCalendarEvent.findUnique({
          where: { id: event.id },
          include: {
            label: true,
            participants: {
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
            },
            _count: {
              select: { participants: true },
            },
          },
        });

        events.push(fullEvent);
      }

      return events;
    });

    return {
      message: 'Tạo chuỗi ca dạy lặp lại thành công',
      event: createdEvents[0] ?? null,
      events: createdEvents,
      totalOccurrences: createdEvents.length,
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }

  /**
   * Giáo viên cập nhật ca dạy
   */
  async updateTeacherEvent(
    teacherId: string,
    eventId: string,
    dto: UpdateCalendarEventDto,
  ) {
    const existing = await this.prisma.teacherCalendarEvent.findUnique({
      where: { id: eventId },
      include: {
        participants: {
          select: { studentId: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy ca dạy với ID ${eventId}`);
    }

    if (existing.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa ca dạy này');
    }

    const startAt = dto.startAt ? new Date(dto.startAt) : existing.startAt;
    const endAt = dto.endAt ? new Date(dto.endAt) : existing.endAt;

    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
      throw new BadRequestException(
        'Thời gian bắt đầu hoặc kết thúc không hợp lệ',
      );
    }

    if (startAt >= endAt) {
      throw new BadRequestException(
        'Thời gian bắt đầu (startAt) phải trước thời gian kết thúc (endAt)',
      );
    }

    // Kiểm tra quyền sở hữu nhãn nếu cập nhật nhãn
    if (dto.labelId !== undefined && dto.labelId !== null) {
      const label = await this.prisma.teacherCalendarLabel.findUnique({
        where: { id: dto.labelId },
      });

      if (!label) {
        throw new NotFoundException(
          `Không tìm thấy nhãn với ID ${dto.labelId}`,
        );
      }

      if (label.teacherId !== teacherId) {
        throw new ForbiddenException(
          'Bạn không thể sử dụng nhãn của giáo viên khác',
        );
      }
    }

    // Kiểm tra ca trùng giờ mới (ngoại trừ chính ca này)
    const conflicts = await this.prisma.teacherCalendarEvent.findMany({
      where: {
        teacherId,
        id: { not: eventId },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
      select: {
        id: true,
        title: true,
        startAt: true,
        endAt: true,
      },
    });

    const isTimeChanged =
      (dto.startAt &&
        new Date(dto.startAt).getTime() !== existing.startAt.getTime()) ||
      (dto.endAt && new Date(dto.endAt).getTime() !== existing.endAt.getTime());

    const isReminderChanged =
      dto.reminderMinutes !== undefined &&
      dto.reminderMinutes !== existing.reminderMinutes;

    const effectiveReminder =
      dto.reminderMinutes !== undefined
        ? dto.reminderMinutes
        : existing.reminderMinutes;

    const updatedEvent = await this.prisma.$transaction(async (tx) => {
      const data: any = {};
      if (dto.title !== undefined) data.title = dto.title;
      if (dto.address !== undefined) data.address = dto.address;
      if (dto.meetUrl !== undefined) data.meetUrl = dto.meetUrl;
      if (dto.startAt !== undefined) data.startAt = startAt;
      if (dto.endAt !== undefined) data.endAt = endAt;
      if (dto.labelId !== undefined) data.labelId = dto.labelId;
      if (dto.reminderMinutes !== undefined)
        data.reminderMinutes = dto.reminderMinutes;
      if (dto.note !== undefined) data.note = dto.note;

      const event = await tx.teacherCalendarEvent.update({
        where: { id: eventId },
        data,
      });

      // Nếu thay đổi giờ hoặc thay đổi cấu hình nhắc nhở, cập nhật lại job nhắc nhở
      if (isTimeChanged || isReminderChanged) {
        // Hủy các nhắc nhở PENDING cũ của ca dạy này
        await tx.calendarNotification.updateMany({
          where: {
            eventId,
            status: CalendarNotificationStatus.PENDING,
          },
          data: {
            status: CalendarNotificationStatus.CANCELLED,
          },
        });

        // Tạo nhắc nhở mới nếu có số phút nhắc và sự kiện chưa diễn ra
        if (
          effectiveReminder !== null &&
          effectiveReminder >= 0 &&
          startAt > new Date()
        ) {
          const scheduledAt = new Date(
            startAt.getTime() - effectiveReminder * 60 * 1000,
          );
          const recipients = [
            teacherId,
            ...existing.participants.map((p) => p.studentId),
          ];

          await tx.calendarNotification.createMany({
            data: recipients.map((recipientId) => ({
              eventId,
              recipientId,
              scheduledAt,
              status: CalendarNotificationStatus.PENDING,
            })),
          });
        }
      }

      return tx.teacherCalendarEvent.findUnique({
        where: { id: event.id },
        include: {
          label: true,
          participants: {
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
          },
          _count: {
            select: { participants: true },
          },
        },
      });
    });

    return {
      message: 'Cập nhật ca dạy thành công',
      event: updatedEvent,
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }

  /**
   * Giáo viên xóa ca dạy
   */
  async deleteTeacherEvent(teacherId: string, eventId: string) {
    const existing = await this.prisma.teacherCalendarEvent.findUnique({
      where: { id: eventId },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy ca dạy với ID ${eventId}`);
    }

    if (existing.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền xóa ca dạy này');
    }

    await this.prisma.teacherCalendarEvent.delete({
      where: { id: eventId },
    });

    return {
      message: 'Xóa ca dạy thành công',
    };
  }

  // ==========================================
  // TEACHER LABELS
  // ==========================================

  /**
   * Lấy danh sách nhãn của giáo viên
   */
  async getTeacherLabels(teacherId: string) {
    const labels = await this.prisma.teacherCalendarLabel.findMany({
      where: { teacherId },
      include: {
        _count: {
          select: {
            events: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      total: labels.length,
      labels,
    };
  }

  /**
   * Tạo nhãn mới cho giáo viên
   */
  async createTeacherLabel(teacherId: string, dto: CreateCalendarLabelDto) {
    const existing = await this.prisma.teacherCalendarLabel.findUnique({
      where: {
        teacherId_name: {
          teacherId,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Nhãn với tên "${dto.name}" đã tồn tại`);
    }

    const label = await this.prisma.teacherCalendarLabel.create({
      data: {
        teacherId,
        name: dto.name,
        color: dto.color,
        description: dto.description,
      },
    });

    return {
      message: 'Tạo nhãn thành công',
      label,
    };
  }

  /**
   * Sửa nhãn của giáo viên
   */
  async updateTeacherLabel(
    teacherId: string,
    labelId: string,
    dto: UpdateCalendarLabelDto,
  ) {
    const existing = await this.prisma.teacherCalendarLabel.findUnique({
      where: { id: labelId },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy nhãn với ID ${labelId}`);
    }

    if (existing.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa nhãn này');
    }

    if (dto.name && dto.name !== existing.name) {
      const duplicate = await this.prisma.teacherCalendarLabel.findUnique({
        where: {
          teacherId_name: {
            teacherId,
            name: dto.name,
          },
        },
      });
      if (duplicate) {
        throw new ConflictException(`Nhãn với tên "${dto.name}" đã tồn tại`);
      }
    }

    const updated = await this.prisma.teacherCalendarLabel.update({
      where: { id: labelId },
      data: {
        name: dto.name,
        color: dto.color,
        description: dto.description,
      },
    });

    return {
      message: 'Cập nhật nhãn thành công',
      label: updated,
    };
  }

  /**
   * Xóa nhãn của giáo viên
   * Sự kiện dùng nhãn này sẽ tự động chuyển labelId thành null (onDelete: SetNull)
   */
  async deleteTeacherLabel(teacherId: string, labelId: string) {
    const existing = await this.prisma.teacherCalendarLabel.findUnique({
      where: { id: labelId },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy nhãn với ID ${labelId}`);
    }

    if (existing.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền xóa nhãn này');
    }

    await this.prisma.teacherCalendarLabel.delete({
      where: { id: labelId },
    });

    return {
      message: 'Xóa nhãn thành công. Các ca dạy dùng nhãn này đã được gỡ nhãn.',
    };
  }

  // ==========================================
  // PARTICIPANTS
  // ==========================================

  /**
   * Xem danh sách học sinh tham gia ca dạy
   */
  async getEventParticipants(teacherId: string, eventId: string) {
    const event = await this.prisma.teacherCalendarEvent.findUnique({
      where: { id: eventId },
      select: { id: true, teacherId: true },
    });

    if (!event) {
      throw new NotFoundException(`Không tìm thấy ca dạy với ID ${eventId}`);
    }

    if (event.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền truy cập ca dạy này');
    }

    const participants = await this.prisma.calendarEventParticipant.findMany({
      where: { eventId },
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      total: participants.length,
      participants,
    };
  }

  /**
   * Thêm học sinh vào ca dạy (1 hoặc nhiều học sinh)
   */
  async addEventParticipants(
    teacherId: string,
    eventId: string,
    dto: AddCalendarParticipantsDto,
  ) {
    const event = await this.prisma.teacherCalendarEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Không tìm thấy ca dạy với ID ${eventId}`);
    }

    if (event.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa ca dạy này');
    }

    // Thu thập danh sách studentId
    const inputIds: string[] = [];
    if (dto.studentId) inputIds.push(dto.studentId);
    if (dto.studentIds && dto.studentIds.length > 0)
      inputIds.push(...dto.studentIds);

    const studentIds = Array.from(new Set(inputIds));
    if (studentIds.length === 0) {
      throw new BadRequestException(
        'Cần cung cấp ít nhất một mã học sinh (studentId hoặc studentIds)',
      );
    }

    // Kiểm tra học sinh hợp lệ
    const students = await this.prisma.user.findMany({
      where: {
        id: { in: studentIds },
      },
      select: {
        id: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    if (students.length !== studentIds.length) {
      const foundIds = new Set(students.map((s) => s.id));
      const missing = studentIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `Một số học sinh không tồn tại trong hệ thống: ${missing.join(', ')}`,
      );
    }

    for (const student of students) {
      if (!student.isActive) {
        throw new BadRequestException(
          `Học sinh "${student.fullName}" đã bị vô hiệu hóa`,
        );
      }
      if (student.role !== UserRole.STUDENT) {
        throw new BadRequestException(
          `Người dùng "${student.fullName}" không có vai trò là STUDENT`,
        );
      }
    }

    // Kiểm tra trùng học sinh đã có trong ca dạy
    const existingParticipants =
      await this.prisma.calendarEventParticipant.findMany({
        where: {
          eventId,
          studentId: { in: studentIds },
        },
        include: {
          student: { select: { fullName: true } },
        },
      });

    if (existingParticipants.length > 0) {
      const duplicateNames = existingParticipants
        .map((p) => p.student.fullName)
        .join(', ');
      throw new ConflictException(
        `Học sinh đã có trong ca dạy này: ${duplicateNames}`,
      );
    }

    // Thêm học sinh và lên lịch nhắc nhở
    await this.prisma.$transaction(async (tx) => {
      await tx.calendarEventParticipant.createMany({
        data: studentIds.map((studentId) => ({
          eventId,
          studentId,
        })),
      });

      // Nếu ca dạy có reminderMinutes và chưa kết thúc, lên lịch nhắc cho các học sinh mới thêm
      if (
        event.reminderMinutes !== null &&
        event.reminderMinutes >= 0 &&
        event.startAt > new Date()
      ) {
        const scheduledAt = new Date(
          event.startAt.getTime() - event.reminderMinutes * 60 * 1000,
        );

        await tx.calendarNotification.createMany({
          data: studentIds.map((studentId) => ({
            eventId,
            recipientId: studentId,
            scheduledAt,
            status: CalendarNotificationStatus.PENDING,
          })),
        });
      }
    });

    return {
      message: `Đã thêm ${studentIds.length} học sinh vào ca dạy thành công`,
      addedStudentIds: studentIds,
    };
  }

  /**
   * Xóa một học sinh khỏi ca dạy
   */
  async removeEventParticipant(
    teacherId: string,
    eventId: string,
    studentId: string,
  ) {
    const event = await this.prisma.teacherCalendarEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Không tìm thấy ca dạy với ID ${eventId}`);
    }

    if (event.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa ca dạy này');
    }

    const participant = await this.prisma.calendarEventParticipant.findUnique({
      where: {
        eventId_studentId: {
          eventId,
          studentId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Học sinh không tham gia ca dạy này');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.calendarEventParticipant.delete({
        where: {
          eventId_studentId: {
            eventId,
            studentId,
          },
        },
      });

      // Hủy mọi thông báo nhắc nhở PENDING cho học sinh này ở ca dạy này
      await tx.calendarNotification.updateMany({
        where: {
          eventId,
          recipientId: studentId,
          status: CalendarNotificationStatus.PENDING,
        },
        data: {
          status: CalendarNotificationStatus.CANCELLED,
        },
      });
    });

    return {
      message: 'Đã xóa học sinh khỏi ca dạy thành công',
    };
  }

  // ==========================================
  // STUDENT CALENDAR
  // ==========================================

  /**
   * Học sinh xem danh sách ca dạy được phân công theo khoảng thời gian
   */
  async getStudentEvents(studentId: string, query: QueryCalendarEventsDto) {
    if (query.from && query.to) {
      const fromDate = new Date(query.from);
      const toDate = new Date(query.to);
      if (fromDate > toDate) {
        throw new BadRequestException('Tham số "from" không được lớn hơn "to"');
      }
    }

    const where: any = {
      participants: {
        some: {
          studentId,
        },
      },
    };

    if (query.labelId) {
      where.labelId = query.labelId;
    }

    if (query.from || query.to) {
      const conditions: any[] = [];
      if (query.from) {
        conditions.push({ endAt: { gte: new Date(query.from) } });
      }
      if (query.to) {
        conditions.push({ startAt: { lte: new Date(query.to) } });
      }
      where.AND = conditions;
    }

    const events = await this.prisma.teacherCalendarEvent.findMany({
      where,
      select: {
        id: true,
        title: true,
        address: true,
        meetUrl: true,
        startAt: true,
        endAt: true,
        note: true,
        createdAt: true,
        updatedAt: true,
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        label: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        startAt: 'asc',
      },
    });

    return {
      total: events.length,
      events,
    };
  }

  /**
   * Học sinh xem chi tiết ca dạy mà mình tham gia
   */
  async getStudentEventById(studentId: string, eventId: string) {
    const isParticipant = await this.prisma.calendarEventParticipant.findUnique(
      {
        where: {
          eventId_studentId: {
            eventId,
            studentId,
          },
        },
      },
    );

    if (!isParticipant) {
      throw new NotFoundException(
        'Không tìm thấy ca dạy hoặc bạn không tham gia ca dạy này',
      );
    }

    const event = await this.prisma.teacherCalendarEvent.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        address: true,
        meetUrl: true,
        startAt: true,
        endAt: true,
        note: true,
        createdAt: true,
        updatedAt: true,
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        label: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Không tìm thấy ca dạy');
    }

    return event;
  }
}
