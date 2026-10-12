import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ClassesService } from './classes.service.js';
import {
  UserRole,
  ClassStatus,
  Prisma,
} from '../../generated/prisma/client.js';

describe('ClassesService', () => {
  let classesService: ClassesService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      class: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    };

    classesService = new ClassesService(prismaMock);
  });

  describe('findAll', () => {
    it('lấy danh sách lớp học có phân trang', async () => {
      const mockClasses = [
        { id: 'c1', name: 'Lớp Văn 10', status: ClassStatus.ACTIVE },
        { id: 'c2', name: 'Lớp Văn 11', status: ClassStatus.ACTIVE },
      ];
      prismaMock.class.findMany.mockResolvedValue(mockClasses);
      prismaMock.class.count.mockResolvedValue(2);

      const result = await classesService.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('hỗ trợ tìm kiếm theo search term và lọc theo status', async () => {
      prismaMock.class.findMany.mockResolvedValue([]);
      prismaMock.class.count.mockResolvedValue(0);

      await classesService.findAll({
        search: 'Văn 10',
        status: ClassStatus.ACTIVE,
      });

      expect(prismaMock.class.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ClassStatus.ACTIVE,
            OR: expect.arrayContaining([
              { name: { contains: 'Văn 10', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('trả về chi tiết lớp học khi tồn tại', async () => {
      const mockClass = { id: 'c1', name: 'Lớp Văn 10' };
      prismaMock.class.findUnique.mockResolvedValue(mockClass);

      const result = await classesService.findOne('c1');
      expect(result).toEqual(mockClass);
    });

    it('ném NotFoundException khi lớp học không tồn tại', async () => {
      prismaMock.class.findUnique.mockResolvedValue(null);

      await expect(classesService.findOne('c999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      name: 'Lớp Văn 12 Nâng Cao',
      teacherId: 't1',
      monthlyTuition: 500000,
      defaultMeetUrl: 'https://meet.google.com/abc-def-ghi',
    };

    it('tạo lớp học thành công khi giáo viên hợp lệ', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 't1',
        role: UserRole.TEACHER,
        isActive: true,
      });

      const mockCreated = {
        id: 'c1',
        name: createDto.name,
        teacherId: 't1',
        status: ClassStatus.ACTIVE,
        monthlyTuition: new Prisma.Decimal(500000),
      };
      prismaMock.class.create.mockResolvedValue(mockCreated);

      const result = await classesService.create('admin1', createDto);

      expect(result.class).toEqual(mockCreated);
      expect(prismaMock.class.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: createDto.name,
            teacherId: 't1',
            createdById: 'admin1',
            status: ClassStatus.ACTIVE,
          }),
        }),
      );
    });

    it('báo lỗi BadRequestException nếu giáo viên không tồn tại', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(classesService.create('admin1', createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('báo lỗi BadRequestException nếu người dùng không phải TEACHER', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 't1',
        role: UserRole.STUDENT,
        isActive: true,
      });

      await expect(classesService.create('admin1', createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('báo lỗi BadRequestException nếu tài khoản giáo viên bị vô hiệu hóa', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 't1',
        role: UserRole.TEACHER,
        isActive: false,
      });

      await expect(classesService.create('admin1', createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('cập nhật thông tin lớp học thành công', async () => {
      prismaMock.class.findUnique.mockResolvedValue({ id: 'c1' });
      prismaMock.class.update.mockResolvedValue({ id: 'c1', name: 'Lớp Mới' });

      const result = await classesService.update('c1', { name: 'Lớp Mới' });

      expect(result.class.name).toBe('Lớp Mới');
      expect(prismaMock.class.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'c1' },
          data: expect.objectContaining({ name: 'Lớp Mới' }),
        }),
      );
    });
  });

  describe('updateStatus', () => {
    it('cập nhật trạng thái lớp học thành công', async () => {
      prismaMock.class.findUnique.mockResolvedValue({ id: 'c1' });
      prismaMock.class.update.mockResolvedValue({
        id: 'c1',
        status: ClassStatus.COMPLETED,
      });

      const result = await classesService.updateStatus('c1', {
        status: ClassStatus.COMPLETED,
      });

      expect(result.class.status).toBe(ClassStatus.COMPLETED);
    });
  });
});
