import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  UserRole,
  ClassStatus,
  MemberStatus,
  SessionStatus,
} from '../../generated/prisma/client.js';
import type { TeacherCreateClassDto } from './dto/teacher-create-class.dto.js';
import type { TeacherUpdateClassDto } from './dto/teacher-update-class.dto.js';
import type { TeacherUpdateClassStatusDto } from './dto/teacher-update-class-status.dto.js';
import type { QueryTeacherClassesDto } from './dto/query-teacher-classes.dto.js';
import type { QueryClassMembersDto } from './dto/query-class-members.dto.js';
import type { QueryJoinRequestsDto } from './dto/query-join-requests.dto.js';

@Injectable()
export class TeacherClassesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sinh mã joinCode an toàn gồm 8 ký tự chữ cái hoa và chữ số (loại bỏ ký tự dễ nhầm lẫn)
   */
  private generateJoinCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const bytes = randomBytes(8);
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[bytes[i] % chars.length];
    }
    return code;
  }

  /**
   * Sinh joinCode duy nhất trong cơ sở dữ liệu
   */
  private async generateUniqueJoinCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = this.generateJoinCode();
      const existing = await this.prisma.class.findUnique({
        where: { joinCode: code },
        select: { id: true },
      });
      if (!existing) {
        return code;
      }
    }
    // Nếu trùng 5 lần liên tiếp (xác suất cực thấp), ghép timestamp
    return `${this.generateJoinCode()}${Date.now().toString(36).toUpperCase()}`.slice(
      0,
      10,
    );
  }

  /**
   * Xác minh lớp học tồn tại và thuộc quyền sở hữu của giáo viên
   */
  private async verifyClassOwnership(teacherId: string, classId: string) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classEntity) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${classId}`);
    }

    if (classEntity.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền quản lý lớp học này');
    }

    return classEntity;
  }

  /**
   * Giáo viên tạo lớp học mới
   */
  async createClass(teacherId: string, dto: TeacherCreateClassDto) {
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
      select: { id: true, role: true, isActive: true },
    });

    if (!teacher || !teacher.isActive) {
      throw new BadRequestException(
        'Tài khoản giáo viên không tồn tại hoặc đã bị vô hiệu hóa',
      );
    }

    if (teacher.role !== UserRole.TEACHER) {
      throw new ForbiddenException(
        'Chỉ tài khoản TEACHER mới có quyền tạo lớp học',
      );
    }

    const joinCode = await this.generateUniqueJoinCode();
    const monthlyTuition =
      dto.monthlyTuition !== undefined
        ? new Prisma.Decimal(dto.monthlyTuition)
        : new Prisma.Decimal(0);

    const newClass = await this.prisma.class.create({
      data: {
        name: dto.name,
        description: dto.description,
        joinCode,
        maxStudents: dto.maxStudents ?? null,
        defaultMeetUrl: dto.defaultMeetUrl,
        monthlyTuition,
        status: ClassStatus.ACTIVE,
        teacherId,
        createdById: teacherId,
      },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      message: 'Tạo lớp học thành công',
      class: newClass,
    };
  }

  /**
   * Giáo viên xem danh sách các lớp học của mình
   * Ưu tiên sắp xếp:
   * 1. Lớp có buổi học đang diễn ra (IN_PROGRESS)
   * 2. Lớp có buổi học sắp tới gần nhất (SCHEDULED, endTime >= now), startTime ASC
   * 3. Lớp không có buổi học sắp tới (ACTIVE trước, sau đó trạng thái khác), createdAt DESC
   * Tie-breaker: startTime ASC, createdAt DESC, name ASC, id ASC
   */
  async getMyClasses(teacherId: string, query: QueryTeacherClassesDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;
    const now = new Date();

    const statusClause = query.status
      ? Prisma.sql`AND c.status = ${query.status}::"ClassStatus"`
      : Prisma.empty;

    const searchClause = query.search
      ? Prisma.sql`AND (c.name ILIKE ${`%${query.search}%`} OR c."joinCode" ILIKE ${`%${query.search}%`} OR c.description ILIKE ${`%${query.search}%`})`
      : Prisma.empty;

    const [countResult, rows] = await Promise.all([
      this.prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*)::int AS count
        FROM "Class" c
        WHERE c."teacherId" = ${teacherId}
          ${statusClause}
          ${searchClause}
      `,
      this.prisma.$queryRaw<
        Array<{
          id: string;
          name: string;
          description: string | null;
          classCode: string;
          joinCode: string;
          maxStudents: number | null;
          defaultMeetUrl: string | null;
          monthlyTuition: any;
          status: ClassStatus;
          createdById: string;
          teacherId: string;
          createdAt: Date;
          updatedAt: Date;
          activeStudentCount: number;
          totalSessionsCount: number;
          nextSession_id: string | null;
          nextSession_title: string | null;
          nextSession_description: string | null;
          nextSession_startTime: Date | null;
          nextSession_endTime: Date | null;
          nextSession_status: SessionStatus | null;
        }>
      >`
        WITH candidate_sessions AS (
          SELECT 
            cs.id,
            cs."classId",
            cs.title,
            cs.description,
            cs."startTime",
            cs."endTime",
            cs.status,
            ROW_NUMBER() OVER (
              PARTITION BY cs."classId" 
              ORDER BY 
                CASE WHEN cs.status = 'IN_PROGRESS' THEN 1 ELSE 2 END,
                cs."startTime" ASC,
                cs.id ASC
            ) as rn
          FROM "ClassSession" cs
          JOIN "Class" c ON cs."classId" = c.id
          WHERE c."teacherId" = ${teacherId}
            AND (
              cs.status = 'IN_PROGRESS'
              OR (cs.status = 'SCHEDULED' AND cs."endTime" >= ${now})
            )
        ),
        next_sessions AS (
          SELECT * FROM candidate_sessions WHERE rn = 1
        )
        SELECT 
          c.id,
          c.name,
          c.description,
          c."classCode",
          c."joinCode",
          c."maxStudents",
          c."defaultMeetUrl",
          c."monthlyTuition",
          c.status,
          c."createdById",
          c."teacherId",
          c."createdAt",
          c."updatedAt",
          (SELECT COUNT(*)::int FROM "ClassMember" cm WHERE cm."classId" = c.id AND cm.status = 'ACTIVE') AS "activeStudentCount",
          (SELECT COUNT(*)::int FROM "ClassSession" cs WHERE cs."classId" = c.id) AS "totalSessionsCount",
          ns.id AS "nextSession_id",
          ns.title AS "nextSession_title",
          ns.description AS "nextSession_description",
          ns."startTime" AS "nextSession_startTime",
          ns."endTime" AS "nextSession_endTime",
          ns.status AS "nextSession_status",
          CASE 
            WHEN ns.status = 'IN_PROGRESS' THEN 1
            WHEN ns.id IS NOT NULL THEN 2
            WHEN c.status = 'ACTIVE' THEN 3
            ELSE 4
          END AS priority_score
        FROM "Class" c
        LEFT JOIN next_sessions ns ON ns."classId" = c.id
        WHERE c."teacherId" = ${teacherId}
          ${statusClause}
          ${searchClause}
        ORDER BY 
          priority_score ASC,
          ns."startTime" ASC NULLS LAST,
          c."createdAt" DESC,
          c.name ASC,
          c.id ASC
        LIMIT ${limit} OFFSET ${skip}
      `,
    ]);

    const total = countResult[0]?.count ?? 0;

    const formattedItems = rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      classCode: row.classCode,
      joinCode: row.joinCode,
      maxStudents: row.maxStudents,
      defaultMeetUrl: row.defaultMeetUrl,
      monthlyTuition:
        row.monthlyTuition instanceof Prisma.Decimal
          ? row.monthlyTuition
          : new Prisma.Decimal(row.monthlyTuition ?? 0),
      status: row.status,
      createdById: row.createdById,
      teacherId: row.teacherId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      _count: {
        members: Number(row.activeStudentCount),
        sessions: Number(row.totalSessionsCount),
      },
      activeStudentCount: Number(row.activeStudentCount),
      nextSession: row.nextSession_id
        ? {
            id: row.nextSession_id,
            title: row.nextSession_title,
            description: row.nextSession_description,
            startTime: row.nextSession_startTime,
            endTime: row.nextSession_endTime,
            status: row.nextSession_status,
          }
        : null,
    }));

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
   * Giáo viên xem chi tiết một lớp học
   */
  async getClassDetail(teacherId: string, classId: string) {
    const classEntity = await this.verifyClassOwnership(teacherId, classId);

    const now = new Date();
    const [
      activeCount,
      pendingCount,
      sessionCount,
      liveSession,
      nextScheduledSession,
    ] = await Promise.all([
      this.prisma.enrollment.count({
        where: { classId, status: MemberStatus.ACTIVE },
      }),
      this.prisma.enrollment.count({
        where: { classId, status: MemberStatus.PENDING },
      }),
      this.prisma.classSession.count({
        where: { classId },
      }),
      this.prisma.classSession.findFirst({
        where: {
          classId,
          status: SessionStatus.IN_PROGRESS,
        },
        select: {
          id: true,
          title: true,
          description: true,
          startTime: true,
          endTime: true,
          status: true,
        },
      }),
      this.prisma.classSession.findFirst({
        where: {
          classId,
          status: SessionStatus.SCHEDULED,
          endTime: { gte: now },
        },
        orderBy: { startTime: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          startTime: true,
          endTime: true,
          status: true,
        },
      }),
    ]);

    const nextSession = liveSession ?? nextScheduledSession ?? null;

    return {
      ...classEntity,
      activeStudentCount: activeCount,
      pendingRequestsCount: pendingCount,
      totalSessionsCount: sessionCount,
      nextSession,
    };
  }

  /**
   * Giáo viên cập nhật thông tin lớp học
   */
  async updateClass(
    teacherId: string,
    classId: string,
    dto: TeacherUpdateClassDto,
  ) {
    await this.verifyClassOwnership(teacherId, classId);

    const data: Prisma.ClassUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
    }
    if (dto.description !== undefined) {
      data.description = dto.description;
    }
    if (dto.defaultMeetUrl !== undefined) {
      data.defaultMeetUrl = dto.defaultMeetUrl;
    }
    if (dto.monthlyTuition !== undefined) {
      data.monthlyTuition = new Prisma.Decimal(dto.monthlyTuition);
    }
    if (dto.maxStudents !== undefined) {
      if (dto.maxStudents !== null) {
        const currentActive = await this.prisma.enrollment.count({
          where: { classId, status: MemberStatus.ACTIVE },
        });
        if (dto.maxStudents < currentActive) {
          throw new BadRequestException(
            `Số lượng học sinh tối đa (${dto.maxStudents}) không thể nhỏ hơn số học sinh đang hoạt động (${currentActive})`,
          );
        }
      }
      data.maxStudents = dto.maxStudents;
    }

    const updated = await this.prisma.class.update({
      where: { id: classId },
      data,
    });

    return {
      message: 'Cập nhật thông tin lớp học thành công',
      class: updated,
    };
  }

  /**
   * Giáo viên cập nhật trạng thái lớp (ACTIVE / CLOSED / INACTIVE / COMPLETED)
   */
  async updateClassStatus(
    teacherId: string,
    classId: string,
    dto: TeacherUpdateClassStatusDto,
  ) {
    await this.verifyClassOwnership(teacherId, classId);

    const updated = await this.prisma.class.update({
      where: { id: classId },
      data: { status: dto.status },
    });

    return {
      message: `Cập nhật trạng thái lớp học thành ${dto.status} thành công`,
      class: updated,
    };
  }

  /**
   * Giáo viên tạo lại mã tham gia mới cho lớp
   */
  async regenerateJoinCode(teacherId: string, classId: string) {
    await this.verifyClassOwnership(teacherId, classId);

    const newJoinCode = await this.generateUniqueJoinCode();

    const updated = await this.prisma.class.update({
      where: { id: classId },
      data: { joinCode: newJoinCode },
      select: {
        id: true,
        name: true,
        joinCode: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Tạo lại mã tham gia thành công',
      class: updated,
    };
  }

  /**
   * Giáo viên xem danh sách học sinh thuộc lớp học
   */
  async getClassMembers(
    teacherId: string,
    classId: string,
    query: QueryClassMembersDto,
  ) {
    await this.verifyClassOwnership(teacherId, classId);

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Prisma.EnrollmentWhereInput = {
      classId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.student = {
        OR: [
          { fullName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              dateOfBirth: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [{ status: 'asc' }, { joinedAt: 'desc' }],
      }),
      this.prisma.enrollment.count({ where }),
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
   * Giáo viên xem danh sách các yêu cầu tham gia đang chờ duyệt (PENDING)
   */
  async getJoinRequests(
    teacherId: string,
    classId: string,
    query: QueryJoinRequestsDto,
  ) {
    await this.verifyClassOwnership(teacherId, classId);

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Prisma.EnrollmentWhereInput = {
      classId,
      status: MemberStatus.PENDING,
    };

    if (query.search) {
      where.student = {
        OR: [
          { fullName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              dateOfBirth: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { requestedAt: 'asc' },
      }),
      this.prisma.enrollment.count({ where }),
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
   * Giáo viên duyệt yêu cầu tham gia lớp (Transaction chống race condition và chống vượt maxStudents)
   */
  async approveJoinRequest(
    teacherId: string,
    classId: string,
    membershipId: string,
  ) {
    await this.verifyClassOwnership(teacherId, classId);

    return this.prisma.$transaction(async (tx) => {
      // 1. Khóa bản ghi Class bằng FOR UPDATE để chống race condition khi duyệt đồng thời
      const lockedClasses = await tx.$queryRaw<
        Array<{
          id: string;
          status: ClassStatus;
          maxStudents: number | null;
          teacherId: string;
        }>
      >`
        SELECT id, status, "maxStudents", "teacherId"
        FROM "Class"
        WHERE id = ${classId}
        FOR UPDATE
      `;

      if (!lockedClasses || lockedClasses.length === 0) {
        throw new NotFoundException(`Không tìm thấy lớp học với ID ${classId}`);
      }

      const lockedClass = lockedClasses[0];

      if (lockedClass.status === ClassStatus.CLOSED) {
        throw new BadRequestException(
          'Không thể duyệt học sinh vào lớp học đã đóng (CLOSED)',
        );
      }

      // 2. Kiểm tra bản ghi membership
      const membership = await tx.enrollment.findUnique({
        where: { id: membershipId },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              isActive: true,
            },
          },
        },
      });

      if (!membership || membership.classId !== classId) {
        throw new NotFoundException(
          `Không tìm thấy yêu cầu tham gia với ID ${membershipId}`,
        );
      }

      if (membership.status !== MemberStatus.PENDING) {
        throw new BadRequestException(
          `Yêu cầu tham gia không ở trạng thái chờ duyệt (PENDING). Trạng thái hiện tại: ${membership.status}`,
        );
      }

      if (!membership.student.isActive) {
        throw new BadRequestException(
          'Tài khoản học sinh này đã bị vô hiệu hóa',
        );
      }

      // 3. Kiểm tra xem học sinh đã có membership ACTIVE khác trong lớp chưa
      const existingActive = await tx.enrollment.findFirst({
        where: {
          classId,
          studentId: membership.studentId,
          status: MemberStatus.ACTIVE,
          id: { not: membershipId },
        },
      });

      if (existingActive) {
        throw new ConflictException(
          'Học sinh này đã là thành viên chính thức đang hoạt động của lớp',
        );
      }

      // 4. Kiểm tra maxStudents
      if (
        lockedClass.maxStudents !== null &&
        lockedClass.maxStudents !== undefined
      ) {
        const currentActiveCount = await tx.enrollment.count({
          where: {
            classId,
            status: MemberStatus.ACTIVE,
          },
        });

        if (currentActiveCount >= lockedClass.maxStudents) {
          throw new BadRequestException(
            `Lớp học đã đạt giới hạn số lượng học sinh tối đa (${lockedClass.maxStudents})`,
          );
        }
      }

      // 5. Cập nhật thành ACTIVE
      const updated = await tx.enrollment.update({
        where: { id: membershipId },
        data: {
          status: MemberStatus.ACTIVE,
          approvedAt: new Date(),
          joinedAt: new Date(),
        },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
        },
      });

      return {
        message: 'Duyệt yêu cầu tham gia lớp học thành công',
        membership: updated,
      };
    });
  }

  /**
   * Giáo viên từ chối yêu cầu tham gia lớp
   */
  async rejectJoinRequest(
    teacherId: string,
    classId: string,
    membershipId: string,
  ) {
    await this.verifyClassOwnership(teacherId, classId);

    const membership = await this.prisma.enrollment.findUnique({
      where: { id: membershipId },
    });

    if (!membership || membership.classId !== classId) {
      throw new NotFoundException(
        `Không tìm thấy yêu cầu tham gia với ID ${membershipId}`,
      );
    }

    if (membership.status !== MemberStatus.PENDING) {
      throw new BadRequestException(
        `Yêu cầu tham gia không ở trạng thái chờ duyệt (PENDING). Trạng thái hiện tại: ${membership.status}`,
      );
    }

    const updated = await this.prisma.enrollment.update({
      where: { id: membershipId },
      data: {
        status: MemberStatus.REJECTED,
        rejectedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      message: 'Đã từ chối yêu cầu tham gia lớp học',
      membership: updated,
    };
  }

  /**
   * Giáo viên xóa học sinh khỏi lớp học (Chuyển trạng thái sang REMOVED, bảo tồn lịch sử)
   */
  async removeMember(teacherId: string, classId: string, studentId: string) {
    await this.verifyClassOwnership(teacherId, classId);

    const activeMembership = await this.prisma.enrollment.findFirst({
      where: {
        classId,
        studentId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!activeMembership) {
      throw new NotFoundException(
        'Học sinh không phải là thành viên đang hoạt động của lớp học này',
      );
    }

    const updated = await this.prisma.enrollment.update({
      where: { id: activeMembership.id },
      data: {
        status: MemberStatus.REMOVED,
        leftAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return {
      message: 'Đã xóa học sinh khỏi lớp học thành công',
      membership: updated,
    };
  }
}
