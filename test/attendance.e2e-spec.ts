import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UserRole,
  ClassStatus,
  MemberStatus,
  SessionStatus,
  AttendanceStatus,
  AttendanceSessionStatus,
  CorrectionRequestStatus,
} from '../generated/prisma/client.js';

describe('Attendance Full Feature E2E Integration Audit', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let adminUser: any;
  let teacherA: any;
  let teacherB: any;
  let student1: any;
  let student2: any;

  let tokenAdmin: string;
  let tokenTeacherA: string;
  let tokenTeacherB: string;
  let tokenStudent1: string;
  let tokenStudent2: string;

  let class1: any;
  let class2: any;
  let session1: any;
  let _session2: any;
  let attendanceRecord1: any;
  let createdCorrectionRequestId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
    const configService = app.get(ConfigService);
    const jwtSecret =
      configService.get<string>('JWT_ACCESS_SECRET') || 'secret';

    // 1. Tạo test users
    adminUser = await prisma.user.upsert({
      where: { phone: '+84999000001' },
      update: { isActive: true, role: UserRole.ADMIN },
      create: {
        fullName: 'Admin Test',
        phone: '+84999000001',
        passwordHash: 'dummy_hash',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    teacherA = await prisma.user.upsert({
      where: { phone: '+84999000002' },
      update: { isActive: true, role: UserRole.TEACHER },
      create: {
        fullName: 'Cô Giáo Vân A',
        phone: '+84999000002',
        passwordHash: 'dummy_hash',
        role: UserRole.TEACHER,
        isActive: true,
      },
    });

    teacherB = await prisma.user.upsert({
      where: { phone: '+84999000003' },
      update: { isActive: true, role: UserRole.TEACHER },
      create: {
        fullName: 'Thầy Giáo B',
        phone: '+84999000003',
        passwordHash: 'dummy_hash',
        role: UserRole.TEACHER,
        isActive: true,
      },
    });

    student1 = await prisma.user.upsert({
      where: { phone: '+84999000004' },
      update: { isActive: true, role: UserRole.STUDENT },
      create: {
        fullName: 'Học Sinh An 1',
        phone: '+84999000004',
        passwordHash: 'dummy_hash',
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    student2 = await prisma.user.upsert({
      where: { phone: '+84999000005' },
      update: { isActive: true, role: UserRole.STUDENT },
      create: {
        fullName: 'Học Sinh Bình 2',
        phone: '+84999000005',
        passwordHash: 'dummy_hash',
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    // 2. Ký JWT Tokens
    tokenAdmin = jwtService.sign(
      { sub: adminUser.id, role: adminUser.role, phone: adminUser.phone },
      { secret: jwtSecret, expiresIn: '2h' },
    );
    tokenTeacherA = jwtService.sign(
      { sub: teacherA.id, role: teacherA.role, phone: teacherA.phone },
      { secret: jwtSecret, expiresIn: '2h' },
    );
    tokenTeacherB = jwtService.sign(
      { sub: teacherB.id, role: teacherB.role, phone: teacherB.phone },
      { secret: jwtSecret, expiresIn: '2h' },
    );
    tokenStudent1 = jwtService.sign(
      { sub: student1.id, role: student1.role, phone: student1.phone },
      { secret: jwtSecret, expiresIn: '2h' },
    );
    tokenStudent2 = jwtService.sign(
      { sub: student2.id, role: student2.role, phone: student2.phone },
      { secret: jwtSecret, expiresIn: '2h' },
    );

    // 3. Tạo 2 Lớp học
    class1 = await prisma.class.create({
      data: {
        name: 'Lớp Toán Chuyên 12',
        classCode: `MATH12_${Date.now()}`,
        joinCode: `JOIN_A_${Date.now()}`,
        teacherId: teacherA.id,
        createdById: adminUser.id,
        monthlyTuition: 1200000,
        status: ClassStatus.ACTIVE,
      },
    });

    class2 = await prisma.class.create({
      data: {
        name: 'Lớp Lý Chuyên 12',
        classCode: `PHYS12_${Date.now()}`,
        joinCode: `JOIN_B_${Date.now()}`,
        teacherId: teacherB.id,
        createdById: adminUser.id,
        monthlyTuition: 1100000,
        status: ClassStatus.ACTIVE,
      },
    });

    // 4. Enrollments: student1 và student2 thuộc class1; student1 không thuộc class2
    const joinedAt = new Date(Date.now() - 3600000 * 5);
    await prisma.enrollment.createMany({
      data: [
        {
          classId: class1.id,
          studentId: student1.id,
          status: MemberStatus.ACTIVE,
          joinedAt,
        },
        {
          classId: class1.id,
          studentId: student2.id,
          status: MemberStatus.ACTIVE,
          joinedAt,
        },
      ],
    });

    // 5. Tạo Sessions
    const startTime = new Date(Date.now() - 3600000 * 2);
    const endTime = new Date(Date.now() - 3600000);

    session1 = await prisma.classSession.create({
      data: {
        classId: class1.id,
        title: 'Buổi 1: Đạo hàm & Khảo sát',
        startTime,
        endTime,
        status: SessionStatus.COMPLETED,
        createdById: teacherA.id,
      },
    });

    _session2 = await prisma.classSession.create({
      data: {
        classId: class2.id,
        title: 'Buổi 1: Dao động điều hòa',
        startTime,
        endTime,
        status: SessionStatus.COMPLETED,
        createdById: teacherB.id,
      },
    });
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu test an toàn
    try {
      if (class1?.id || class2?.id) {
        const classIds = [class1?.id, class2?.id].filter(Boolean);
        await prisma.attendanceChangeLog.deleteMany({
          where: { attendance: { session: { classId: { in: classIds } } } },
        });
        await prisma.attendanceCorrectionRequest.deleteMany({
          where: { attendance: { session: { classId: { in: classIds } } } },
        });
        await prisma.attendance.deleteMany({
          where: { session: { classId: { in: classIds } } },
        });
        await prisma.attendanceSession.deleteMany({
          where: { classId: { in: classIds } },
        });
        await prisma.monthlyAttendanceSummary.deleteMany({
          where: { classId: { in: classIds } },
        });
        await prisma.classAttendanceConfig.deleteMany({
          where: { classId: { in: classIds } },
        });
        await prisma.classSession.deleteMany({
          where: { classId: { in: classIds } },
        });
        await prisma.enrollment.deleteMany({
          where: { classId: { in: classIds } },
        });
        await prisma.class.deleteMany({
          where: { id: { in: classIds } },
        });
      }
    } catch {
      // bỏ qua lỗi dọn dẹp
    }
    await app.close();
  });

  describe('1. Kiểm tra phân quyền truy cập phiên điểm danh (Anti-IDOR)', () => {
    it('Teacher A truy cập danh sách học sinh & phiên điểm danh của lớp mình thành công', async () => {
      const res = await request(app.getHttpServer())
        .get(`/sessions/${session1.id}/attendance`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      expect(res.body.session.id).toBe(session1.id);
      expect(res.body.students).toHaveLength(2);
      expect(res.body.students[0].attendance).toBeNull();
    });

    it('Chống IDOR: Teacher B bị từ chối (403 Forbidden) khi truy cập session của Teacher A', async () => {
      const res = await request(app.getHttpServer())
        .get(`/sessions/${session1.id}/attendance`)
        .set('Authorization', `Bearer ${tokenTeacherB}`)
        .expect(403);

      expect(res.body.message).toContain('không phải là giáo viên phụ trách');
    });

    it('Student bị chặn (403) do RolesGuard khi gọi endpoint giáo viên', async () => {
      await request(app.getHttpServer())
        .get(`/sessions/${session1.id}/attendance`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(403);
    });

    it('ADMIN có toàn quyền truy cập bất kỳ buổi học nào', async () => {
      const res = await request(app.getHttpServer())
        .get(`/sessions/${session1.id}/attendance`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(res.body.session.id).toBe(session1.id);
    });
  });

  describe('2. Mở phiên điểm danh & Đánh dấu có mặt tất cả (Mark All Present)', () => {
    it('Teacher A mở phiên điểm danh (OPEN)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/sessions/${session1.id}/attendance/open`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(201);

      expect(res.body.attendanceSession.status).toBe(AttendanceSessionStatus.OPEN);
    });

    it('Teacher A đánh dấu tất cả có mặt nhưng vẫn cho phép sửa từng em', async () => {
      const res = await request(app.getHttpServer())
        .post(`/sessions/${session1.id}/attendance/mark-all`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({ note: 'Điểm danh đầu giờ' })
        .expect(201);

      expect(res.body.count).toBe(2);

      // Kiểm tra lại danh sách điểm danh
      const getRes = await request(app.getHttpServer())
        .get(`/sessions/${session1.id}/attendance`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      expect(getRes.body.students[0].attendance.status).toBe(AttendanceStatus.PRESENT);
      expect(getRes.body.students[1].attendance.status).toBe(AttendanceStatus.PRESENT);
    });
  });

  describe('3. Cập nhật nhiều học sinh trong một request & chống tạo bản ghi trùng lặp', () => {
    it('Cập nhật trạng thái từng em (Student 1: PRESENT, Student 2: LATE)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/sessions/${session1.id}/attendance`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          records: [
            { studentId: student1.id, status: AttendanceStatus.PRESENT, note: 'Tập trung tốt' },
            { studentId: student2.id, status: AttendanceStatus.LATE, note: 'Vào muộn 15p' },
          ],
        })
        .expect(200);

      expect(res.body.count).toBe(2);

      // Lấy id của bản ghi student1 để dùng cho các test tiếp theo
      const att = await prisma.attendance.findUnique({
        where: {
          sessionId_studentId: {
            sessionId: session1.id,
            studentId: student1.id,
          },
        },
      });
      attendanceRecord1 = att;
      expect(attendanceRecord1).toBeDefined();
    });

    it('Gửi request lặp lại (Idempotency): KHÔNG tạo bản ghi trùng trong cơ sở dữ liệu', async () => {
      await request(app.getHttpServer())
        .put(`/sessions/${session1.id}/attendance`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          records: [
            { studentId: student1.id, status: AttendanceStatus.PRESENT },
            { studentId: student2.id, status: AttendanceStatus.LATE },
          ],
        })
        .expect(200);

      const count = await prisma.attendance.count({
        where: { sessionId: session1.id },
      });
      expect(count).toBe(2); // Vẫn chính xác 2 bản ghi cho 2 học sinh
    });
  });

  describe('4. Lưu bản nháp (Draft) & Chốt điểm danh (Close)', () => {
    it('Teacher A lưu bản nháp thành công', async () => {
      const res = await request(app.getHttpServer())
        .post(`/sessions/${session1.id}/attendance/save-draft`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          records: [
            { studentId: student1.id, status: AttendanceStatus.PRESENT },
            { studentId: student2.id, status: AttendanceStatus.EXCUSED_ABSENT },
          ],
        })
        .expect(201);

      expect(res.body.message).toContain('bản nháp');

      const attSession = await prisma.attendanceSession.findUnique({
        where: { sessionId: session1.id },
      });
      expect(attSession?.status).toBe(AttendanceSessionStatus.DRAFT);
    });

    it('Teacher A chốt điểm danh (CLOSED)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/sessions/${session1.id}/attendance/close`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({ note: 'Đã hoàn tất xác minh buổi học' })
        .expect(201);

      expect(res.body.attendanceSession.status).toBe(AttendanceSessionStatus.CLOSED);
      expect(res.body.attendanceSession.closedById).toBe(teacherA.id);
    });

    it('Khi điểm danh đã chốt: CHẶN sửa trực tiếp điểm danh', async () => {
      const res = await request(app.getHttpServer())
        .put(`/sessions/${session1.id}/attendance`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          records: [
            { studentId: student1.id, status: AttendanceStatus.PRESENT },
          ],
        })
        .expect(400);

      expect(res.body.message).toContain('đã được chốt');
    });
  });

  describe('5. Lịch sử & Tổng hợp theo lớp dành cho giáo viên', () => {
    it('Xem lịch sử điểm danh theo lớp có phân trang và lọc', async () => {
      const res = await request(app.getHttpServer())
        .get(`/classes/${class1.id}/attendance/history?page=1&limit=10`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      expect(res.body.items).toBeDefined();
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(2);
    });

    it('Xem tổng hợp số buổi theo từng trạng thái của lớp', async () => {
      const res = await request(app.getHttpServer())
        .get(`/classes/${class1.id}/attendance/summary`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      expect(res.body.summary).toBeDefined();
      expect(res.body.summary[AttendanceStatus.PRESENT]).toBeDefined();
    });
  });

  describe('6. API dành cho học sinh (Bảo mật, chống IDOR)', () => {
    it('Học sinh 1 xem lịch sử điểm danh của chính mình', async () => {
      const res = await request(app.getHttpServer())
        .get('/student/attendance')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      expect(res.body.items).toBeDefined();
      expect(res.body.items.length).toBeGreaterThanOrEqual(1);
      // Đảm bảo không lộ thông tin của học sinh khác
      for (const item of res.body.items) {
        expect(item.studentId).toBe(student1.id);
      }
    });

    it('Học sinh 1 xem tổng hợp số buổi của mình', async () => {
      const res = await request(app.getHttpServer())
        .get('/student/attendance/summary')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      expect(res.body.studentId).toBe(student1.id);
      expect(res.body.summary).toBeDefined();
    });

    it('Chống IDOR: Học sinh 1 không thể truy cập lớp 2 mà mình không tham gia', async () => {
      await request(app.getHttpServer())
        .get(`/student/attendance?classId=${class2.id}`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(403);
    });
  });

  describe('7. Quy trình điều chỉnh điểm danh (Correction Request)', () => {
    it('Học sinh 1 gửi yêu cầu điều chỉnh trạng thái điểm danh', async () => {
      const res = await request(app.getHttpServer())
        .post('/student/attendance/correction-requests')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .send({
          attendanceId: attendanceRecord1.id,
          requestedStatus: AttendanceStatus.PRESENT,
          reason: 'Em có mặt trực tiếp nhưng điểm danh nhầm',
        })
        .expect(201);

      expect(res.body.request.status).toBe(CorrectionRequestStatus.PENDING);
      createdCorrectionRequestId = res.body.request.id;
    });

    it('Chống IDOR: Học sinh 2 không thể gửi yêu cầu điều chỉnh bản ghi của Học sinh 1', async () => {
      await request(app.getHttpServer())
        .post('/student/attendance/correction-requests')
        .set('Authorization', `Bearer ${tokenStudent2}`)
        .send({
          attendanceId: attendanceRecord1.id,
          requestedStatus: AttendanceStatus.PRESENT,
          reason: 'Xin sửa hộ bạn',
        })
        .expect(403);
    });

    it('Chống gửi trùng: Báo lỗi 409 Conflict khi đã có yêu cầu PENDING', async () => {
      const res = await request(app.getHttpServer())
        .post('/student/attendance/correction-requests')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .send({
          attendanceId: attendanceRecord1.id,
          requestedStatus: AttendanceStatus.PRESENT,
          reason: 'Gửi lại lần nữa',
        })
        .expect(409);

      expect(res.body.message).toContain('đang chờ xử lý');
    });

    it('Giáo viên xem danh sách yêu cầu điều chỉnh của lớp mình', async () => {
      const res = await request(app.getHttpServer())
        .get(`/attendance/correction-requests?classId=${class1.id}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].id).toBe(createdCorrectionRequestId);
    });

    it('Chống IDOR: Teacher B bị từ chối (403) khi duyệt yêu cầu của lớp Teacher A', async () => {
      await request(app.getHttpServer())
        .post(`/attendance/correction-requests/${createdCorrectionRequestId}/review`)
        .set('Authorization', `Bearer ${tokenTeacherB}`)
        .send({
          status: CorrectionRequestStatus.APPROVED,
          reviewNote: 'Duyệt trái phép',
        })
        .expect(403);
    });

    it('Teacher A duyệt yêu cầu (APPROVED) trong transaction: cập nhật attendance và ghi audit log', async () => {
      const res = await request(app.getHttpServer())
        .post(`/attendance/correction-requests/${createdCorrectionRequestId}/review`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          status: CorrectionRequestStatus.APPROVED,
          reviewNote: 'Đã xác nhận minh chứng qua webcam',
        })
        .expect(201);

      expect(res.body.request.status).toBe(CorrectionRequestStatus.APPROVED);

      // Kiểm tra bản ghi điểm danh đã được cập nhật
      const updatedAtt = await prisma.attendance.findUnique({
        where: { id: attendanceRecord1.id },
      });
      expect(updatedAtt?.status).toBe(AttendanceStatus.PRESENT);

      // Kiểm tra Change Log đã được tạo
      const changeLog = await prisma.attendanceChangeLog.findFirst({
        where: { attendanceId: attendanceRecord1.id },
      });
      expect(changeLog).toBeDefined();
      expect(changeLog?.changedById).toBe(teacherA.id);
    });
  });

  describe('8. Snapshot tổng kết tháng độc lập & Chốt học phí', () => {
    it('Chốt bảng tổng hợp tháng (Monthly Attendance & Tuition Summary)', async () => {
      const now = new Date();
      const billingYear = now.getFullYear();
      const billingMonth = now.getMonth() + 1;

      const res = await request(app.getHttpServer())
        .post(`/classes/${class1.id}/attendance/monthly-summary/close`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          billingYear,
          billingMonth,
          note: 'Chốt số liệu đối soát cuối tháng',
        })
        .expect(201);

      expect(res.body.count).toBe(2);
      expect(res.body.snapshots[0].isClosed).toBe(true);
      expect(res.body.snapshots[0].chargeableSessions).toBeGreaterThanOrEqual(1);
    });

    it('Xem bảng tổng hợp tháng đã chốt', async () => {
      const now = new Date();
      const billingYear = now.getFullYear();
      const billingMonth = now.getMonth() + 1;

      const res = await request(app.getHttpServer())
        .get(`/classes/${class1.id}/attendance/monthly-summary?billingYear=${billingYear}&billingMonth=${billingMonth}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      expect(res.body.isClosed).toBe(true);
      expect(res.body.items).toHaveLength(2);
    });
  });

  describe('9. Xuất báo cáo Excel (Chi tiết & Tổng hợp)', () => {
    it('Xuất Excel chi tiết trả về mã 200 và header tệp tin hợp lệ', async () => {
      const res = await request(app.getHttpServer())
        .get(`/classes/${class1.id}/attendance/export/detail`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      expect(res.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.body).toBeDefined();
    });

    it('Xuất Excel tổng hợp tháng thành công', async () => {
      const now = new Date();
      const res = await request(app.getHttpServer())
        .get(`/classes/${class1.id}/attendance/export/summary?year=${now.getFullYear()}&month=${now.getMonth() + 1}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      expect(res.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });
  });

  describe('10. Tác vụ dọn dẹp lưu trữ 60 ngày an toàn', () => {
    it('ADMIN kích hoạt tác vụ dọn dẹp an toàn', async () => {
      const res = await request(app.getHttpServer())
        .post('/attendance/cleanup')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(201);

      expect(res.body.result).toBeDefined();
      expect(res.body.result.errors).toEqual([]);
    });

    it('Giáo viên không có quyền kích hoạt tác vụ dọn dẹp (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/attendance/cleanup')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(403);
    });
  });
});
