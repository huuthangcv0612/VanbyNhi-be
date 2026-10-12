import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  TuitionStatus,
  MemberStatus,
  NotificationType,
} from '../../generated/prisma/client.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import type { GenerateTuitionFeeDto } from './dto/generate-tuition-fee.dto.js';
import type { QueryTuitionFeesDto } from './dto/query-tuition-fees.dto.js';
import type { RecordPaymentDto } from './dto/record-payment.dto.js';
import type { VoidPaymentDto } from './dto/void-payment.dto.js';

@Injectable()
export class TuitionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Tính toán trạng thái học phí dựa trên số tiền phải nộp, số tiền đã trả và ngày hết hạn
   */
  private computeStatus(
    amountDue: Prisma.Decimal,
    totalPaid: Prisma.Decimal,
    dueDate: Date | null,
  ): TuitionStatus {
    const due = amountDue.toNumber();
    const paid = totalPaid.toNumber();

    if (paid >= due && due > 0) {
      return TuitionStatus.PAID;
    }

    if (paid > 0 && paid < due) {
      // Đã thanh toán một phần
      if (dueDate && new Date() > new Date(dueDate)) {
        return TuitionStatus.OVERDUE;
      }
      return TuitionStatus.PARTIAL;
    }

    // Chưa trả đồng nào (paid === 0)
    if (dueDate && new Date() > new Date(dueDate)) {
      return TuitionStatus.OVERDUE;
    }

    return TuitionStatus.UNPAID;
  }

  /**
   * ADMIN lấy danh sách các khoản học phí có phân trang và bộ lọc
   */
  async findAll(query: QueryTuitionFeesDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.billingYear) {
      where.billingYear = query.billingYear;
    }

    if (query.billingMonth) {
      where.billingMonth = query.billingMonth;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.classId || query.studentId) {
      where.enrollment = {};
      if (query.classId) {
        where.enrollment.classId = query.classId;
      }
      if (query.studentId) {
        where.enrollment.studentId = query.studentId;
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.tuitionFee.findMany({
        where,
        include: {
          enrollment: {
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
                },
              },
            },
          },
          payments: {
            where: { isVoided: false },
            select: { amount: true },
          },
        },
        skip,
        take: limit,
        orderBy: [
          { billingYear: 'desc' },
          { billingMonth: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.tuitionFee.count({ where }),
    ]);

    const enrichedItems = items.map((item) => {
      let totalPaid = new Prisma.Decimal(0);
      for (const p of item.payments) {
        totalPaid = totalPaid.add(p.amount);
      }
      const remainingAmount = Prisma.Decimal.max(
        new Prisma.Decimal(0),
        item.amountDue.sub(totalPaid),
      );

      return {
        id: item.id,
        enrollmentId: item.enrollmentId,
        billingYear: item.billingYear,
        billingMonth: item.billingMonth,
        amountDue: item.amountDue,
        totalPaid,
        remainingAmount,
        status: item.status,
        dueDate: item.dueDate,
        note: item.note,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        enrollment: item.enrollment,
      };
    });

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
   * ADMIN xem chi tiết một khoản học phí và toàn bộ lịch sử thanh toán
   */
  async findOne(id: string) {
    const fee = await this.prisma.tuitionFee.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
                avatarUrl: true,
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
        },
        payments: {
          include: {
            recordedBy: {
              select: { id: true, fullName: true },
            },
            voidedBy: {
              select: { id: true, fullName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!fee) {
      throw new NotFoundException(`Không tìm thấy khoản học phí với ID ${id}`);
    }

    let totalPaid = new Prisma.Decimal(0);
    for (const p of fee.payments) {
      if (!p.isVoided) {
        totalPaid = totalPaid.add(p.amount);
      }
    }

    const remainingAmount = Prisma.Decimal.max(
      new Prisma.Decimal(0),
      fee.amountDue.sub(totalPaid),
    );

    return {
      ...fee,
      totalPaid,
      remainingAmount,
    };
  }

  /**
   * Tạo học phí theo tháng cho một enrollment (Idempotent theo enrollmentId + billingYear + billingMonth)
   */
  async generateTuitionFee(dto: GenerateTuitionFeeDto) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: dto.enrollmentId },
      include: { class: true },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Không tìm thấy bản ghi ghi danh với ID ${dto.enrollmentId}`,
      );
    }

    // Kiểm tra tính hợp lệ về thời gian enrollment đối với kỳ thu học phí:
    // Nếu học sinh đã rời lớp trước tháng tính phí -> không tạo phí
    const billingPeriodStart = new Date(
      dto.billingYear,
      dto.billingMonth - 1,
      1,
    );
    const billingPeriodEnd = new Date(
      dto.billingYear,
      dto.billingMonth,
      0,
      23,
      59,
      59,
    );

    if (enrollment.joinedAt && enrollment.joinedAt > billingPeriodEnd) {
      throw new BadRequestException(
        `Học sinh tham gia lớp sau kỳ tính phí tháng ${dto.billingMonth}/${dto.billingYear}`,
      );
    }

    if (enrollment.leftAt && enrollment.leftAt < billingPeriodStart) {
      throw new BadRequestException(
        `Học sinh đã rời lớp trước kỳ tính phí tháng ${dto.billingMonth}/${dto.billingYear}`,
      );
    }

    // Số tiền học phí phải nộp: DTO chỉ định hoặc tính theo hiệu lực: tuitionOverride ?? class.monthlyTuition
    const effectiveTuition =
      dto.amountDue !== undefined
        ? new Prisma.Decimal(dto.amountDue)
        : (enrollment.tuitionOverride ?? enrollment.class.monthlyTuition);

    // Tính trạng thái ban đầu dựa trên dueDate nếu có
    const initialStatus =
      dto.dueDate && new Date() > new Date(dto.dueDate)
        ? TuitionStatus.OVERDUE
        : TuitionStatus.UNPAID;

    try {
      const fee = await this.prisma.tuitionFee.upsert({
        where: {
          enrollmentId_billingYear_billingMonth: {
            enrollmentId: dto.enrollmentId,
            billingYear: dto.billingYear,
            billingMonth: dto.billingMonth,
          },
        },
        create: {
          enrollmentId: dto.enrollmentId,
          billingYear: dto.billingYear,
          billingMonth: dto.billingMonth,
          amountDue: effectiveTuition,
          status: initialStatus,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          note: dto.note,
        },
        update: {
          // Idempotent: hoàn toàn giữ nguyên dữ liệu tài chính đã tạo/đối soát, không ghi đè bất kỳ trường nào
        },
        include: {
          enrollment: {
            include: {
              student: { select: { id: true, fullName: true } },
              class: { select: { id: true, name: true } },
            },
          },
        },
      });

      return {
        message: 'Tạo/đồng bộ khoản học phí thành công',
        tuitionFee: fee,
      };
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Khoản học phí cho tháng ${dto.billingMonth}/${dto.billingYear} của học sinh này đã tồn tại`,
        );
      }
      throw error;
    }
  }

  /**
   * ADMIN ghi nhận thanh toán cho một khoản học phí trong Transaction
   * Chống Race condition bằng cách tính toán và khóa logic trên tổng tiền hợp lệ
   */
  async recordPayment(
    tuitionFeeId: string,
    recordedById: string,
    dto: RecordPaymentDto,
  ) {
    const paymentAmount = new Prisma.Decimal(dto.amount);
    if (paymentAmount.lte(0)) {
      throw new BadRequestException('Số tiền thanh toán phải lớn hơn 0');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Khóa hàng TuitionFee bằng SELECT ... FOR UPDATE để tuần tự hóa các giao dịch đồng thời
      await tx.$queryRaw`SELECT id FROM "TuitionFee" WHERE id = ${tuitionFeeId} FOR UPDATE`;

      // Lấy thông tin khoản học phí hiện tại kèm các thanh toán chưa void và thông tin enrollment
      const fee = await tx.tuitionFee.findUnique({
        where: { id: tuitionFeeId },
        include: {
          payments: {
            where: { isVoided: false },
          },
          enrollment: {
            select: { studentId: true, class: { select: { name: true } } },
          },
        },
      });

      if (!fee) {
        throw new NotFoundException(
          `Không tìm thấy khoản học phí với ID ${tuitionFeeId}`,
        );
      }

      // 2. Tính tổng tiền đã thanh toán hợp lệ hiện có
      let currentPaid = new Prisma.Decimal(0);
      for (const p of fee.payments) {
        currentPaid = currentPaid.add(p.amount);
      }

      const newTotalPaid = currentPaid.add(paymentAmount);

      // 3. Chặn thanh toán vượt mức học phí quy định
      if (newTotalPaid.gt(fee.amountDue)) {
        const remaining = Prisma.Decimal.max(
          new Prisma.Decimal(0),
          fee.amountDue.sub(currentPaid),
        );
        throw new BadRequestException(
          `Số tiền thanh toán (${paymentAmount.toNumber().toLocaleString()} VNĐ) vượt quá số tiền còn nợ (${remaining.toNumber().toLocaleString()} VNĐ)`,
        );
      }

      // 4. Tạo bản ghi TuitionPayment
      const payment = await tx.tuitionPayment.create({
        data: {
          tuitionFeeId,
          amount: paymentAmount,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
          paymentMethod: dto.paymentMethod,
          recordedById,
          note: dto.note,
        },
      });

      // 5. Cập nhật lại status của TuitionFee
      const newStatus = this.computeStatus(
        fee.amountDue,
        newTotalPaid,
        fee.dueDate,
      );
      const updatedFee = await tx.tuitionFee.update({
        where: { id: tuitionFeeId },
        data: { status: newStatus },
      });

      return {
        message: 'Ghi nhận thanh toán thành công',
        payment,
        tuitionFee: {
          id: updatedFee.id,
          amountDue: updatedFee.amountDue,
          totalPaid: newTotalPaid,
          status: updatedFee.status,
          studentId: fee.enrollment.studentId,
          className: fee.enrollment.class.name,
          billingMonth: fee.billingMonth,
          billingYear: fee.billingYear,
        },
      };
    });

    // Thông báo cho học sinh sau khi transaction đã commit thành công
    try {
      await this.notificationsService.createNotification({
        recipientId: result.tuitionFee.studentId,
        title: 'Xác nhận thanh toán học phí thành công',
        content: `Khoản thanh toán ${paymentAmount.toNumber().toLocaleString()} VNĐ cho học phí tháng ${result.tuitionFee.billingMonth}/${result.tuitionFee.billingYear} lớp "${result.tuitionFee.className}" đã được ghi nhận.`,
        type: NotificationType.TUITION,
        referenceId: result.payment.id,
      });
    } catch {
      // Notification dispatch failure must not fail the financial transaction
    }

    return {
      message: result.message,
      payment: result.payment,
      tuitionFee: {
        id: result.tuitionFee.id,
        amountDue: result.tuitionFee.amountDue,
        totalPaid: result.tuitionFee.totalPaid,
        status: result.tuitionFee.status,
      },
    };
  }

  /**
   * ADMIN hủy (void) một bản ghi thanh toán sai trong Transaction
   */
  async voidPayment(
    paymentId: string,
    voidedById: string,
    dto: VoidPaymentDto,
  ) {
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Tìm payment và tuitionFeeId tương ứng
      const payment = await tx.tuitionPayment.findUnique({
        where: { id: paymentId },
        select: {
          id: true,
          tuitionFeeId: true,
          isVoided: true,
          voidedAt: true,
        },
      });

      if (!payment) {
        throw new NotFoundException(
          `Không tìm thấy bản ghi thanh toán với ID ${paymentId}`,
        );
      }

      if (payment.isVoided) {
        throw new BadRequestException(
          `Bản ghi thanh toán này đã được hủy trước đó vào lúc ${payment.voidedAt?.toISOString()}`,
        );
      }

      // Khóa hàng TuitionFee tương ứng để tuần tự hóa với các recordPayment/voidPayment khác
      await tx.$queryRaw`SELECT id FROM "TuitionFee" WHERE id = ${payment.tuitionFeeId} FOR UPDATE`;

      // 2. Cập nhật trạng thái void cho payment
      const voidedPayment = await tx.tuitionPayment.update({
        where: { id: paymentId },
        data: {
          isVoided: true,
          voidedAt: new Date(),
          voidReason: dto.voidReason,
          voidedById,
        },
      });

      // 3. Đọc lại fee và các thanh toán còn hiệu lực
      const fee = await tx.tuitionFee.findUnique({
        where: { id: payment.tuitionFeeId },
        include: {
          payments: { where: { isVoided: false } },
          enrollment: {
            select: { studentId: true, class: { select: { name: true } } },
          },
        },
      });

      if (!fee) {
        throw new NotFoundException(`Không tìm thấy khoản học phí tương ứng`);
      }

      let newTotalPaid = new Prisma.Decimal(0);
      for (const p of fee.payments) {
        newTotalPaid = newTotalPaid.add(p.amount);
      }

      // 4. Cập nhật lại trạng thái TuitionFee
      const newStatus = this.computeStatus(
        fee.amountDue,
        newTotalPaid,
        fee.dueDate,
      );
      const updatedFee = await tx.tuitionFee.update({
        where: { id: fee.id },
        data: { status: newStatus },
      });

      return {
        message: 'Hủy bản ghi thanh toán thành công',
        payment: voidedPayment,
        tuitionFee: {
          id: updatedFee.id,
          amountDue: updatedFee.amountDue,
          totalPaid: newTotalPaid,
          status: updatedFee.status,
          studentId: fee.enrollment.studentId,
          className: fee.enrollment.class.name,
          billingMonth: fee.billingMonth,
          billingYear: fee.billingYear,
        },
      };
    });

    // Thông báo cho học sinh về việc hủy thanh toán sau khi commit thành công
    try {
      await this.notificationsService.createNotification({
        recipientId: result.tuitionFee.studentId,
        title: 'Thông báo điều chỉnh thanh toán học phí',
        content: `Khoản thanh toán ${result.payment.amount.toNumber().toLocaleString()} VNĐ cho học phí tháng ${result.tuitionFee.billingMonth}/${result.tuitionFee.billingYear} lớp "${result.tuitionFee.className}" đã được hủy với lý do: "${dto.voidReason}".`,
        type: NotificationType.TUITION,
        referenceId: result.payment.id,
      });
    } catch {
      // Notification dispatch failure must not fail the financial transaction
    }

    return {
      message: result.message,
      payment: result.payment,
      tuitionFee: {
        id: result.tuitionFee.id,
        amountDue: result.tuitionFee.amountDue,
        totalPaid: result.tuitionFee.totalPaid,
        status: result.tuitionFee.status,
      },
    };
  }
}
