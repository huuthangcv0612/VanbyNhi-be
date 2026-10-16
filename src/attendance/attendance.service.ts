import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AttendanceStatus,
  AttendanceSessionStatus,
  CorrectionRequestStatus,
  MemberStatus,
  SessionStatus,
  UserRole,
  Prisma,
} from '../../generated/prisma/client.js';
import type { BatchAttendanceDto } from './dto/batch-attendance.dto.js';
import type { AttendanceRecordDto } from './dto/attendance-record.dto.js';
import type { UpdateAttendanceDto } from './dto/update-attendance.dto.js';
import type { MarkAllPresentDto } from './dto/mark-all-present.dto.js';
import type { CloseAttendanceSessionDto } from './dto/close-session.dto.js';
import type { QueryAttendanceHistoryDto } from './dto/query-attendance-history.dto.js';
import type { CreateCorrectionRequestDto } from './dto/create-correction-request.dto.js';
import type { ReviewCorrectionRequestDto } from './dto/review-correction-request.dto.js';
import type { QueryCorrectionRequestsDto } from './dto/query-correction-requests.dto.js';
import type { CloseMonthlySummaryDto } from './dto/close-monthly-summary.dto.js';
import type { QueryMonthlySummaryDto } from './dto/query-monthly-summary.dto.js';
import type { UpdateAttendanceConfigDto } from './dto/update-attendance-config.dto.js';
import type { QueryStudentAttendanceDto } from './dto/query-student-attendance.dto.js';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Kiểm tra quyền quản lý điểm danh của TEACHER hoặc ADMIN theo sessionId
   */
  async validateTeacherOrAdminAccess(
    sessionId: string,
    userId: string,
    userRole: UserRole,
  ) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: { select: { id: true, teacherId: true, name: true } },
      },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
    }

    if (userRole === UserRole.ADMIN) {
      return session;
    }

    if (userRole === UserRole.TEACHER) {
      if (session.class.teacherId !== userId) {
        throw new ForbiddenException(
          'Bạn không phải là giáo viên phụ trách của lớp học này',
        );
      }
      return session;
    }

    throw new ForbiddenException('Bạn không có quyền quản lý điểm danh');
  }

  /**
   * Kiểm tra quyền quản lý theo classId
   */
  async validateClassTeacherOrAdminAccess(
    classId: string,
    userId: string,
    userRole: UserRole,
  ) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, teacherId: true, name: true },
    });

    if (!classEntity) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${classId}`);
    }

    if (userRole === UserRole.ADMIN) {
      return classEntity;
    }

    if (userRole === UserRole.TEACHER) {
      if (classEntity.teacherId !== userId) {
        throw new ForbiddenException(
          'Bạn không phải là giáo viên phụ trách của lớp học này',
        );
      }
      return classEntity;
    }

    throw new ForbiddenException('Bạn không có quyền quản lý lớp học này');
  }

  /**
   * Lấy danh sách điểm danh của một buổi học kèm danh sách học sinh của lớp
   */
  async getSessionAttendance(sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          select: { id: true, name: true, teacherId: true },
        },
        attendanceSession: {
          include: {
            closedBy: { select: { id: true, fullName: true } },
            createdBy: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(
        `Không tìm thấy buổi học với ID ${sessionId}`,
      );
    }

    // Lấy danh sách học sinh có enrollment trong lớp (ưu tiên ACTIVE, hoặc tham gia trước buổi học)
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        classId: session.classId,
        joinedAt: { lte: session.endTime },
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            avatarUrl: true,
            isActive: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    // Lấy các bản ghi điểm danh hiện có của session
    const attendances = await this.prisma.attendance.findMany({
      where: { sessionId },
      include: {
        markedBy: {
          select: { id: true, fullName: true },
        },
        changeLogs: {
          include: {
            changedBy: { select: { id: true, fullName: true } },
          },
          orderBy: { changedAt: 'desc' },
        },
        correctionRequests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const attendanceMap = new Map<string, (typeof attendances)[0]>();
    for (const att of attendances) {
      attendanceMap.set(att.studentId, att);
    }

    const students = enrollments.map((enr) => {
      const att = attendanceMap.get(enr.studentId);
      return {
        student: enr.student,
        enrollmentStatus: enr.status,
        attendance: att ?? null,
      };
    });

    return {
      session: {
        id: session.id,
        title: session.title,
        status: session.status,
        startTime: session.startTime,
        endTime: session.endTime,
        class: session.class,
        attendanceSession: session.attendanceSession,
      },
      students,
    };
  }

  /**
   * Thống kê tóm tắt tình hình điểm danh của buổi học
   */
  async getSessionSummary(sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(
        `Không tìm thấy buổi học với ID ${sessionId}`,
      );
    }

    const [totalActiveStudents, counts] = await Promise.all([
      this.prisma.enrollment.count({
        where: {
          classId: session.classId,
          status: MemberStatus.ACTIVE,
        },
      }),
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: { sessionId },
        _count: { _all: true },
      }),
    ]);

    const summary: Record<AttendanceStatus, number> = {
      [AttendanceStatus.PRESENT]: 0,
      [AttendanceStatus.LATE]: 0,
      [AttendanceStatus.ABSENT]: 0,
      [AttendanceStatus.EXCUSED_ABSENT]: 0,
      [AttendanceStatus.UNEXCUSED_ABSENT]: 0,
      [AttendanceStatus.NOT_MARKED]: 0,
    };

    let totalMarked = 0;
    for (const item of counts) {
      summary[item.status] = item._count._all;
      if (item.status !== AttendanceStatus.NOT_MARKED) {
        totalMarked += item._count._all;
      }
    }

    const presentCount = summary[AttendanceStatus.PRESENT];
    const lateCount = summary[AttendanceStatus.LATE];
    const excusedAbsentCount = summary[AttendanceStatus.EXCUSED_ABSENT];
    const unexcusedAbsentCount = summary[AttendanceStatus.UNEXCUSED_ABSENT];
    const absentCount = summary[AttendanceStatus.ABSENT] + unexcusedAbsentCount;
    const notMarkedCount = summary[AttendanceStatus.NOT_MARKED];
    const unmarkedCount = Math.max(0, totalActiveStudents - totalMarked);

    return {
      sessionId,
      totalActiveStudents,
      totalStudents: totalActiveStudents,
      totalMarked,
      presentCount,
      lateCount,
      absentCount,
      excusedAbsentCount,
      unexcusedAbsentCount,
      notMarkedCount,
      unmarkedCount,
      summary,
    };
  }

  /**
   * Mở hoặc lấy phiên điểm danh cho buổi học
   */
  async openAttendanceSession(sessionId: string, userId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
    }

    if (session.status === SessionStatus.CANCELLED) {
      throw new BadRequestException('Buổi học đã bị hủy, không thể mở điểm danh');
    }

    const attSession = await this.prisma.attendanceSession.upsert({
      where: { sessionId },
      create: {
        sessionId,
        classId: session.classId,
        status: AttendanceSessionStatus.OPEN,
        createdById: userId,
      },
      update: {
        status: AttendanceSessionStatus.OPEN,
      },
      include: {
        closedBy: { select: { id: true, fullName: true } },
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    return {
      message: 'Mở phiên điểm danh thành công',
      attendanceSession: attSession,
    };
  }

  /**
   * Lưu bản nháp điểm danh (DRAFT)
   */
  async saveDraftAttendance(
    sessionId: string,
    markerId: string,
    dto: BatchAttendanceDto,
  ) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { attendanceSession: true },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
    }

    if (session.attendanceSession?.status === AttendanceSessionStatus.CLOSED) {
      throw new BadRequestException(
        'Phiên điểm danh này đã được chốt (CLOSED). Không thể lưu bản nháp',
      );
    }

    // Thực hiện lưu batch và cập nhật trạng thái session sang DRAFT
    const result = await this.batchSaveAttendance(sessionId, markerId, dto);

    await this.prisma.attendanceSession.upsert({
      where: { sessionId },
      create: {
        sessionId,
        classId: session.classId,
        status: AttendanceSessionStatus.DRAFT,
        createdById: markerId,
      },
      update: {
        status: AttendanceSessionStatus.DRAFT,
      },
    });

    return {
      message: 'Đã lưu bản nháp điểm danh thành công',
      count: result.count,
    };
  }

  /**
   * Chốt điểm danh của buổi học (CLOSED)
   */
  async closeAttendanceSession(
    sessionId: string,
    userId: string,
    dto?: CloseAttendanceSessionDto,
  ) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
    }

    const attSession = await this.prisma.attendanceSession.upsert({
      where: { sessionId },
      create: {
        sessionId,
        classId: session.classId,
        status: AttendanceSessionStatus.CLOSED,
        closedAt: new Date(),
        closedById: userId,
        notes: dto?.note,
        createdById: userId,
      },
      update: {
        status: AttendanceSessionStatus.CLOSED,
        closedAt: new Date(),
        closedById: userId,
        notes: dto?.note,
      },
    });

    return {
      message: 'Chốt điểm danh buổi học thành công',
      attendanceSession: attSession,
    };
  }

  /**
   * Đánh dấu tất cả học sinh trong lớp là có mặt (PRESENT), vẫn cho phép chỉnh sửa từng em
   */
  async markAllPresent(
    sessionId: string,
    markerId: string,
    dto: MarkAllPresentDto,
  ) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { attendanceSession: true },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy buổi học với ID ${sessionId}`);
    }

    if (session.attendanceSession?.status === AttendanceSessionStatus.CLOSED) {
      throw new BadRequestException(
        'Phiên điểm danh này đã được chốt (CLOSED). Không thể sửa trực tiếp',
      );
    }

    if (session.status === SessionStatus.CANCELLED) {
      throw new BadRequestException('Buổi học đã bị hủy');
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        classId: session.classId,
        status: MemberStatus.ACTIVE,
      },
      select: { studentId: true },
    });

    if (enrollments.length === 0) {
      return { message: 'Lớp học chưa có học sinh', count: 0 };
    }

    const studentIds = enrollments.map((e) => e.studentId);
    const now = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.attendance.findMany({
        where: { sessionId, studentId: { in: studentIds } },
      });
      const existingMap = new Map(existing.map((e) => [e.studentId, e]));

      let count = 0;
      for (const sid of studentIds) {
        const cur = existingMap.get(sid);
        if (!cur) {
          await tx.attendance.create({
            data: {
              sessionId,
              studentId: sid,
              status: AttendanceStatus.PRESENT,
              checkedInAt: now,
              markedById: markerId,
              note: dto.note,
            },
          });
          count++;
        } else if (dto.overrideExisting || cur.status === AttendanceStatus.NOT_MARKED) {
          if (cur.status !== AttendanceStatus.PRESENT) {
            await tx.attendance.update({
              where: { id: cur.id },
              data: {
                status: AttendanceStatus.PRESENT,
                checkedInAt: cur.checkedInAt ?? now,
                markedById: markerId,
                note: dto.note ?? cur.note,
              },
            });
            await tx.attendanceChangeLog.create({
              data: {
                attendanceId: cur.id,
                oldStatus: cur.status,
                newStatus: AttendanceStatus.PRESENT,
                changedById: markerId,
                reason: 'Đánh dấu có mặt hàng loạt',
              },
            });
            count++;
          }
        }
      }

      return count;
    });

    return {
      message: `Đã đánh dấu có mặt cho ${result} học sinh`,
      count: result,
    };
  }

  /**
   * Ghi nhận hoặc cập nhật điểm danh hàng loạt (Batch Upsert) cho buổi học
   */
  async batchSaveAttendance(
    sessionId: string,
    markerId: string,
    dto: BatchAttendanceDto,
  ) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { attendanceSession: true },
    });

    if (!session) {
      throw new NotFoundException(
        `Không tìm thấy buổi học với ID ${sessionId}`,
      );
    }

    if (session.status === SessionStatus.CANCELLED) {
      throw new BadRequestException(
        'Không thể điểm danh cho buổi học đã bị hủy (CANCELLED)',
      );
    }

    if (session.attendanceSession?.status === AttendanceSessionStatus.CLOSED) {
      throw new BadRequestException(
        'Phiên điểm danh này đã được chốt (CLOSED). Không thể chỉnh sửa trực tiếp',
      );
    }

    // Không đánh dấu vắng khi buổi học còn diễn ra
    const now = new Date();
    const isOngoing =
      session.status === SessionStatus.IN_PROGRESS ||
      (session.status === SessionStatus.SCHEDULED &&
        session.endTime &&
        now < new Date(session.endTime));

    if (isOngoing) {
      const hasAbsent = dto.records.some(
        (r) =>
          r.status === AttendanceStatus.ABSENT ||
          r.status === AttendanceStatus.UNEXCUSED_ABSENT,
      );
      if (hasAbsent) {
        throw new BadRequestException(
          'Không thể đánh dấu vắng (ABSENT) khi buổi học đang diễn ra',
        );
      }
    }

    // 1. Kiểm tra tính hợp lệ của tất cả học sinh trong danh sách: phải thuộc lớp của session
    const studentIds = [...new Set(dto.records.map((r) => r.studentId))];

    const validEnrollments = await this.prisma.enrollment.findMany({
      where: {
        classId: session.classId,
        studentId: { in: studentIds },
      },
      select: { studentId: true, status: true },
    });

    const enrolledStudentIds = new Set(
      validEnrollments.map((e) => e.studentId),
    );

    for (const sid of studentIds) {
      if (!enrolledStudentIds.has(sid)) {
        throw new BadRequestException(
          `Học sinh với ID ${sid} không có hồ sơ ghi danh trong lớp học này`,
        );
      }
    }

    // 2. Thực hiện trong transaction
    const results = await this.prisma.$transaction(async (tx) => {
      // Đọc các bản ghi điểm danh hiện tại ngay trong transaction để đảm bảo isolation
      const existingAttendances = await tx.attendance.findMany({
        where: {
          sessionId,
          studentId: { in: studentIds },
        },
      });

      const existingMap = new Map<string, (typeof existingAttendances)[0]>();
      for (const att of existingAttendances) {
        existingMap.set(att.studentId, att);
      }

      const savedRecords = [];

      for (const record of dto.records) {
        const existing = existingMap.get(record.studentId);

        if (!existing) {
          // Tạo mới lần đầu -> Không ghi audit log giả
          const created = await tx.attendance.create({
            data: {
              sessionId,
              studentId: record.studentId,
              status: record.status,
              checkedInAt:
                record.checkedInAt ??
                (record.status === AttendanceStatus.PRESENT
                  ? new Date()
                  : null),
              markedById: markerId,
              note: record.note,
              isMakeUp: record.isMakeUp ?? false,
              originalSessionId: record.originalSessionId,
            },
          });
          savedRecords.push(created);
        } else {
          // Đã có -> Cập nhật. Nếu status thay đổi, ghi AttendanceChangeLog
          const updated = await tx.attendance.update({
            where: { id: existing.id },
            data: {
              status: record.status,
              checkedInAt:
                record.checkedInAt !== undefined
                  ? record.checkedInAt
                  : record.status === AttendanceStatus.PRESENT &&
                      !existing.checkedInAt
                    ? new Date()
                    : existing.checkedInAt,
              markedById: markerId,
              note: record.note !== undefined ? record.note : existing.note,
              isMakeUp:
                record.isMakeUp !== undefined
                  ? record.isMakeUp
                  : existing.isMakeUp,
              originalSessionId:
                record.originalSessionId !== undefined
                  ? record.originalSessionId
                  : existing.originalSessionId,
            },
          });

          if (existing.status !== record.status) {
            await tx.attendanceChangeLog.create({
              data: {
                attendanceId: existing.id,
                oldStatus: existing.status,
                newStatus: record.status,
                changedById: markerId,
                reason: 'Cập nhật từ danh sách điểm danh lớp học',
              },
            });
          }

          savedRecords.push(updated);
        }
      }

      return savedRecords;
    });

    return {
      message: `Đã lưu thành công ${results.length} bản ghi điểm danh`,
      count: results.length,
    };
  }

  /**
   * Lưu hoặc cập nhật điểm danh cho một học sinh trong buổi học
   */
  async saveSingleAttendance(
    sessionId: string,
    markerId: string,
    record: AttendanceRecordDto,
    role: UserRole = UserRole.TEACHER,
  ) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        attendanceSession: true,
        class: { select: { id: true, teacherId: true } },
      },
    });

    if (!session) {
      throw new NotFoundException(
        `Không tìm thấy buổi học với ID ${sessionId}`,
      );
    }

    if (role === UserRole.TEACHER && session.class.teacherId !== markerId) {
      throw new ForbiddenException(
        'Bạn không phải là giáo viên phụ trách của buổi học này',
      );
    }

    if (session.status === SessionStatus.CANCELLED) {
      throw new BadRequestException(
        'Không thể điểm danh cho buổi học đã bị hủy (CANCELLED)',
      );
    }

    if (session.attendanceSession?.status === AttendanceSessionStatus.CLOSED) {
      throw new BadRequestException(
        'Phiên điểm danh này đã được chốt (CLOSED). Không thể chỉnh sửa trực tiếp',
      );
    }

    // Không đánh dấu vắng khi buổi học còn diễn ra
    const now = new Date();
    const isOngoing =
      session.status === SessionStatus.IN_PROGRESS ||
      (session.status === SessionStatus.SCHEDULED &&
        session.endTime &&
        now < new Date(session.endTime));

    if (
      isOngoing &&
      (record.status === AttendanceStatus.ABSENT ||
        record.status === AttendanceStatus.UNEXCUSED_ABSENT)
    ) {
      throw new BadRequestException(
        'Không thể đánh dấu vắng (ABSENT) khi buổi học đang diễn ra',
      );
    }

    // Kiểm tra học sinh có ghi danh trong lớp
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        classId: session.classId,
        studentId: record.studentId,
      },
      select: { studentId: true, status: true },
    });

    if (!enrollment) {
      throw new BadRequestException(
        `Học sinh với ID ${record.studentId} không có hồ sơ ghi danh trong lớp học này`,
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      const existing = await tx.attendance.findUnique({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId: record.studentId,
          },
        },
      });

      if (!existing) {
        const created = await tx.attendance.create({
          data: {
            sessionId,
            studentId: record.studentId,
            status: record.status,
            checkedInAt:
              record.checkedInAt ??
              (record.status === AttendanceStatus.PRESENT ? new Date() : null),
            markedById: markerId,
            note: record.note,
            isMakeUp: record.isMakeUp ?? false,
            originalSessionId: record.originalSessionId,
          },
          include: {
            student: { select: { id: true, fullName: true, phone: true } },
            markedBy: { select: { id: true, fullName: true } },
          },
        });

        return {
          message: 'Lưu điểm danh học sinh thành công',
          attendance: created,
          created: true,
        };
      } else {
        const oldStatus = existing.status;
        const updated = await tx.attendance.update({
          where: { id: existing.id },
          data: {
            status: record.status,
            checkedInAt:
              record.checkedInAt !== undefined
                ? record.checkedInAt
                : record.status === AttendanceStatus.PRESENT &&
                    !existing.checkedInAt
                  ? new Date()
                  : existing.checkedInAt,
            markedById: markerId,
            note: record.note !== undefined ? record.note : existing.note,
            isMakeUp:
              record.isMakeUp !== undefined
                ? record.isMakeUp
                : existing.isMakeUp,
            originalSessionId:
              record.originalSessionId !== undefined
                ? record.originalSessionId
                : existing.originalSessionId,
          },
          include: {
            student: { select: { id: true, fullName: true, phone: true } },
            markedBy: { select: { id: true, fullName: true } },
          },
        });

        if (oldStatus !== record.status) {
          await tx.attendanceChangeLog.create({
            data: {
              attendanceId: existing.id,
              oldStatus,
              newStatus: record.status,
              changedById: markerId,
              reason: 'Cập nhật điểm danh học sinh',
            },
          });
        }

        return {
          message: 'Cập nhật điểm danh học sinh thành công',
          attendance: updated,
          created: false,
          statusChanged: oldStatus !== record.status,
        };
      }
    });
  }

  /**
   * Cập nhật một bản ghi điểm danh đơn lẻ và ghi nhận Audit Log
   */
  async updateAttendance(
    attendanceId: string,
    editorId: string,
    dto: UpdateAttendanceDto,
    editorRole: UserRole = UserRole.ADMIN,
  ) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        session: {
          select: {
            id: true,
            status: true,
            endTime: true,
            class: { select: { teacherId: true } },
            attendanceSession: { select: { status: true } },
          },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException(
        `Không tìm thấy bản ghi điểm danh với ID ${attendanceId}`,
      );
    }

    if (
      editorRole === UserRole.TEACHER &&
      attendance.session.class?.teacherId !== editorId
    ) {
      throw new ForbiddenException(
        'Bạn không phải là giáo viên phụ trách của buổi học này',
      );
    }

    if (attendance.session.status === SessionStatus.CANCELLED) {
      throw new BadRequestException(
        'Không thể chỉnh sửa điểm danh của buổi học đã bị hủy (CANCELLED)',
      );
    }

    if (
      attendance.session.attendanceSession?.status ===
      AttendanceSessionStatus.CLOSED
    ) {
      throw new BadRequestException(
        'Buổi học này đã được chốt điểm danh. Không thể sửa trực tiếp mà phải thông qua quy trình điều chỉnh',
      );
    }

    const oldStatus = attendance.status;
    const newStatus = dto.status;
    const isStatusChanged = oldStatus !== newStatus;

    // Không đánh dấu vắng khi buổi học còn diễn ra
    if (
      newStatus === AttendanceStatus.ABSENT ||
      newStatus === AttendanceStatus.UNEXCUSED_ABSENT
    ) {
      const now = new Date();
      const isOngoing =
        attendance.session.status === SessionStatus.IN_PROGRESS ||
        (attendance.session.status === SessionStatus.SCHEDULED &&
          attendance.session.endTime &&
          now < new Date(attendance.session.endTime));
      if (isOngoing) {
        throw new BadRequestException(
          'Không thể đánh dấu vắng (ABSENT) khi buổi học đang diễn ra',
        );
      }
    }

    // Transaction cập nhật attendance và ghi change log
    const updated = await this.prisma.$transaction(async (tx) => {
      const updateData: any = {
        status: newStatus,
        markedById: editorId,
      };

      if (dto.checkedInAt !== undefined) {
        updateData.checkedInAt = dto.checkedInAt;
      } else if (
        newStatus === AttendanceStatus.PRESENT &&
        !attendance.checkedInAt
      ) {
        updateData.checkedInAt = new Date();
      }

      if (dto.note !== undefined) {
        updateData.note = dto.note;
      }

      if (dto.isMakeUp !== undefined) {
        updateData.isMakeUp = dto.isMakeUp;
      }

      if (dto.originalSessionId !== undefined) {
        updateData.originalSessionId = dto.originalSessionId;
      }

      const res = await tx.attendance.update({
        where: { id: attendanceId },
        data: updateData,
        include: {
          student: {
            select: { id: true, fullName: true },
          },
        },
      });

      if (isStatusChanged) {
        await tx.attendanceChangeLog.create({
          data: {
            attendanceId,
            oldStatus,
            newStatus,
            changedById: editorId,
            reason: dto.reason ?? 'Cập nhật trạng thái điểm danh',
          },
        });
      }

      return res;
    });

    return {
      message: 'Cập nhật điểm danh thành công',
      attendance: updated,
      statusChanged: isStatusChanged,
    };
  }

  /**
   * Lịch sử điểm danh theo lớp, học sinh, tháng hoặc khoảng ngày
   */
  async getClassAttendanceHistory(
    classId: string,
    query: QueryAttendanceHistoryDto,
  ) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const sessionWhere: Prisma.ClassSessionWhereInput = {
      classId,
    };

    if (query.year && query.month) {
      const start = new Date(query.year, query.month - 1, 1, 0, 0, 0);
      const end = new Date(query.year, query.month, 0, 23, 59, 59, 999);
      sessionWhere.startTime = { gte: start, lte: end };
    } else if (query.startDate && query.endDate) {
      const start = new Date(query.startDate);
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      sessionWhere.startTime = { gte: start, lte: end };
    }

    const where: Prisma.AttendanceWhereInput = {
      session: sessionWhere,
    };

    if (query.studentId) {
      where.studentId = query.studentId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            select: { id: true, fullName: true, phone: true, avatarUrl: true },
          },
          session: {
            select: {
              id: true,
              title: true,
              startTime: true,
              endTime: true,
              status: true,
            },
          },
          markedBy: {
            select: { id: true, fullName: true },
          },
          changeLogs: {
            include: { changedBy: { select: { fullName: true } } },
            orderBy: { changedAt: 'desc' },
          },
        },
        orderBy: { session: { startTime: 'desc' } },
      }),
      this.prisma.attendance.count({ where }),
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
   * Tổng hợp số buổi theo từng trạng thái theo lớp
   */
  async getClassAttendanceSummary(
    classId: string,
    query: QueryAttendanceHistoryDto,
  ) {
    const sessionWhere: Prisma.ClassSessionWhereInput = {
      classId,
    };

    if (query.year && query.month) {
      const start = new Date(query.year, query.month - 1, 1, 0, 0, 0);
      const end = new Date(query.year, query.month, 0, 23, 59, 59, 999);
      sessionWhere.startTime = { gte: start, lte: end };
    } else if (query.startDate && query.endDate) {
      const start = new Date(query.startDate);
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      sessionWhere.startTime = { gte: start, lte: end };
    }

    const where: Prisma.AttendanceWhereInput = {
      session: sessionWhere,
    };

    if (query.studentId) {
      where.studentId = query.studentId;
    }

    const counts = await this.prisma.attendance.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });

    const summary: Record<AttendanceStatus, number> = {
      [AttendanceStatus.PRESENT]: 0,
      [AttendanceStatus.LATE]: 0,
      [AttendanceStatus.EXCUSED_ABSENT]: 0,
      [AttendanceStatus.UNEXCUSED_ABSENT]: 0,
      [AttendanceStatus.NOT_MARKED]: 0,
      [AttendanceStatus.ABSENT]: 0,
    };

    let total = 0;
    for (const c of counts) {
      summary[c.status] = c._count._all;
      total += c._count._all;
    }

    return {
      classId,
      totalRecords: total,
      summary,
    };
  }

  /**
   * Danh sách yêu cầu điều chỉnh điểm danh cho giáo viên hoặc ADMIN
   */
  async getCorrectionRequests(
    userId: string,
    userRole: UserRole,
    query: QueryCorrectionRequestsDto,
  ) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceCorrectionRequestWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.studentId) {
      where.studentId = query.studentId;
    }

    if (userRole === UserRole.TEACHER) {
      where.attendance = {
        session: {
          class: {
            teacherId: userId,
            ...(query.classId ? { id: query.classId } : {}),
          },
        },
      };
    } else if (query.classId) {
      where.attendance = {
        session: {
          classId: query.classId,
        },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.attendanceCorrectionRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            select: { id: true, fullName: true, phone: true, avatarUrl: true },
          },
          attendance: {
            include: {
              session: {
                select: {
                  id: true,
                  title: true,
                  startTime: true,
                  endTime: true,
                  class: { select: { id: true, name: true } },
                },
              },
            },
          },
          reviewedBy: {
            select: { id: true, fullName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendanceCorrectionRequest.count({ where }),
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
   * Duyệt hoặc từ chối yêu cầu điều chỉnh điểm danh
   */
  async reviewCorrectionRequest(
    requestId: string,
    reviewerId: string,
    reviewerRole: UserRole,
    dto: ReviewCorrectionRequestDto,
  ) {
    const request = await this.prisma.attendanceCorrectionRequest.findUnique({
      where: { id: requestId },
      include: {
        attendance: {
          include: {
            session: {
              include: { class: { select: { teacherId: true, id: true } } },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(
        `Không tìm thấy yêu cầu điều chỉnh với ID ${requestId}`,
      );
    }

    if (
      reviewerRole === UserRole.TEACHER &&
      request.attendance.session.class.teacherId !== reviewerId
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền xử lý yêu cầu của lớp học này',
      );
    }

    if (request.status !== CorrectionRequestStatus.PENDING) {
      throw new BadRequestException(
        `Yêu cầu này đã được xử lý trước đó với trạng thái ${request.status}`,
      );
    }

    if (
      dto.status === CorrectionRequestStatus.REJECTED &&
      (!dto.reviewNote || dto.reviewNote.trim().length === 0)
    ) {
      throw new BadRequestException(
        'Cần cung cấp lý do từ chối (reviewNote) cho học sinh',
      );
    }

    // Xử lý trong transaction để chống race conditions
    return this.prisma.$transaction(async (tx) => {
      // Re-read with row isolation
      const currentReq = await tx.attendanceCorrectionRequest.findUnique({
        where: { id: requestId },
      });
      if (currentReq?.status !== CorrectionRequestStatus.PENDING) {
        throw new ConflictException('Yêu cầu đã được xử lý bởi người khác');
      }

      const updatedRequest = await tx.attendanceCorrectionRequest.update({
        where: { id: requestId },
        data: {
          status: dto.status,
          reviewNote: dto.reviewNote,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
      });

      if (dto.status === CorrectionRequestStatus.APPROVED) {
        const oldStatus = request.attendance.status;
        const newStatus = request.requestedStatus;

        await tx.attendance.update({
          where: { id: request.attendanceId },
          data: {
            status: newStatus,
            markedById: reviewerId,
            checkedInAt:
              newStatus === AttendanceStatus.PRESENT &&
              !request.attendance.checkedInAt
                ? new Date()
                : request.attendance.checkedInAt,
          },
        });

        await tx.attendanceChangeLog.create({
          data: {
            attendanceId: request.attendanceId,
            oldStatus,
            newStatus,
            changedById: reviewerId,
            reason: `Phê duyệt yêu cầu điều chỉnh (${request.reason})` + (dto.reviewNote ? `: ${dto.reviewNote}` : ''),
          },
        });
      }

      return {
        message:
          dto.status === CorrectionRequestStatus.APPROVED
            ? 'Đã duyệt yêu cầu điều chỉnh điểm danh thành công'
            : 'Đã từ chối yêu cầu điều chỉnh',
        request: updatedRequest,
      };
    });
  }

  /**
   * Chốt tổng kết điểm danh và tính học phí tháng (Snapshot độc lập)
   */
  async closeMonthlySummary(
    classId: string,
    userId: string,
    dto: CloseMonthlySummaryDto,
  ) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        attendanceConfig: true,
      },
    });

    if (!classEntity) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${classId}`);
    }

    const { billingYear, billingMonth, note } = dto;
    const startDate = new Date(billingYear, billingMonth - 1, 1, 0, 0, 0);
    const endDate = new Date(billingYear, billingMonth, 0, 23, 59, 59, 999);

    const config = classEntity.attendanceConfig ?? {
      chargePresent: true,
      chargeLate: true,
      chargeExcusedAbsent: false,
      chargeUnexcusedAbsent: false,
    };

    // Lấy tất cả thành viên lớp có tham gia trong tháng
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        classId,
        joinedAt: { lte: endDate },
      },
    });

    // Lấy tất cả các buổi học trong tháng
    const sessions = await this.prisma.classSession.findMany({
      where: {
        classId,
        startTime: { gte: startDate, lte: endDate },
      },
      include: {
        attendances: true,
      },
    });

    const now = new Date();

    const snapshots = await this.prisma.$transaction(async (tx) => {
      const results = [];

      for (const enr of enrollments) {
        let presentCount = 0;
        let lateCount = 0;
        let excusedCount = 0;
        let unexcusedCount = 0;
        let notMarkedCount = 0;

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

        let chargeableSessions = 0;
        if (config.chargePresent) chargeableSessions += presentCount;
        if (config.chargeLate) chargeableSessions += lateCount;
        if (config.chargeExcusedAbsent) chargeableSessions += excusedCount;
        if (config.chargeUnexcusedAbsent) chargeableSessions += unexcusedCount;

        const effectiveTuition =
          enr.tuitionOverride ?? classEntity.monthlyTuition;

        const summary = await tx.monthlyAttendanceSummary.upsert({
          where: {
            classId_studentId_billingYear_billingMonth: {
              classId,
              studentId: enr.studentId,
              billingYear,
              billingMonth,
            },
          },
          create: {
            classId,
            studentId: enr.studentId,
            enrollmentId: enr.id,
            billingYear,
            billingMonth,
            totalSessions: sessions.length,
            presentCount,
            lateCount,
            excusedAbsentCount: excusedCount,
            unexcusedAbsentCount: unexcusedCount,
            notMarkedCount,
            chargeableSessions,
            tuitionAmount: effectiveTuition,
            isClosed: true,
            closedAt: now,
            closedById: userId,
            note,
          },
          update: {
            totalSessions: sessions.length,
            presentCount,
            lateCount,
            excusedAbsentCount: excusedCount,
            unexcusedAbsentCount: unexcusedCount,
            notMarkedCount,
            chargeableSessions,
            tuitionAmount: effectiveTuition,
            isClosed: true,
            closedAt: now,
            closedById: userId,
            note,
          },
        });

        results.push(summary);
      }

      return results;
    });

    return {
      message: `Đã chốt tổng kết tháng ${billingMonth}/${billingYear} cho ${snapshots.length} học sinh`,
      count: snapshots.length,
      snapshots,
    };
  }

  /**
   * Xem bảng tổng hợp tháng
   */
  async getMonthlySummary(classId: string, query: QueryMonthlySummaryDto) {
    const { billingYear, billingMonth } = query;

    const summaries = await this.prisma.monthlyAttendanceSummary.findMany({
      where: {
        classId,
        billingYear,
        billingMonth,
      },
      include: {
        student: { select: { id: true, fullName: true, phone: true } },
        closedBy: { select: { id: true, fullName: true } },
      },
      orderBy: { student: { fullName: 'asc' } },
    });

    return {
      classId,
      billingYear,
      billingMonth,
      isClosed: summaries.length > 0 && summaries.every((s) => s.isClosed),
      items: summaries,
    };
  }

  /**
   * Cấu hình tính phí & lưu trữ lớp học
   */
  async getClassAttendanceConfig(classId: string) {
    let config = await this.prisma.classAttendanceConfig.findUnique({
      where: { classId },
    });

    if (!config) {
      config = await this.prisma.classAttendanceConfig.create({
        data: {
          classId,
          chargePresent: true,
          chargeLate: true,
          chargeExcusedAbsent: false,
          chargeUnexcusedAbsent: false,
          allowMakeUpSession: true,
          retentionDays: 60,
        },
      });
    }

    return config;
  }

  async updateClassAttendanceConfig(
    classId: string,
    dto: UpdateAttendanceConfigDto,
  ) {
    const config = await this.prisma.classAttendanceConfig.upsert({
      where: { classId },
      create: {
        classId,
        chargePresent: dto.chargePresent ?? true,
        chargeLate: dto.chargeLate ?? true,
        chargeExcusedAbsent: dto.chargeExcusedAbsent ?? false,
        chargeUnexcusedAbsent: dto.chargeUnexcusedAbsent ?? false,
        allowMakeUpSession: dto.allowMakeUpSession ?? true,
        retentionDays: dto.retentionDays ?? 60,
      },
      update: {
        ...(dto.chargePresent !== undefined && { chargePresent: dto.chargePresent }),
        ...(dto.chargeLate !== undefined && { chargeLate: dto.chargeLate }),
        ...(dto.chargeExcusedAbsent !== undefined && { chargeExcusedAbsent: dto.chargeExcusedAbsent }),
        ...(dto.chargeUnexcusedAbsent !== undefined && { chargeUnexcusedAbsent: dto.chargeUnexcusedAbsent }),
        ...(dto.allowMakeUpSession !== undefined && { allowMakeUpSession: dto.allowMakeUpSession }),
        ...(dto.retentionDays !== undefined && { retentionDays: dto.retentionDays }),
      },
    });

    return {
      message: 'Cập nhật cấu hình điểm danh và tính phí thành công',
      config,
    };
  }

  // ==================== API DÀNH CHO HỌC SINH ====================

  /**
   * Học sinh xem lịch sử điểm danh của chính mình
   */
  async getStudentAttendanceHistory(
    studentId: string,
    query: QueryStudentAttendanceDto,
  ) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    // Kiểm tra học sinh có thuộc classId nếu được chỉ định
    if (query.classId) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          classId: query.classId,
          studentId,
        },
      });
      if (!enrollment) {
        throw new ForbiddenException(
          'Bạn không tham gia lớp học này hoặc không có quyền truy cập',
        );
      }
    }

    const sessionWhere: Prisma.ClassSessionWhereInput = {};

    if (query.classId) {
      sessionWhere.classId = query.classId;
    }

    if (query.year && query.month) {
      const start = new Date(query.year, query.month - 1, 1, 0, 0, 0);
      const end = new Date(query.year, query.month, 0, 23, 59, 59, 999);
      sessionWhere.startTime = { gte: start, lte: end };
    } else if (query.startDate && query.endDate) {
      const start = new Date(query.startDate);
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      sessionWhere.startTime = { gte: start, lte: end };
    }

    const where: Prisma.AttendanceWhereInput = {
      studentId, // IDOR Safe: chỉ xem dữ liệu của chính mình
    };

    if (Object.keys(sessionWhere).length > 0) {
      where.session = sessionWhere;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        include: {
          session: {
            select: {
              id: true,
              title: true,
              startTime: true,
              endTime: true,
              status: true,
              class: { select: { id: true, name: true } },
            },
          },
          correctionRequests: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { session: { startTime: 'desc' } },
      }),
      this.prisma.attendance.count({ where }),
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
   * Học sinh xem tổng hợp số buổi theo từng trạng thái
   */
  async getStudentAttendanceSummary(
    studentId: string,
    query: QueryStudentAttendanceDto,
  ) {
    if (query.classId) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: { classId: query.classId, studentId },
      });
      if (!enrollment) {
        throw new ForbiddenException('Bạn không tham gia lớp học này');
      }
    }

    const sessionWhere: Prisma.ClassSessionWhereInput = {};

    if (query.classId) {
      sessionWhere.classId = query.classId;
    }

    if (query.year && query.month) {
      const start = new Date(query.year, query.month - 1, 1, 0, 0, 0);
      const end = new Date(query.year, query.month, 0, 23, 59, 59, 999);
      sessionWhere.startTime = { gte: start, lte: end };
    } else if (query.startDate && query.endDate) {
      const start = new Date(query.startDate);
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      sessionWhere.startTime = { gte: start, lte: end };
    }

    const where: Prisma.AttendanceWhereInput = {
      studentId,
    };

    if (Object.keys(sessionWhere).length > 0) {
      where.session = sessionWhere;
    }

    const counts = await this.prisma.attendance.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });

    const summary: Record<AttendanceStatus, number> = {
      [AttendanceStatus.PRESENT]: 0,
      [AttendanceStatus.LATE]: 0,
      [AttendanceStatus.EXCUSED_ABSENT]: 0,
      [AttendanceStatus.UNEXCUSED_ABSENT]: 0,
      [AttendanceStatus.NOT_MARKED]: 0,
      [AttendanceStatus.ABSENT]: 0,
    };

    let total = 0;
    for (const c of counts) {
      summary[c.status] = c._count._all;
      total += c._count._all;
    }

    return {
      studentId,
      totalSessions: total,
      summary,
    };
  }

  /**
   * Học sinh gửi yêu cầu điều chỉnh trạng thái điểm danh
   */
  async createStudentCorrectionRequest(
    studentId: string,
    dto: CreateCorrectionRequestDto,
  ) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: dto.attendanceId },
      include: { session: true },
    });

    if (!attendance) {
      throw new NotFoundException(
        `Không tìm thấy bản ghi điểm danh với ID ${dto.attendanceId}`,
      );
    }

    // Anti-IDOR: chỉ được xin điều chỉnh bản ghi của chính mình
    if (attendance.studentId !== studentId) {
      throw new ForbiddenException(
        'Bạn chỉ được phép gửi yêu cầu điều chỉnh điểm danh của chính mình',
      );
    }

    // Chống gửi trùng: nếu đã có yêu cầu PENDING cho bản ghi này
    const existingPending =
      await this.prisma.attendanceCorrectionRequest.findFirst({
        where: {
          attendanceId: dto.attendanceId,
          studentId,
          status: CorrectionRequestStatus.PENDING,
        },
      });

    if (existingPending) {
      throw new ConflictException(
        'Bạn đã có một yêu cầu điều chỉnh đang chờ xử lý cho buổi học này',
      );
    }

    const request = await this.prisma.attendanceCorrectionRequest.create({
      data: {
        attendanceId: dto.attendanceId,
        studentId,
        requestedStatus: dto.requestedStatus,
        reason: dto.reason,
        evidenceUrl: dto.evidenceUrl,
        status: CorrectionRequestStatus.PENDING,
      },
      include: {
        attendance: {
          include: {
            session: {
              select: { id: true, title: true, startTime: true },
            },
          },
        },
      },
    });

    return {
      message: 'Gửi yêu cầu điều chỉnh điểm danh thành công',
      request,
    };
  }

  /**
   * Học sinh xem danh sách yêu cầu điều chỉnh của bản thân
   */
  async getStudentCorrectionRequests(
    studentId: string,
    query: QueryCorrectionRequestsDto,
  ) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceCorrectionRequestWhereInput = {
      studentId, // IDOR Safe
    };

    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.attendanceCorrectionRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          attendance: {
            include: {
              session: {
                select: {
                  id: true,
                  title: true,
                  startTime: true,
                  class: { select: { id: true, name: true } },
                },
              },
            },
          },
          reviewedBy: {
            select: { id: true, fullName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendanceCorrectionRequest.count({ where }),
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
}
