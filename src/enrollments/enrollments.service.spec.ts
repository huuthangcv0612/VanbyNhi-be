import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service.js';
import {
  UserRole,
  ClassStatus,
  MemberStatus,
  Prisma,
} from '../../generated/prisma/client.js';

describe('EnrollmentsService', () => {
  let enrollmentsService: EnrollmentsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      enrollment: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      class: {
        findUnique: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    };

    enrollmentsService = new EnrollmentsService(prismaMock);
  });

  describe('findByClass', () => {
    it('lấy danh sách học sinh của một lớp học', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        monthlyTuition: new Prisma.Decimal(500000),
      });

      const mockEnrollments = [
        {
          id: 'e1',
          classId: 'c1',
          studentId: 's1',
          status: MemberStatus.ACTIVE,
          tuitionOverride: null,
        },
      ];
      prismaMock.enrollment.findMany.mockResolvedValue(mockEnrollments);
      prismaMock.enrollment.count.mockResolvedValue(1);

      const result = await enrollmentsService.findByClass('c1', {
        page: 1,
        limit: 10,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].effectiveTuition).toEqual(
        new Prisma.Decimal(500000),
      );
      expect(result.pagination.total).toBe(1);
    });

    it('ném NotFoundException nếu lớp không tồn tại', async () => {
      prismaMock.class.findUnique.mockResolvedValue(null);

      await expect(
        enrollmentsService.findByClass('c999', { page: 1, limit: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('trả về chi tiết enrollment và tính effectiveTuition', async () => {
      prismaMock.enrollment.findUnique.mockResolvedValue({
        id: 'e1',
        tuitionOverride: new Prisma.Decimal(400000),
        class: { monthlyTuition: new Prisma.Decimal(500000) },
      });

      const result = await enrollmentsService.findOne('e1');

      expect(result.id).toBe('e1');
      expect(result.effectiveTuition).toEqual(new Prisma.Decimal(400000));
    });

    it('ném NotFoundException khi không tìm thấy enrollment', async () => {
      prismaMock.enrollment.findUnique.mockResolvedValue(null);

      await expect(enrollmentsService.findOne('e999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('ghi danh học sinh vào lớp thành công', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        status: ClassStatus.ACTIVE,
        monthlyTuition: new Prisma.Decimal(500000),
      });

      prismaMock.user.findUnique.mockResolvedValue({
        id: 's1',
        role: UserRole.STUDENT,
        isActive: true,
      });

      prismaMock.enrollment.findFirst.mockResolvedValue(null);

      const created = {
        id: 'e1',
        classId: 'c1',
        studentId: 's1',
        status: MemberStatus.ACTIVE,
        tuitionOverride: null,
        class: { monthlyTuition: new Prisma.Decimal(500000) },
      };
      prismaMock.enrollment.create.mockResolvedValue(created);

      const result = await enrollmentsService.create('c1', { studentId: 's1' });

      expect(result.enrollment.id).toBe('e1');
      expect(result.enrollment.effectiveTuition).toEqual(
        new Prisma.Decimal(500000),
      );
    });

    it('báo BadRequestException nếu lớp không ở trạng thái ACTIVE', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        status: ClassStatus.COMPLETED,
      });

      await expect(
        enrollmentsService.create('c1', { studentId: 's1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('báo BadRequestException nếu người dùng không phải STUDENT', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        status: ClassStatus.ACTIVE,
      });

      prismaMock.user.findUnique.mockResolvedValue({
        id: 's1',
        role: UserRole.TEACHER,
        isActive: true,
      });

      await expect(
        enrollmentsService.create('c1', { studentId: 's1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('báo ConflictException nếu học sinh đã có enrollment ACTIVE trong lớp', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        status: ClassStatus.ACTIVE,
      });

      prismaMock.user.findUnique.mockResolvedValue({
        id: 's1',
        role: UserRole.STUDENT,
        isActive: true,
      });

      prismaMock.enrollment.findFirst.mockResolvedValue({
        id: 'e_existing',
        status: MemberStatus.ACTIVE,
      });

      await expect(
        enrollmentsService.create('c1', { studentId: 's1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('bắt lỗi Prisma P2002 và ném ConflictException', async () => {
      prismaMock.class.findUnique.mockResolvedValue({
        id: 'c1',
        status: ClassStatus.ACTIVE,
      });

      prismaMock.user.findUnique.mockResolvedValue({
        id: 's1',
        role: UserRole.STUDENT,
        isActive: true,
      });

      prismaMock.enrollment.findFirst.mockResolvedValue(null);

      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '7.10.0',
        },
      );
      prismaMock.enrollment.create.mockRejectedValue(p2002Error);

      await expect(
        enrollmentsService.create('c1', { studentId: 's1' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStatus', () => {
    it('chuyển trạng thái sang LEFT và tự động cập nhật leftAt', async () => {
      prismaMock.enrollment.findUnique.mockResolvedValue({
        id: 'e1',
        status: MemberStatus.ACTIVE,
        leftAt: null,
        class: { monthlyTuition: new Prisma.Decimal(500000) },
      });

      prismaMock.enrollment.update.mockResolvedValue({
        id: 'e1',
        status: MemberStatus.LEFT,
        leftAt: new Date(),
        class: { monthlyTuition: new Prisma.Decimal(500000) },
      });

      const result = await enrollmentsService.updateStatus('e1', {
        status: MemberStatus.LEFT,
      });

      expect(result.enrollment.status).toBe(MemberStatus.LEFT);
      expect(prismaMock.enrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: MemberStatus.LEFT,
            leftAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('updateTuition', () => {
    it('cập nhật tuitionOverride cho học sinh', async () => {
      prismaMock.enrollment.findUnique.mockResolvedValue({
        id: 'e1',
        class: { monthlyTuition: new Prisma.Decimal(500000) },
      });

      prismaMock.enrollment.update.mockResolvedValue({
        id: 'e1',
        tuitionOverride: new Prisma.Decimal(450000),
        class: { monthlyTuition: new Prisma.Decimal(500000) },
      });

      const result = await enrollmentsService.updateTuition('e1', {
        tuitionOverride: 450000,
      });

      expect(result.enrollment.tuitionOverride).toEqual(
        new Prisma.Decimal(450000),
      );
    });
  });
});
