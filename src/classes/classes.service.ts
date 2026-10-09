import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole, ClassStatus } from '../../generated/prisma/client.js';
import type { QueryClassesDto } from './dto/query-classes.dto.js';
import type { CreateClassDto } from './dto/create-class.dto.js';
import type { UpdateClassDto } from './dto/update-class.dto.js';
import type { UpdateClassStatusDto } from './dto/update-class-status.dto.js';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ADMIN lấy danh sách lớp học với phân trang, tìm kiếm và lọc trạng thái
   */
  async findAll(query: QueryClassesDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.teacherId) {
      where.teacherId = query.teacherId;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { classCode: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.class.findMany({
        where,
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              members: true,
              sessions: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.class.count({ where }),
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
   * ADMIN xem chi tiết một lớp học
   */
  async findOne(id: string) {
    const classEntity = await this.prisma.class.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            avatarUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            members: true,
            sessions: true,
            materials: true,
            assignments: true,
          },
        },
      },
    });

    if (!classEntity) {
      throw new NotFoundException(`Không tìm thấy lớp học với ID ${id}`);
    }

    return classEntity;
  }

  /**
   * ADMIN tạo lớp học mới
   */
  async create(adminId: string, createClassDto: CreateClassDto) {
    // Xác minh giáo viên phụ trách
    const teacher = await this.prisma.user.findUnique({
      where: { id: createClassDto.teacherId },
      select: { id: true, role: true, isActive: true },
    });

    if (!teacher) {
      throw new BadRequestException('Giáo viên được chỉ định không tồn tại');
    }

    if (teacher.role !== UserRole.TEACHER) {
      throw new BadRequestException('Người dùng được chỉ định không có vai trò TEACHER');
    }

    if (!teacher.isActive) {
      throw new BadRequestException('Tài khoản giáo viên này đã bị vô hiệu hóa');
    }

    const monthlyTuition =
      createClassDto.monthlyTuition !== undefined
        ? new Prisma.Decimal(createClassDto.monthlyTuition)
        : new Prisma.Decimal(0);

    const newClass = await this.prisma.class.create({
      data: {
        name: createClassDto.name,
        description: createClassDto.description,
        teacherId: createClassDto.teacherId,
        createdById: adminId,
        defaultMeetUrl: createClassDto.defaultMeetUrl,
        monthlyTuition,
        status: ClassStatus.ACTIVE,
      },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
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
   * ADMIN cập nhật thông tin lớp học
   */
  async update(id: string, updateClassDto: UpdateClassDto) {
    await this.findOne(id);

    const data: any = {};

    if (updateClassDto.name !== undefined) {
      data.name = updateClassDto.name;
    }
    if (updateClassDto.description !== undefined) {
      data.description = updateClassDto.description;
    }
    if (updateClassDto.defaultMeetUrl !== undefined) {
      data.defaultMeetUrl = updateClassDto.defaultMeetUrl;
    }
    if (updateClassDto.monthlyTuition !== undefined) {
      data.monthlyTuition = new Prisma.Decimal(updateClassDto.monthlyTuition);
    }

    if (updateClassDto.teacherId !== undefined) {
      const teacher = await this.prisma.user.findUnique({
        where: { id: updateClassDto.teacherId },
        select: { id: true, role: true, isActive: true },
      });

      if (!teacher) {
        throw new BadRequestException('Giáo viên được chỉ định không tồn tại');
      }
      if (teacher.role !== UserRole.TEACHER) {
        throw new BadRequestException('Người dùng được chỉ định không có vai trò TEACHER');
      }
      if (!teacher.isActive) {
        throw new BadRequestException('Tài khoản giáo viên này đã bị vô hiệu hóa');
      }

      data.teacherId = updateClassDto.teacherId;
    }

    const updatedClass = await this.prisma.class.update({
      where: { id },
      data,
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Cập nhật lớp học thành công',
      class: updatedClass,
    };
  }

  /**
   * ADMIN cập nhật trạng thái lớp học (ACTIVE / INACTIVE / COMPLETED)
   */
  async updateStatus(id: string, statusDto: UpdateClassStatusDto) {
    await this.findOne(id);

    const updatedClass = await this.prisma.class.update({
      where: { id },
      data: { status: statusDto.status },
    });

    return {
      message: `Cập nhật trạng thái lớp học thành ${statusDto.status} thành công`,
      class: updatedClass,
    };
  }
}
