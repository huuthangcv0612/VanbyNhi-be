import {
  Injectable,
  NotFoundException,
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
import type { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import type { QueryEnrollmentsDto } from './dto/query-enrollments.dto.js';
import type { UpdateEnrollmentStatusDto } from './dto/update-enrollment-status.dto.js';
import type { UpdateEnrollmentTuitionDto } from './dto/update-enrollment-tuition.dto.js';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách học sinh ghi danh trong một lớp học
   */
  async findByClass(classId: string, query: QueryEnrollmentsDto) {
    // Kiểm tra lớp học tồn tại
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

    const [items, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
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
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    // Bổ sung thông tin học phí thực tế áp dụng (tuitionOverride ?? class.monthlyTuition)
    const enrichedItems = items.map((item) => ({
      ...item,
      effectiveTuition: item.tuitionOverride ?? classEntity.monthlyTuition,
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
   * Xem chi tiết một bản ghi ghi danh
   */
  async findOne(id: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
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
        class: {
          select: {
            id: true,
            name: true,
            classCode: true,
            monthlyTuition: true,
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
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Không tìm thấy thông tin ghi danh với ID ${id}`);
    }

    return {
      ...enrollment,
      effectiveTuition: enrollment.tuitionOverride ?? enrollment.class.monthlyTuition,
    };
  }

  /**
   * Thêm học sinh vào lớp (Ghi danh mới)
   */
  async create(classId: string, createDto: CreateEnrollmentDto) {
    // 1. Kiểm tra lớp học
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classEntity) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${classId}`);
    }

    if (classEntity.status !== ClassStatus.ACTIVE) {
      throw new BadRequestException('Chỉ có thể ghi danh học sinh vào lớp học đang hoạt động (ACTIVE)');
    }

    // 2. Kiểm tra học sinh
    const student = await this.prisma.user.findUnique({
      where: { id: createDto.studentId },
      select: { id: true, role: true, isActive: true },
    });

    if (!student) {
      throw new BadRequestException('Học sinh được chỉ định không tồn tại');
    }

    if (student.role !== UserRole.STUDENT) {
      throw new BadRequestException('Người dùng được chỉ định không có vai trò STUDENT');
    }

    if (!student.isActive) {
      throw new BadRequestException('Tài khoản học sinh này đã bị vô hiệu hóa');
    }

    // 3. Kiểm tra xem học sinh đã có enrollment ACTIVE trong lớp này chưa
    const existingActive = await this.prisma.enrollment.findFirst({
      where: {
        classId,
        studentId: createDto.studentId,
        status: MemberStatus.ACTIVE,
      },
    });

    if (existingActive) {
      throw new ConflictException('Học sinh này hiện đang có một lượt ghi danh đang hoạt động trong lớp học');
    }

    const tuitionOverride =
      createDto.tuitionOverride !== undefined && createDto.tuitionOverride !== null
        ? new Prisma.Decimal(createDto.tuitionOverride)
        : null;

    try {
      const enrollment = await this.prisma.enrollment.create({
        data: {
          classId,
          studentId: createDto.studentId,
          tuitionOverride,
          status: MemberStatus.ACTIVE,
          joinedAt: new Date(),
        },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              classCode: true,
              monthlyTuition: true,
            },
          },
        },
      });

      return {
        message: 'Ghi danh học sinh vào lớp thành công',
        enrollment: {
          ...enrollment,
          effectiveTuition: enrollment.tuitionOverride ?? enrollment.class.monthlyTuition,
        },
      };
    } catch (error: any) {
      // Bắt lỗi vi phạm unique index unique_active_enrollment_per_student_class
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Học sinh này hiện đang có một lượt ghi danh đang hoạt động trong lớp học');
      }
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái ghi danh (ACTIVE, INACTIVE, LEFT)
   */
  async updateStatus(id: string, statusDto: UpdateEnrollmentStatusDto) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        class: {
          select: { id: true, monthlyTuition: true },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Không tìm thấy thông tin ghi danh với ID ${id}`);
    }

    if (enrollment.status === statusDto.status) {
      return {
        message: 'Trạng thái ghi danh không thay đổi',
        enrollment,
      };
    }

    const data: any = {
      status: statusDto.status,
    };

    // Nếu chuyển sang LEFT hoặc INACTIVE, ghi nhận leftAt nếu chưa có
    if (
      (statusDto.status === MemberStatus.LEFT || statusDto.status === MemberStatus.INACTIVE) &&
      !enrollment.leftAt
    ) {
      data.leftAt = new Date();
    } else if (statusDto.status === MemberStatus.ACTIVE) {
      // Nếu kích hoạt lại, kiểm tra xem lớp đã có active enrollment khác chưa
      const activeOther = await this.prisma.enrollment.findFirst({
        where: {
          classId: enrollment.classId,
          studentId: enrollment.studentId,
          status: MemberStatus.ACTIVE,
          id: { not: id },
        },
      });

      if (activeOther) {
        throw new ConflictException('Học sinh này đã có một lượt ghi danh ACTIVE khác trong lớp');
      }

      data.leftAt = null;
    }

    try {
      const updated = await this.prisma.enrollment.update({
        where: { id },
        data,
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              monthlyTuition: true,
            },
          },
        },
      });

      return {
        message: `Cập nhật trạng thái ghi danh thành ${statusDto.status} thành công`,
        enrollment: {
          ...updated,
          effectiveTuition: updated.tuitionOverride ?? updated.class.monthlyTuition,
        },
      };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Học sinh này đã có một lượt ghi danh ACTIVE khác trong lớp');
      }
      throw error;
    }
  }

  /**
   * Cập nhật mức học phí tùy chỉnh cho học sinh
   */
  async updateTuition(id: string, tuitionDto: UpdateEnrollmentTuitionDto) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        class: {
          select: { id: true, monthlyTuition: true },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Không tìm thấy thông tin ghi danh với ID ${id}`);
    }

    const tuitionOverride =
      tuitionDto.tuitionOverride !== undefined && tuitionDto.tuitionOverride !== null
        ? new Prisma.Decimal(tuitionDto.tuitionOverride)
        : null;

    const updated = await this.prisma.enrollment.update({
      where: { id },
      data: { tuitionOverride },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            monthlyTuition: true,
          },
        },
      },
    });

    return {
      message: 'Cập nhật học phí tùy chỉnh thành công',
      enrollment: {
        ...updated,
        effectiveTuition: updated.tuitionOverride ?? updated.class.monthlyTuition,
      },
    };
  }
}
