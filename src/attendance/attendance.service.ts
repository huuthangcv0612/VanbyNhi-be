import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AttendanceStatus,
  MemberStatus,
  SessionStatus,
  UserRole,
} from '../../generated/prisma/client.js';
import type { BatchAttendanceDto } from './dto/batch-attendance.dto.js';
import type { UpdateAttendanceDto } from './dto/update-attendance.dto.js';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách điểm danh của một buổi học kèm danh sách học sinh của lớp
   */
  async getSessionAttendance(sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          select: { id: true, name: true },
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
    };

    let totalMarked = 0;
    for (const item of counts) {
      summary[item.status] = item._count._all;
      totalMarked += item._count._all;
    }

    return {
      sessionId,
      totalActiveStudents,
      totalMarked,
      unmarkedCount: Math.max(0, totalActiveStudents - totalMarked),
      summary,
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
   * Cập nhật một bản ghi điểm danh đơn lẻ và ghi nhận Audit Log
   */
  async updateAttendance(
    attendanceId: string,
    editorId: string,
    dto: UpdateAttendanceDto,
  ) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        session: { select: { id: true, status: true } },
      },
    });

    if (!attendance) {
      throw new NotFoundException(
        `Không tìm thấy bản ghi điểm danh với ID ${attendanceId}`,
      );
    }

    if (attendance.session.status === SessionStatus.CANCELLED) {
      throw new BadRequestException(
        'Không thể chỉnh sửa điểm danh của buổi học đã bị hủy (CANCELLED)',
      );
    }

    const oldStatus = attendance.status;
    const newStatus = dto.status;
    const isStatusChanged = oldStatus !== newStatus;

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
}
