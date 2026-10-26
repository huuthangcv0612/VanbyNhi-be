import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import {
  UserRole,
  MemberStatus,
  ScheduleStatus,
  MeetingType,
  CalendarNotificationStatus,
  NotificationType,
} from '../../generated/prisma/client.js';
import type { CreateScheduleDto } from './dto/create-schedule.dto.js';
import type { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import type { QueryTeacherSchedulesDto } from './dto/query-teacher-schedules.dto.js';
import type { QueryStudentSchedulesDto } from './dto/query-student-schedules.dto.js';
import {
  ScheduleRecurrence,
  generateWeeklyMonthlyOccurrences,
  type ScheduleOccurrence,
} from './utils/recurrence.util.js';

@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ==========================================
  // TEACHER SCHEDULES
  // ==========================================

  /**
   * Tạo lịch học mới cho giáo viên (cho lớp, học sinh cụ thể hoặc cả hai)
   */
  async createSchedule(teacherId: string, dto: CreateScheduleDto) {
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

    // Kiểm tra lớp học nếu có classId
    let classEntity: any = null;
    if (dto.classId) {
      classEntity = await this.prisma.class.findUnique({
        where: { id: dto.classId },
      });

      if (!classEntity) {
        throw new NotFoundException(
          `Không tìm thấy lớp học với ID ${dto.classId}`,
        );
      }

      if (classEntity.teacherId !== teacherId) {
        throw new ForbiddenException(
          'Bạn không có quyền quản lý hoặc tạo lịch cho lớp học này',
        );
      }
    }

    // Kiểm tra nhãn nếu có labelId
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

    // Kiểm tra danh sách học sinh được chỉ định riêng nếu có
    const studentIds = Array.from(new Set(dto.studentIds ?? []));
    if (studentIds.length > 0) {
      const students = await this.prisma.user.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, fullName: true, role: true, isActive: true },
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

    const locationValue = dto.location ?? null;
    const meetingUrlValue = dto.meetingUrl ?? null;
    const descriptionValue = dto.description ?? null;
    const timezoneValue = dto.timezone ?? 'Asia/Ho_Chi_Minh';
    const meetingTypeValue = dto.meetingType ?? MeetingType.ONLINE_MEET;

    const isRecurring = dto.recurrence === ScheduleRecurrence.WEEKLY_FOR_MONTH;

    // Kiểm tra trùng giờ dạy của giáo viên (cảnh báo, không chặn)
    let conflicts: any[] = [];
    let occurrences: ScheduleOccurrence[] = [];

    if (isRecurring) {
      occurrences = generateWeeklyMonthlyOccurrences(
        startAt,
        endAt,
        timezoneValue,
      );
      conflicts = await this.prisma.teacherCalendarEvent.findMany({
        where: {
          teacherId,
          status: { not: ScheduleStatus.CANCELLED },
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
          status: { not: ScheduleStatus.CANCELLED },
        },
        select: {
          id: true,
          title: true,
          startAt: true,
          endAt: true,
        },
      });
    }

    // Nếu không phải lịch lặp lại: giữ nguyên hoàn toàn luồng và hành vi hiện tại
    if (!isRecurring) {
      const schedule = await this.prisma.$transaction(async (tx) => {
        const event = await tx.teacherCalendarEvent.create({
          data: {
            teacherId,
            classId: dto.classId ?? null,
            title: dto.title,
            description: descriptionValue,
            note: descriptionValue,
            startAt,
            endAt,
            timezone: timezoneValue,
            meetingType: meetingTypeValue,
            meetingUrl: meetingUrlValue,
            meetUrl: meetingUrlValue,
            location: locationValue,
            address: locationValue,
            status: ScheduleStatus.SCHEDULED,
            reminderMinutes: dto.reminderMinutes ?? null,
            labelId: dto.labelId ?? null,
          },
        });

        // Lưu quan hệ người tham gia riêng cho học sinh được chỉ định trực tiếp
        if (studentIds.length > 0) {
          await tx.calendarEventParticipant.createMany({
            data: studentIds.map((studentId) => ({
              eventId: event.id,
              studentId,
            })),
          });
        }

        // Tạo nhắc lịch tự động nếu có reminderMinutes
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
            class: {
              select: {
                id: true,
                name: true,
                classCode: true,
              },
            },
            label: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
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
              select: {
                participants: true,
              },
            },
          },
        });
      });

      // Tích hợp gửi thông báo in-app đến các học sinh được áp dụng lịch này
      await this.notifyStudentsOnScheduleChange(
        schedule!.id,
        schedule!.title,
        schedule!.classId,
        studentIds,
        'Lịch học mới',
        `Bạn có lịch học mới: "${schedule!.title}" diễn ra từ ${startAt.toISOString()} đến ${endAt.toISOString()}`,
      );

      return {
        message: 'Tạo lịch học thành công',
        schedule,
        hasConflict: conflicts.length > 0,
        conflicts,
      };
    }

    // Khi lặp lại hàng tuần trong một tháng: tạo nhiều bản ghi độc lập trong transaction
    const createdEvents = await this.prisma.$transaction(async (tx) => {
      const events: any[] = [];
      const now = new Date();

      for (const occ of occurrences) {
        const event = await tx.teacherCalendarEvent.create({
          data: {
            teacherId,
            classId: dto.classId ?? null,
            title: dto.title,
            description: descriptionValue,
            note: descriptionValue,
            startAt: occ.startAt,
            endAt: occ.endAt,
            timezone: timezoneValue,
            meetingType: meetingTypeValue,
            meetingUrl: meetingUrlValue,
            meetUrl: meetingUrlValue,
            location: locationValue,
            address: locationValue,
            status: ScheduleStatus.SCHEDULED,
            reminderMinutes: dto.reminderMinutes ?? null,
            labelId: dto.labelId ?? null,
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
            class: {
              select: {
                id: true,
                name: true,
                classCode: true,
              },
            },
            label: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
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
              select: {
                participants: true,
              },
            },
          },
        });

        events.push(fullEvent);
      }

      return events;
    });

    // Gửi thông báo in-app đến các học sinh cho từng buổi học đã tạo thành công
    for (const item of createdEvents) {
      if (item) {
        const startIso = item.startAt
          ? (item.startAt instanceof Date
              ? item.startAt.toISOString()
              : new Date(item.startAt).toISOString())
          : '';
        const endIso = item.endAt
          ? (item.endAt instanceof Date
              ? item.endAt.toISOString()
              : new Date(item.endAt).toISOString())
          : '';

        await this.notifyStudentsOnScheduleChange(
          item.id,
          item.title,
          item.classId,
          studentIds,
          'Lịch học mới',
          `Bạn có lịch học mới: "${item.title}" diễn ra từ ${startIso} đến ${endIso}`,
        );
      }
    }

    return {
      message: 'Tạo chuỗi lịch học lặp lại thành công',
      schedule: createdEvents[0] ?? null,
      schedules: createdEvents,
      totalOccurrences: createdEvents.length,
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }

  /**
   * Giáo viên xem danh sách lịch học do mình quản lý
   */
  async getTeacherSchedules(
    teacherId: string,
    query: QueryTeacherSchedulesDto,
  ) {
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

    if (query.classId) {
      where.classId = query.classId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.studentId) {
      // Học sinh được chỉ định riêng hoặc đang là thành viên active của lớp
      where.OR = [
        {
          participants: {
            some: {
              studentId: query.studentId,
            },
          },
        },
        {
          class: {
            members: {
              some: {
                studentId: query.studentId,
                status: MemberStatus.ACTIVE,
              },
            },
          },
        },
      ];
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

    const page = query.page ? Math.max(1, query.page) : undefined;
    const limit = query.limit
      ? Math.min(100, Math.max(1, query.limit))
      : undefined;
    const skip = page && limit ? (page - 1) * limit : undefined;

    const [schedules, total] = await Promise.all([
      this.prisma.teacherCalendarEvent.findMany({
        where,
        skip,
        take: limit,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              classCode: true,
            },
          },
          label: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
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
            select: {
              participants: true,
            },
          },
        },
        orderBy: {
          startAt: 'asc',
        },
      }),
      this.prisma.teacherCalendarEvent.count({ where }),
    ]);

    const result: any = {
      total,
      schedules,
    };

    if (page && limit) {
      result.pagination = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }

    return result;
  }

  /**
   * Giáo viên xem chi tiết một lịch học và người tham gia
   */
  async getTeacherScheduleById(teacherId: string, scheduleId: string) {
    const schedule = await this.prisma.teacherCalendarEvent.findUnique({
      where: { id: scheduleId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            classCode: true,
          },
        },
        label: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
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
          select: {
            participants: true,
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException(
        `Không tìm thấy lịch học với ID ${scheduleId}`,
      );
    }

    if (schedule.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập thông tin lịch học này',
      );
    }

    return schedule;
  }

  /**
   * Giáo viên cập nhật lịch học
   */
  async updateTeacherSchedule(
    teacherId: string,
    scheduleId: string,
    dto: UpdateScheduleDto,
  ) {
    const existing = await this.prisma.teacherCalendarEvent.findUnique({
      where: { id: scheduleId },
      include: {
        participants: {
          select: { studentId: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Không tìm thấy lịch học với ID ${scheduleId}`,
      );
    }

    if (existing.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa lịch học này',
      );
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

    // Kiểm tra lớp mới nếu đổi classId
    if (dto.classId !== undefined && dto.classId !== null) {
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
          'Bạn không có quyền chuyển lịch sang lớp của giáo viên khác',
        );
      }
    }

    // Kiểm tra nhãn nếu đổi labelId
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

    // Xác thực danh sách studentIds mới nếu có cung cấp
    let newStudentIds: string[] | undefined = undefined;
    if (dto.studentIds !== undefined) {
      newStudentIds = Array.from(new Set(dto.studentIds));
      if (newStudentIds.length > 0) {
        const students = await this.prisma.user.findMany({
          where: { id: { in: newStudentIds } },
          select: { id: true, fullName: true, role: true, isActive: true },
        });

        if (students.length !== newStudentIds.length) {
          const foundIds = new Set(students.map((s) => s.id));
          const missing = newStudentIds.filter((id) => !foundIds.has(id));
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
    }

    // Kiểm tra xung đột giờ mới (không tính chính lịch này)
    const conflicts = await this.prisma.teacherCalendarEvent.findMany({
      where: {
        teacherId,
        id: { not: scheduleId },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        status: { not: ScheduleStatus.CANCELLED },
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

    const updatedSchedule = await this.prisma.$transaction(async (tx) => {
      const data: any = {};
      if (dto.title !== undefined) data.title = dto.title;
      if (dto.description !== undefined) {
        data.description = dto.description;
        data.note = dto.description;
      }
      if (dto.startAt !== undefined) data.startAt = startAt;
      if (dto.endAt !== undefined) data.endAt = endAt;
      if (dto.timezone !== undefined) data.timezone = dto.timezone;
      if (dto.meetingType !== undefined) data.meetingType = dto.meetingType;
      if (dto.meetingUrl !== undefined) {
        data.meetingUrl = dto.meetingUrl;
        data.meetUrl = dto.meetingUrl;
      }
      if (dto.location !== undefined) {
        data.location = dto.location;
        data.address = dto.location;
      }
      if (dto.status !== undefined) data.status = dto.status;
      if (dto.reminderMinutes !== undefined)
        data.reminderMinutes = dto.reminderMinutes;
      if (dto.labelId !== undefined) data.labelId = dto.labelId;
      if (dto.classId !== undefined) data.classId = dto.classId;

      await tx.teacherCalendarEvent.update({
        where: { id: scheduleId },
        data,
      });

      // Nếu cập nhật danh sách học sinh chỉ định riêng
      if (newStudentIds !== undefined) {
        await tx.calendarEventParticipant.deleteMany({
          where: { eventId: scheduleId },
        });

        if (newStudentIds.length > 0) {
          await tx.calendarEventParticipant.createMany({
            data: newStudentIds.map((studentId) => ({
              eventId: scheduleId,
              studentId,
            })),
          });
        }
      }

      const currentParticipantIds =
        newStudentIds !== undefined
          ? newStudentIds
          : existing.participants.map((p) => p.studentId);

      // Cập nhật nhắc nhở nếu đổi giờ hoặc đổi phút nhắc
      if (isTimeChanged || isReminderChanged || newStudentIds !== undefined) {
        await tx.calendarNotification.updateMany({
          where: {
            eventId: scheduleId,
            status: CalendarNotificationStatus.PENDING,
          },
          data: {
            status: CalendarNotificationStatus.CANCELLED,
          },
        });

        if (
          effectiveReminder !== null &&
          effectiveReminder >= 0 &&
          startAt > new Date()
        ) {
          const scheduledAt = new Date(
            startAt.getTime() - effectiveReminder * 60 * 1000,
          );
          const recipients = [teacherId, ...currentParticipantIds];

          await tx.calendarNotification.createMany({
            data: recipients.map((recipientId) => ({
              eventId: scheduleId,
              recipientId,
              scheduledAt,
              status: CalendarNotificationStatus.PENDING,
            })),
          });
        }
      }

      return tx.teacherCalendarEvent.findUnique({
        where: { id: scheduleId },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              classCode: true,
            },
          },
          label: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
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
            select: {
              participants: true,
            },
          },
        },
      });
    });

    // Thông báo cho học sinh khi có cập nhật lịch
    const targetClassId =
      dto.classId !== undefined ? dto.classId : existing.classId;
    const targetStudentIds =
      newStudentIds !== undefined
        ? newStudentIds
        : existing.participants.map((p) => p.studentId);

    await this.notifyStudentsOnScheduleChange(
      scheduleId,
      updatedSchedule!.title,
      targetClassId,
      targetStudentIds,
      'Cập nhật lịch học',
      `Lịch học "${updatedSchedule!.title}" đã được cập nhật thông tin. Vui lòng kiểm tra lại thời gian và nội dung.`,
    );

    return {
      message: 'Cập nhật lịch học thành công',
      schedule: updatedSchedule,
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }

  /**
   * Hủy lịch học (giữ lại bản ghi nguồn với trạng thái CANCELLED)
   */
  async cancelTeacherSchedule(teacherId: string, scheduleId: string) {
    const existing = await this.prisma.teacherCalendarEvent.findUnique({
      where: { id: scheduleId },
      include: {
        participants: {
          select: { studentId: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Không tìm thấy lịch học với ID ${scheduleId}`,
      );
    }

    if (existing.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền hủy lịch học này');
    }

    const cancelledSchedule = await this.prisma.$transaction(async (tx) => {
      const event = await tx.teacherCalendarEvent.update({
        where: { id: scheduleId },
        data: {
          status: ScheduleStatus.CANCELLED,
        },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              classCode: true,
            },
          },
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
        },
      });

      // Hủy mọi thông báo nhắc nhở PENDING của lịch này
      await tx.calendarNotification.updateMany({
        where: {
          eventId: scheduleId,
          status: CalendarNotificationStatus.PENDING,
        },
        data: {
          status: CalendarNotificationStatus.CANCELLED,
        },
      });

      return event;
    });

    // Gửi thông báo hủy lịch cho học sinh liên quan
    await this.notifyStudentsOnScheduleChange(
      scheduleId,
      existing.title,
      existing.classId,
      existing.participants.map((p) => p.studentId),
      'Lịch học đã bị hủy',
      `Lịch học "${existing.title}" diễn ra lúc ${existing.startAt.toISOString()} đã bị hủy bởi giáo viên.`,
    );

    return {
      message: 'Hủy lịch học thành công',
      schedule: cancelledSchedule,
    };
  }

  // ==========================================
  // STUDENT SCHEDULES
  // ==========================================

  /**
   * Học sinh xem toàn bộ lịch học tổng hợp được phép xem
   * (gồm lịch từ lớp đang theo học ACTIVE và lịch được chỉ định riêng, không trùng lặp)
   */
  async getStudentSchedules(
    studentId: string,
    query: QueryStudentSchedulesDto,
  ) {
    if (query.from && query.to) {
      const fromDate = new Date(query.from);
      const toDate = new Date(query.to);
      if (fromDate > toDate) {
        throw new BadRequestException('Tham số "from" không được lớn hơn "to"');
      }
    }

    // Điều kiện truy cập: Học sinh thuộc lớp ACTIVE hoặc được chỉ định riêng trong participants
    const accessCondition = {
      OR: [
        {
          class: {
            members: {
              some: {
                studentId,
                status: MemberStatus.ACTIVE,
              },
            },
          },
        },
        {
          participants: {
            some: {
              studentId,
            },
          },
        },
      ],
    };

    const where: any = {
      ...accessCondition,
    };

    if (query.classId) {
      where.classId = query.classId;
    }

    if (query.status) {
      where.status = query.status;
    }

    // Khoảng thời gian: Mặc định hợp lý nếu không truyền from/to để tránh tải vô hạn lịch sử
    if (query.from || query.to) {
      const conditions: any[] = [];
      if (query.from) {
        conditions.push({ endAt: { gte: new Date(query.from) } });
      }
      if (query.to) {
        conditions.push({ startAt: { lte: new Date(query.to) } });
      }
      where.AND = conditions;
    } else {
      // Mặc định: 30 ngày trước đến 90 ngày sau
      const defaultFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const defaultTo = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      where.AND = [
        { endAt: { gte: defaultFrom } },
        { startAt: { lte: defaultTo } },
      ];
    }

    const page = query.page ? Math.max(1, query.page) : undefined;
    const limit = query.limit
      ? Math.min(100, Math.max(1, query.limit))
      : undefined;
    const skip = page && limit ? (page - 1) * limit : undefined;

    const [schedules, total] = await Promise.all([
      this.prisma.teacherCalendarEvent.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          startAt: true,
          endAt: true,
          timezone: true,
          meetingType: true,
          meetingUrl: true,
          location: true,
          status: true,
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
          class: {
            select: {
              id: true,
              name: true,
              classCode: true,
            },
          },
        },
        orderBy: {
          startAt: 'asc',
        },
      }),
      this.prisma.teacherCalendarEvent.count({ where }),
    ]);

    const result: any = {
      total,
      schedules,
    };

    if (page && limit) {
      result.pagination = {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }

    return result;
  }

  /**
   * Học sinh xem chi tiết một lịch học mà mình có quyền truy cập
   */
  async getStudentScheduleById(studentId: string, scheduleId: string) {
    const schedule = await this.prisma.teacherCalendarEvent.findFirst({
      where: {
        id: scheduleId,
        OR: [
          {
            class: {
              members: {
                some: {
                  studentId,
                  status: MemberStatus.ACTIVE,
                },
              },
            },
          },
          {
            participants: {
              some: {
                studentId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        startAt: true,
        endAt: true,
        timezone: true,
        meetingType: true,
        meetingUrl: true,
        location: true,
        status: true,
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
        class: {
          select: {
            id: true,
            name: true,
            classCode: true,
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException(
        'Không tìm thấy lịch học hoặc bạn không có quyền truy cập lịch học này',
      );
    }

    return schedule;
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Gửi thông báo đến toàn bộ học sinh liên quan (thành viên lớp và học sinh chỉ định riêng),
   * khử trùng lặp recipientId để tránh gửi nhiều thông báo cùng nội dung.
   */
  private async notifyStudentsOnScheduleChange(
    scheduleId: string,
    scheduleTitle: string,
    classId?: string | null,
    directStudentIds?: string[],
    title?: string,
    content?: string,
  ) {
    try {
      const recipientSet = new Set<string>(directStudentIds ?? []);

      if (classId) {
        const activeClassMembers = await this.prisma.enrollment.findMany({
          where: {
            classId,
            status: MemberStatus.ACTIVE,
          },
          select: { studentId: true },
        });

        for (const m of activeClassMembers) {
          recipientSet.add(m.studentId);
        }
      }

      const allRecipients = Array.from(recipientSet);
      if (allRecipients.length === 0) return;

      const notificationsData = allRecipients.map((recipientId) => ({
        recipientId,
        title: title ?? 'Thông báo lịch học',
        content: content ?? `Lịch học "${scheduleTitle}" có cập nhật mới.`,
        type: NotificationType.CALENDAR,
        referenceId: scheduleId,
      }));

      await this.prisma.notification.createMany({
        data: notificationsData,
      });
    } catch {
      // Ghi log nhẹ nhàng hoặc bỏ qua nếu việc gửi notification không ảnh hưởng đến flow chính
    }
  }
}
