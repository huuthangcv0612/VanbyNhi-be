import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  UserRole,
  ClassStatus,
  MemberStatus,
} from '../../generated/prisma/client.js';
import type { StudentJoinClassDto } from './dto/student-join-class.dto.js';
import type { QueryStudentClassesDto } from './dto/query-student-classes.dto.js';
import type { QueryStudentRequestsDto } from './dto/query-student-requests.dto.js';

@Injectable()
export class StudentClassesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Học sinh gửi yêu cầu tham gia lớp học bằng joinCode
   */
  async joinClass(studentId: string, dto: StudentJoinClassDto) {
    // 1. Kiểm tra tài khoản học sinh
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, role: true, isActive: true, fullName: true },
    });

    if (!student || !student.isActive) {
      throw new BadRequestException(
        'Tài khoản học sinh không tồn tại hoặc đã bị vô hiệu hóa',
      );
    }

    if (student.role !== UserRole.STUDENT) {
      throw new ForbiddenException(
        'Chỉ tài khoản STUDENT mới có thể gửi yêu cầu tham gia lớp học',
      );
    }

    // 2. Tìm lớp học theo joinCode
    const classEntity = await this.prisma.class.findUnique({
      where: { joinCode: dto.joinCode },
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

    if (!classEntity) {
      throw new NotFoundException(
        'Mã tham gia không chính xác hoặc lớp học không tồn tại',
      );
    }

    // 3. Kiểm tra trạng thái lớp học
    if (classEntity.status === ClassStatus.CLOSED) {
      throw new BadRequestException(
        'Lớp học đã đóng (CLOSED), không tiếp nhận thành viên mới',
      );
    }

    if (classEntity.status !== ClassStatus.ACTIVE) {
      throw new BadRequestException(
        'Lớp học không ở trạng thái mở tiếp nhận học sinh',
      );
    }

    // 4. Kiểm tra xem học sinh đã là thành viên ACTIVE chưa
    const existingActive = await this.prisma.enrollment.findFirst({
      where: {
        classId: classEntity.id,
        studentId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (existingActive) {
      throw new ConflictException(
        'Bạn đã là thành viên chính thức của lớp học này',
      );
    }

    // 5. Kiểm tra xem học sinh đã có yêu cầu PENDING chưa
    const existingPending = await this.prisma.enrollment.findFirst({
      where: {
        classId: classEntity.id,
        studentId,
        status: MemberStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new ConflictException(
        'Bạn đã gửi yêu cầu tham gia lớp này và đang chờ duyệt',
      );
    }

    // 6. Tạo bản ghi ghi danh ở trạng thái PENDING
    try {
      const membership = await this.prisma.enrollment.create({
        data: {
          classId: classEntity.id,
          studentId,
          status: MemberStatus.PENDING,
          requestedAt: new Date(),
        },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              description: true,
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
          },
        },
      });

      return {
        message: 'Gửi yêu cầu tham gia lớp học thành công',
        membership,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Bạn đã gửi yêu cầu tham gia hoặc đã là thành viên của lớp học này',
        );
      }
      throw error;
    }
  }

  /**
   * Học sinh xem danh sách lớp mình đã tham gia thành công (ACTIVE)
   */
  async getMyClasses(studentId: string, query: QueryStudentClassesDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Prisma.EnrollmentWhereInput = {
      studentId,
      status: MemberStatus.ACTIVE,
    };

    if (query.search) {
      where.class = {
        name: { contains: query.search, mode: 'insensitive' },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              defaultMeetUrl: true,
              monthlyTuition: true,
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
          },
        },
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    const formattedItems = items.map((item) => ({
      membershipId: item.id,
      joinedAt: item.joinedAt,
      effectiveTuition: item.tuitionOverride ?? item.class.monthlyTuition,
      class: item.class,
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
   * Học sinh xem chi tiết một lớp học mà mình đã tham gia (ACTIVE)
   */
  async getClassDetail(studentId: string, classId: string) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
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

    if (!classEntity) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${classId}`);
    }

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

    return {
      id: classEntity.id,
      name: classEntity.name,
      description: classEntity.description,
      status: classEntity.status,
      defaultMeetUrl: classEntity.defaultMeetUrl,
      teacher: classEntity.teacher,
      joinedAt: membership.joinedAt,
      membershipId: membership.id,
    };
  }

  /**
   * Học sinh xem trạng thái các yêu cầu tham gia lớp của mình
   */
  async getMyRequests(studentId: string, query: QueryStudentRequestsDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Prisma.EnrollmentWhereInput = {
      studentId,
    };

    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
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
          },
        },
        skip,
        take: limit,
        orderBy: { requestedAt: 'desc' },
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
   * Học sinh tự rời khỏi lớp học (Chuyển trạng thái sang LEFT, bảo tồn lịch sử)
   */
  async leaveClass(studentId: string, classId: string) {
    const activeMembership = await this.prisma.enrollment.findFirst({
      where: {
        classId,
        studentId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (!activeMembership) {
      throw new NotFoundException(
        'Bạn không phải là thành viên đang hoạt động của lớp học này',
      );
    }

    const updated = await this.prisma.enrollment.update({
      where: { id: activeMembership.id },
      data: {
        status: MemberStatus.LEFT,
        leftAt: new Date(),
      },
    });

    return {
      message: 'Rời lớp học thành công',
      membership: updated,
    };
  }
}
