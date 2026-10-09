import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { TuitionService } from './tuition.service.js';
import { TuitionStatus, Prisma } from '../../generated/prisma/client.js';

describe('TuitionService', () => {
  let tuitionService: TuitionService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      tuitionFee: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
      },
      tuitionPayment: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      enrollment: {
        findUnique: vi.fn(),
      },
      $queryRaw: vi.fn().mockResolvedValue([]),
      $transaction: vi.fn(async (cb) => {
        if (typeof cb === 'function') {
          return cb(prismaMock);
        }
        return Promise.all(cb);
      }),
    };

    const notificationsMock: any = {
      createNotification: vi.fn().mockResolvedValue({ id: 'notif1' }),
      notifyClassStudents: vi.fn().mockResolvedValue({ count: 1 }),
    };

    tuitionService = new TuitionService(prismaMock, notificationsMock);
  });

  describe('generateTuitionFee (idempotent)', () => {
    const baseDto = {
      enrollmentId: 'enr1',
      billingYear: 2026,
      billingMonth: 10,
    };

    it('tạo học phí thành công cho enrollment hợp lệ', async () => {
      prismaMock.enrollment.findUnique.mockResolvedValue({
        id: 'enr1',
        joinedAt: new Date(2026, 8, 1),
        leftAt: null,
        tuitionOverride: null,
        class: { monthlyTuition: new Prisma.Decimal(600000) },
      });

      const upsertedFee = {
        id: 'fee1',
        enrollmentId: 'enr1',
        billingYear: 2026,
        billingMonth: 10,
        amountDue: new Prisma.Decimal(600000),
        status: TuitionStatus.UNPAID,
      };
      prismaMock.tuitionFee.upsert.mockResolvedValue(upsertedFee);

      const result = await tuitionService.generateTuitionFee(baseDto);

      expect(result.tuitionFee).toEqual(upsertedFee);
      expect(prismaMock.tuitionFee.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            enrollmentId_billingYear_billingMonth: {
              enrollmentId: 'enr1',
              billingYear: 2026,
              billingMonth: 10,
            },
          },
          update: {}, // Không mutate dữ liệu tài chính cũ
        }),
      );
    });

    it('ném NotFoundException nếu enrollment không tồn tại', async () => {
      prismaMock.enrollment.findUnique.mockResolvedValue(null);

      await expect(tuitionService.generateTuitionFee(baseDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('ném BadRequestException nếu học sinh tham gia sau kỳ tính phí', async () => {
      prismaMock.enrollment.findUnique.mockResolvedValue({
        id: 'enr1',
        joinedAt: new Date(2026, 10, 15), // Tháng 11
        leftAt: null,
        class: { monthlyTuition: new Prisma.Decimal(600000) },
      });

      await expect(tuitionService.generateTuitionFee(baseDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('ném BadRequestException nếu học sinh đã rời lớp trước kỳ tính phí', async () => {
      prismaMock.enrollment.findUnique.mockResolvedValue({
        id: 'enr1',
        joinedAt: new Date(2026, 5, 1),
        leftAt: new Date(2026, 8, 15), // Đã rời lớp trong tháng 9
        class: { monthlyTuition: new Prisma.Decimal(600000) },
      });

      await expect(tuitionService.generateTuitionFee(baseDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('recordPayment (thanh toán một phần, đủ, vượt mức, khóa hàng)', () => {
    it('thanh toán một phần chuyển trạng thái sang PARTIAL và khóa hàng FOR UPDATE', async () => {
      const fee = {
        id: 'fee1',
        amountDue: new Prisma.Decimal(1000000),
        dueDate: new Date(2026, 10, 30),
        billingMonth: 10,
        billingYear: 2026,
        payments: [], // Chưa có thanh toán nào
        enrollment: {
          studentId: 'stu1',
          class: { name: 'Lớp 12A' },
        },
      };
      prismaMock.tuitionFee.findUnique.mockResolvedValue(fee);

      const createdPayment = {
        id: 'pay1',
        amount: new Prisma.Decimal(400000),
      };
      prismaMock.tuitionPayment.create.mockResolvedValue(createdPayment);
      prismaMock.tuitionFee.update.mockResolvedValue({
        id: 'fee1',
        amountDue: fee.amountDue,
        status: TuitionStatus.PARTIAL,
      });

      const result = await tuitionService.recordPayment('fee1', 'admin1', {
        amount: 400000,
      });

      expect(prismaMock.$queryRaw).toHaveBeenCalled();
      expect(result.tuitionFee.status).toBe(TuitionStatus.PARTIAL);
      expect(result.tuitionFee.totalPaid).toEqual(new Prisma.Decimal(400000));
      expect(prismaMock.tuitionFee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'fee1' },
          data: { status: TuitionStatus.PARTIAL },
        }),
      );
    });

    it('thanh toán đủ chuyển trạng thái sang PAID', async () => {
      const fee = {
        id: 'fee1',
        amountDue: new Prisma.Decimal(1000000),
        dueDate: new Date(2026, 10, 30),
        billingMonth: 10,
        billingYear: 2026,
        payments: [{ id: 'p1', amount: new Prisma.Decimal(400000), isVoided: false }],
        enrollment: {
          studentId: 'stu1',
          class: { name: 'Lớp 12A' },
        },
      };
      prismaMock.tuitionFee.findUnique.mockResolvedValue(fee);

      prismaMock.tuitionPayment.create.mockResolvedValue({
        id: 'pay2',
        amount: new Prisma.Decimal(600000),
      });
      prismaMock.tuitionFee.update.mockResolvedValue({
        id: 'fee1',
        amountDue: fee.amountDue,
        status: TuitionStatus.PAID,
      });

      const result = await tuitionService.recordPayment('fee1', 'admin1', {
        amount: 600000,
      });

      expect(result.tuitionFee.status).toBe(TuitionStatus.PAID);
      expect(result.tuitionFee.totalPaid).toEqual(new Prisma.Decimal(1000000));
    });

    it('từ chối thanh toán nếu vượt quá số tiền còn nợ', async () => {
      const fee = {
        id: 'fee1',
        amountDue: new Prisma.Decimal(1000000),
        dueDate: new Date(2026, 10, 30),
        payments: [{ id: 'p1', amount: new Prisma.Decimal(700000), isVoided: false }],
      };
      prismaMock.tuitionFee.findUnique.mockResolvedValue(fee);

      await expect(
        tuitionService.recordPayment('fee1', 'admin1', { amount: 400000 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối thanh toán số tiền <= 0', async () => {
      await expect(
        tuitionService.recordPayment('fee1', 'admin1', { amount: 0 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('voidPayment (hủy thanh toán, khóa hàng & tính lại trạng thái)', () => {
    it('hủy thanh toán thành công, khóa hàng và cập nhật lại trạng thái TuitionFee', async () => {
      const payment = {
        id: 'pay1',
        amount: new Prisma.Decimal(1000000),
        tuitionFeeId: 'fee1',
        isVoided: false,
      };

      const feeAfter = {
        id: 'fee1',
        amountDue: new Prisma.Decimal(1000000),
        dueDate: new Date(2026, 10, 30),
        billingMonth: 10,
        billingYear: 2026,
        payments: [], // Không còn payment nào sau khi pay1 bị void
        enrollment: {
          studentId: 'stu1',
          class: { name: 'Lớp 12A' },
        },
      };

      prismaMock.tuitionPayment.findUnique.mockResolvedValue(payment);
      prismaMock.tuitionPayment.update.mockResolvedValue({
        ...payment,
        isVoided: true,
        voidReason: 'Nhầm số tiền',
      });
      prismaMock.tuitionFee.findUnique.mockResolvedValue(feeAfter);
      prismaMock.tuitionFee.update.mockResolvedValue({
        id: 'fee1',
        amountDue: new Prisma.Decimal(1000000),
        status: TuitionStatus.UNPAID,
      });

      const result = await tuitionService.voidPayment('pay1', 'admin1', {
        voidReason: 'Nhầm số tiền',
      });

      expect(prismaMock.$queryRaw).toHaveBeenCalled();
      expect(result.payment.isVoided).toBe(true);
      expect(result.tuitionFee.status).toBe(TuitionStatus.UNPAID);
      expect(result.tuitionFee.totalPaid).toEqual(new Prisma.Decimal(0));
    });

    it('void payment chuyển trạng thái từ PAID về OVERDUE nếu đã quá hạn', async () => {
      const payment = {
        id: 'pay1',
        amount: new Prisma.Decimal(1000000),
        tuitionFeeId: 'fee1',
        isVoided: false,
      };

      // Due date trong quá khứ
      const pastDueDate = new Date(2020, 1, 1);
      const feeAfter = {
        id: 'fee1',
        amountDue: new Prisma.Decimal(1000000),
        dueDate: pastDueDate,
        billingMonth: 10,
        billingYear: 2026,
        payments: [],
        enrollment: {
          studentId: 'stu1',
          class: { name: 'Lớp 12A' },
        },
      };

      prismaMock.tuitionPayment.findUnique.mockResolvedValue(payment);
      prismaMock.tuitionPayment.update.mockResolvedValue({
        ...payment,
        isVoided: true,
        voidReason: 'Hủy thanh toán',
      });
      prismaMock.tuitionFee.findUnique.mockResolvedValue(feeAfter);
      prismaMock.tuitionFee.update.mockResolvedValue({
        id: 'fee1',
        amountDue: new Prisma.Decimal(1000000),
        status: TuitionStatus.OVERDUE,
      });

      const result = await tuitionService.voidPayment('pay1', 'admin1', {
        voidReason: 'Hủy thanh toán',
      });

      expect(result.tuitionFee.status).toBe(TuitionStatus.OVERDUE);
    });

    it('từ chối void lặp lại nếu payment đã bị void trước đó', async () => {
      const payment = {
        id: 'pay1',
        isVoided: true,
        voidedAt: new Date(),
      };
      prismaMock.tuitionPayment.findUnique.mockResolvedValue(payment);

      await expect(
        tuitionService.voidPayment('pay1', 'admin1', {
          voidReason: 'Hủy lại lần 2',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('ném NotFoundException nếu payment không tồn tại', async () => {
      prismaMock.tuitionPayment.findUnique.mockResolvedValue(null);

      await expect(
        tuitionService.voidPayment('pay999', 'admin1', {
          voidReason: 'Không tồn tại',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
