import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '../../generated/prisma/client.js';
import type { QueryUsersDto } from './dto/query-users.dto.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import type { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Bộ trường an toàn không chứa passwordHash hay token
   */
  private readonly userSelectSafe = {
    id: true,
    fullName: true,
    phone: true,
    email: true,
    avatarUrl: true,
    dateOfBirth: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  };

  /**
   * Phân trang và tìm kiếm danh sách người dùng (chỉ ADMIN)
   */
  async findAll(query: QueryUsersDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.role) {
      where.role = query.role;
    }

    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: this.userSelectSafe,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
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
   * Lấy chi tiết tài khoản theo ID
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelectSafe,
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }

    return user;
  }

  /**
   * ADMIN tạo tài khoản TEACHER hoặc STUDENT
   */
  async create(createUserDto: CreateUserDto) {
    const phone = createUserDto.phone.trim();
    const email = createUserDto.email ? createUserDto.email.trim().toLowerCase() : null;

    // Kiểm tra trùng lặp phone
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      throw new ConflictException('Số điện thoại này đã được sử dụng');
    }

    // Kiểm tra trùng lặp email nếu có
    if (email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw new ConflictException('Email này đã được sử dụng');
      }
    }

    // Mật khẩu khởi tạo: nếu admin không truyền thì tạo ngẫu nhiên 8 ký tự an toàn
    const rawPassword = createUserDto.initialPassword ?? crypto.randomBytes(4).toString('hex');
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          fullName: createUserDto.fullName,
          phone,
          email,
          passwordHash,
          role: createUserDto.role,
          isActive: true,
        },
        select: this.userSelectSafe,
      });

      return {
        message: 'Tạo tài khoản thành công',
        user,
        initialPassword: rawPassword,
      };
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Số điện thoại hoặc email đã được sử dụng');
      }
      throw error;
    }
  }

  /**
   * ADMIN cập nhật hồ sơ người dùng
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const data: any = {};
    if (updateUserDto.fullName !== undefined) {
      data.fullName = updateUserDto.fullName;
    }
    if (updateUserDto.avatarUrl !== undefined) {
      data.avatarUrl = updateUserDto.avatarUrl;
    }
    if (updateUserDto.dateOfBirth !== undefined) {
      data.dateOfBirth = updateUserDto.dateOfBirth ? new Date(updateUserDto.dateOfBirth) : null;
    }

    if (updateUserDto.email !== undefined) {
      const email = updateUserDto.email ? updateUserDto.email.trim().toLowerCase() : null;
      if (email) {
        const existingEmail = await this.prisma.user.findFirst({
          where: { email, NOT: { id } },
        });
        if (existingEmail) {
          throw new ConflictException('Email này đã được người dùng khác sử dụng');
        }
      }
      data.email = email;
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data,
        select: this.userSelectSafe,
      });

      return {
        message: 'Cập nhật thông tin thành công',
        user: updatedUser,
      };
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Email này đã được sử dụng');
      }
      throw error;
    }
  }

  /**
   * ADMIN bật/tắt trạng thái hoạt động (isActive)
   */
  async updateStatus(targetUserId: string, currentAdminId: string, statusDto: UpdateUserStatusDto) {
    const targetUser = await this.findOne(targetUserId);

    // Không cho phép ADMIN tự vô hiệu hóa tài khoản của chính mình
    if (targetUserId === currentAdminId && statusDto.isActive === false) {
      throw new BadRequestException('Không thể tự vô hiệu hóa tài khoản của chính mình');
    }

    // Nếu vô hiệu hóa một ADMIN, kiểm tra xem có phải là ADMIN duy nhất còn hoạt động không
    if (targetUser.role === UserRole.ADMIN && statusDto.isActive === false) {
      const activeAdminCount = await this.prisma.user.count({
        where: { role: UserRole.ADMIN, isActive: true },
      });
      if (activeAdminCount <= 1) {
        throw new BadRequestException('Không thể vô hiệu hóa quản trị viên (ADMIN) cuối cùng của hệ thống');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { isActive: statusDto.isActive },
      select: this.userSelectSafe,
    });

    // Nếu tài khoản bị vô hiệu hóa, thu hồi toàn bộ refresh token đang hoạt động của người đó
    if (!statusDto.isActive) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: targetUserId, isRevoked: false },
        data: { isRevoked: true },
      });
    }

    return {
      message: `Tài khoản đã được ${statusDto.isActive ? 'kích hoạt' : 'vô hiệu hóa'} thành công`,
      user: updatedUser,
    };
  }

  /**
   * Cập nhật hồ sơ cá nhân của người dùng hiện tại (Current User)
   */
  async updateMe(userId: string, updateUserDto: UpdateUserDto) {
    return this.update(userId, updateUserDto);
  }

  /**
   * Đổi mật khẩu tài khoản cá nhân
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng');
    }

    const isMatch = await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu hiện tại không chính xác');
    }

    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu hiện tại');
    }

    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Đổi mật khẩu và thu hồi toàn bộ refresh token cũ để buộc các phiên khác đăng nhập lại
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      }),
    ]);

    return {
      message: 'Đổi mật khẩu thành công. Các phiên đăng nhập khác đã được thu hồi.',
    };
  }
}
