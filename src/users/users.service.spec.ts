import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UsersService } from './users.service.js';
import { UserRole } from '../../generated/prisma/client.js';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      refreshToken: {
        updateMany: vi.fn(),
      },
      $transaction: vi.fn((ops) => Promise.all(ops)),
    };

    usersService = new UsersService(prismaMock);
  });

  describe('findAll', () => {
    it('trả về danh sách phân trang người dùng', async () => {
      const mockUsers = [
        { id: '1', fullName: 'User 1', role: UserRole.STUDENT, isActive: true },
        { id: '2', fullName: 'User 2', role: UserRole.TEACHER, isActive: true },
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers);
      prismaMock.user.count.mockResolvedValue(2);

      const result = await usersService.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('trả về chi tiết người dùng khi ID tồn tại', async () => {
      const mockUser = { id: 'u1', fullName: 'Nguyễn Văn A' };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersService.findOne('u1');
      expect(result).toEqual(mockUser);
    });

    it('ném lỗi NotFoundException khi ID không tồn tại', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(usersService.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('tạo thành công tài khoản TEACHER hoặc STUDENT', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'u-new',
        fullName: 'Học sinh mới',
        phone: '0912345678',
        email: 'student@example.com',
        role: UserRole.STUDENT,
        isActive: true,
      });

      const result = await usersService.create({
        fullName: 'Học sinh mới',
        phone: '0912345678',
        email: 'student@example.com',
        role: UserRole.STUDENT,
      });

      expect(result.user.id).toBe('u-new');
      expect(result.initialPassword).toBeDefined();
      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it('ném lỗi ConflictException khi trùng số điện thoại', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        usersService.create({
          fullName: 'Trùng SĐT',
          phone: '0912345678',
          role: UserRole.STUDENT,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('ném lỗi ConflictException khi trùng email', async () => {
      // phone không trùng nhưng email trùng
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null) // phone
        .mockResolvedValueOnce({ id: 'existing-email' }); // email

      await expect(
        usersService.create({
          fullName: 'Trùng Email',
          phone: '0999999999',
          email: 'dup@example.com',
          role: UserRole.STUDENT,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStatus (Kích hoạt / Vô hiệu hóa)', () => {
    it('ADMIN kích hoạt/vô hiệu hóa tài khoản học sinh thành công và thu hồi refresh token khi vô hiệu hóa', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'student-1',
        role: UserRole.STUDENT,
        isActive: true,
      });
      prismaMock.user.update.mockResolvedValue({
        id: 'student-1',
        isActive: false,
      });

      const result = await usersService.updateStatus(
        'student-1',
        'admin-current',
        { isActive: false },
      );

      expect(result.user.isActive).toBe(false);
      expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'student-1', isRevoked: false },
        data: { isRevoked: true },
      });
    });

    it('chặn ADMIN tự vô hiệu hóa tài khoản của chính mình', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'admin-1',
        role: UserRole.ADMIN,
        isActive: true,
      });

      await expect(
        usersService.updateStatus('admin-1', 'admin-1', { isActive: false }),
      ).rejects.toThrow('Không thể tự vô hiệu hóa tài khoản của chính mình');
    });

    it('chặn vô hiệu hóa ADMIN duy nhất còn hoạt động', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'admin-target',
        role: UserRole.ADMIN,
        isActive: true,
      });
      // Chỉ còn 1 admin
      prismaMock.user.count.mockResolvedValue(1);

      await expect(
        usersService.updateStatus('admin-target', 'admin-caller', {
          isActive: false,
        }),
      ).rejects.toThrow('Không thể vô hiệu hóa quản trị viên (ADMIN) cuối cùng');
    });
  });

  describe('changePassword', () => {
    it('đổi mật khẩu thành công khi mật khẩu hiện tại đúng', async () => {
      const hashedCurrent = await bcrypt.hash('oldPassword123', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u-1',
        passwordHash: hashedCurrent,
      });

      const result = await usersService.changePassword('u-1', {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      expect(result.message).toContain('Đổi mật khẩu thành công');
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it('báo lỗi UnauthorizedException khi sai mật khẩu hiện tại', async () => {
      const hashedCurrent = await bcrypt.hash('oldPassword123', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u-1',
        passwordHash: hashedCurrent,
      });

      await expect(
        usersService.changePassword('u-1', {
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword456',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('báo lỗi BadRequestException khi mật khẩu mới trùng mật khẩu hiện tại', async () => {
      const hashedCurrent = await bcrypt.hash('samePassword123', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u-1',
        passwordHash: hashedCurrent,
      });

      await expect(
        usersService.changePassword('u-1', {
          currentPassword: 'samePassword123',
          newPassword: 'samePassword123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
