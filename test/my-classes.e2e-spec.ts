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
} from '../generated/prisma/client.js';

describe('My Classes & Session Management E2E Integration Audit', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let teacherA: any;
  let teacherB: any;
  let student1: any;
  let student2: any;

  let tokenTeacherA: string;
  let tokenTeacherB: string;
  let tokenStudent1: string;
  let tokenStudent2: string;

  let classAId: string;
  let sessionLiveId: string;
  let sessionFutureId: string;
  let sessionCompletedId: string;

  const createdClassIds: string[] = [];
  const createdSessionIds: string[] = [];

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

    // 1. Tạo test users với số điện thoại duy nhất
    teacherA = await prisma.user.upsert({
      where: { phone: '+84966001001' },
      update: { isActive: true, role: UserRole.TEACHER },
      create: {
        fullName: 'Thầy Giáo Văn A',
        phone: '+84966001001',
        passwordHash: 'dummy_hash',
        role: UserRole.TEACHER,
        isActive: true,
      },
    });

    teacherB = await prisma.user.upsert({
      where: { phone: '+84966001002' },
      update: { isActive: true, role: UserRole.TEACHER },
      create: {
        fullName: 'Cô Giáo Toán B',
        phone: '+84966001002',
        passwordHash: 'dummy_hash',
        role: UserRole.TEACHER,
        isActive: true,
      },
    });

    student1 = await prisma.user.upsert({
      where: { phone: '+84966001003' },
      update: { isActive: true, role: UserRole.STUDENT },
      create: {
        fullName: 'Học Sinh Đã Ghi Danh',
        phone: '+84966001003',
        passwordHash: 'dummy_hash',
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    student2 = await prisma.user.upsert({
      where: { phone: '+84966001004' },
      update: { isActive: true, role: UserRole.STUDENT },
      create: {
        fullName: 'Học Sinh Ngoài Lớp',
        phone: '+84966001004',
        passwordHash: 'dummy_hash',
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    tokenTeacherA = await jwtService.signAsync(
      { sub: teacherA.id, role: UserRole.TEACHER, phone: teacherA.phone },
      { secret: jwtSecret },
    );
    tokenTeacherB = await jwtService.signAsync(
      { sub: teacherB.id, role: UserRole.TEACHER, phone: teacherB.phone },
      { secret: jwtSecret },
    );
    tokenStudent1 = await jwtService.signAsync(
      { sub: student1.id, role: UserRole.STUDENT, phone: student1.phone },
      { secret: jwtSecret },
    );
    tokenStudent2 = await jwtService.signAsync(
      { sub: student2.id, role: UserRole.STUDENT, phone: student2.phone },
      { secret: jwtSecret },
    );

    // 2. Tạo lớp học của Teacher A
    const classA = await prisma.class.create({
      data: {
        name: 'Lớp Ôn Thi Đại Học Khối D',
        description: 'Lớp chuyên sâu Văn - Anh',
        defaultMeetUrl: 'https://meet.google.com/class-default-url',
        createdById: teacherA.id,
        teacherId: teacherA.id,
        status: ClassStatus.ACTIVE,
      },
    });
    classAId = classA.id;
    createdClassIds.push(classAId);

    // 3. Cho student1 tham gia ACTIVE vào Class A
    await prisma.enrollment.create({
      data: {
        classId: classAId,
        studentId: student1.id,
        status: MemberStatus.ACTIVE,
        joinedAt: new Date(),
      },
    });

    // 4. Tạo các buổi học thử nghiệm
    // 4.1 Buổi học đang diễn ra (LIVE)
    const sessionLive = await prisma.classSession.create({
      data: {
        classId: classAId,
        title: 'Buổi 1: Phân tích Vợ chồng A Phủ',
        startTime: new Date(Date.now() - 10 * 60 * 1000), // Bắt đầu 10 phút trước
        endTime: new Date(Date.now() + 50 * 60 * 1000),
        meetUrl: 'https://meet.google.com/live-room-abc',
        status: SessionStatus.IN_PROGRESS,
        createdById: teacherA.id,
      },
    });
    sessionLiveId = sessionLive.id;
    createdSessionIds.push(sessionLiveId);

    // 4.2 Buổi học tương lai (Chưa đến giờ, chưa mở cửa sổ 15 phút)
    const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000); // Ngày mai
    const sessionFuture = await prisma.classSession.create({
      data: {
        classId: classAId,
        title: 'Buổi 2: Ôn tập Vợ nhặt',
        startTime: futureStart,
        endTime: new Date(futureStart.getTime() + 2 * 60 * 60 * 1000),
        meetUrl: 'https://meet.google.com/future-room-xyz',
        status: SessionStatus.SCHEDULED,
        createdById: teacherA.id,
      },
    });
    sessionFutureId = sessionFuture.id;
    createdSessionIds.push(sessionFutureId);

    // 4.3 Buổi học đã hoàn thành
    const pastStart = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const sessionCompleted = await prisma.classSession.create({
      data: {
        classId: classAId,
        title: 'Buổi 0: Nhập môn Văn học',
        startTime: pastStart,
        endTime: new Date(pastStart.getTime() + 2 * 60 * 60 * 1000),
        meetUrl: 'https://meet.google.com/past-room',
        status: SessionStatus.COMPLETED,
        createdById: teacherA.id,
      },
    });
    sessionCompletedId = sessionCompleted.id;
    createdSessionIds.push(sessionCompletedId);
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu test
    if (createdSessionIds.length > 0) {
      await prisma.attendanceChangeLog.deleteMany({
        where: { attendance: { sessionId: { in: createdSessionIds } } },
      });
      await prisma.attendance.deleteMany({
        where: { sessionId: { in: createdSessionIds } },
      });
      await prisma.classSession.deleteMany({
        where: { id: { in: createdSessionIds } },
      });
    }
    if (createdClassIds.length > 0) {
      await prisma.enrollment.deleteMany({
        where: { classId: { in: createdClassIds } },
      });
      await prisma.class.deleteMany({
        where: { id: { in: createdClassIds } },
      });
    }
    await app.close();
  });

  // =========================================================================
  // 1. DANH SÁCH & CHI TIẾT LỚP HỌC (STUDENT)
  // =========================================================================
  describe('1. Danh sách và Chi tiết Lớp học của Học sinh', () => {
    it('GET /student/classes — Học sinh 1 chỉ thấy lớp mình đã ghi danh ACTIVE (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/student/classes')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      expect(res.body.items).toBeDefined();
      const found = res.body.items.find((i: any) => i.class.id === classAId);
      expect(found).toBeDefined();
      expect(found.class.name).toBe('Lớp Ôn Thi Đại Học Khối D');

      // Không để lộ Meet URL thô khi chưa có điều kiện
      expect(found.class.defaultMeetUrl).toBeUndefined();
      // Có thông tin buổi học tiếp theo
      expect(found.class.nextSession).toBeDefined();
      expect(found.class.nextSession.id).toBe(sessionLiveId);
      expect(found.class.nextSession.canJoinMeet).toBe(true);
      expect(found.class.nextSession.meetUrl).toBe(
        'https://meet.google.com/live-room-abc',
      );
    });

    it('GET /student/classes — Học sinh 2 chưa ghi danh sẽ không có lớp nào (200, items rỗng)', async () => {
      const res = await request(app.getHttpServer())
        .get('/student/classes')
        .set('Authorization', `Bearer ${tokenStudent2}`)
        .expect(200);

      const found = res.body.items.find((i: any) => i.class.id === classAId);
      expect(found).toBeUndefined();
    });

    it('GET /student/classes/:classId — Học sinh 1 xem chi tiết lớp học thành công (200)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/student/classes/${classAId}`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      expect(res.body.id).toBe(classAId);
      expect(res.body.teacher.fullName).toBe('Thầy Giáo Văn A');
      expect(res.body.nextSession).toBeDefined();
      expect(res.body.attendanceSummary).toBeDefined();
    });

    it('GET /student/classes/:classId — Học sinh 2 không được xem chi tiết lớp học của người khác (403)', async () => {
      await request(app.getHttpServer())
        .get(`/student/classes/${classAId}`)
        .set('Authorization', `Bearer ${tokenStudent2}`)
        .expect(403);
    });
  });

  // =========================================================================
  // 2. DANH SÁCH BUỔI HỌC VÀ BẢO MẬT LINK MEET
  // =========================================================================
  describe('2. Danh sách Buổi học & Bảo mật Link Google Meet', () => {
    it('GET /student/classes/:classId/sessions — Trả về danh sách buổi và ẩn Meet URL với buổi chưa đến giờ (200)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/student/classes/${classAId}/sessions`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      expect(res.body.items).toBeDefined();
      expect(res.body.items.length).toBeGreaterThanOrEqual(2);

      const liveSess = res.body.items.find((s: any) => s.id === sessionLiveId);
      expect(liveSess).toBeDefined();
      expect(liveSess.canJoinMeet).toBe(true);
      expect(liveSess.meetUrl).toBe('https://meet.google.com/live-room-abc');

      const futureSess = res.body.items.find(
        (s: any) => s.id === sessionFutureId,
      );
      expect(futureSess).toBeDefined();
      expect(futureSess.canJoinMeet).toBe(false);
      // meetUrl phải là null để ngăn chặn học sinh lấy sớm
      expect(futureSess.meetUrl).toBeNull();
      expect(futureSess.joinWindow.isOpen).toBe(false);
    });

    it('GET /student/classes/:classId/sessions — Học sinh 2 bị chặn truy cập (403)', async () => {
      await request(app.getHttpServer())
        .get(`/student/classes/${classAId}/sessions`)
        .set('Authorization', `Bearer ${tokenStudent2}`)
        .expect(403);
    });
  });

  // =========================================================================
  // 3. QUYỀN THAM GIA GOOGLE MEET (CỬA SỔ 15 PHÚT & PHÂN QUYỀN)
  // =========================================================================
  describe('3. Kiểm tra cấp quyền và link Google Meet', () => {
    it('GET /student/sessions/:sessionId/join-meet — Cấp link thành công cho buổi đang LIVE (200)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/student/sessions/${sessionLiveId}/join-meet`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      expect(res.body.canJoin).toBe(true);
      expect(res.body.meetUrl).toBe('https://meet.google.com/live-room-abc');
      expect(res.body.isLive).toBe(true);

      // Kiểm tra mở Meet không tự động coi là đã điểm danh
      const checkAtt = await prisma.attendance.findUnique({
        where: {
          sessionId_studentId: {
            sessionId: sessionLiveId,
            studentId: student1.id,
          },
        },
      });
      expect(checkAtt).toBeNull();
    });

    it('GET /student/sessions/:sessionId/join-meet — Từ chối buổi tương lai chưa mở cửa sổ 15 phút (403)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/student/sessions/${sessionFutureId}/join-meet`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(403);

      expect(res.body.message).toContain('Chưa đến thời gian mở phòng học');
    });

    it('GET /student/sessions/:sessionId/join-meet — Từ chối buổi học đã kết thúc (403)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/student/sessions/${sessionCompletedId}/join-meet`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(403);

      expect(res.body.message).toContain('kết thúc');
    });

    it('GET /student/sessions/:sessionId/join-meet — Học sinh ngoài lớp không được lấy link (403)', async () => {
      await request(app.getHttpServer())
        .get(`/student/sessions/${sessionLiveId}/join-meet`)
        .set('Authorization', `Bearer ${tokenStudent2}`)
        .expect(403);
    });
  });

  // =========================================================================
  // 4. ĐIỂM DANH (HỌC SINH TỰ CHECK-IN & CHỐNG ĐIỂM DANH TRÙNG)
  // =========================================================================
  describe('4. Học sinh tự Điểm danh & Chống Trùng lặp', () => {
    it('POST /student/sessions/:sessionId/check-in — Học sinh 1 điểm danh buổi LIVE thành công (201)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/student/sessions/${sessionLiveId}/check-in`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .send({ note: 'Học sinh tham gia đúng giờ' })
        .expect(201);

      expect(res.body.alreadyCheckedIn).toBe(false);
      expect(res.body.attendance).toBeDefined();
      expect(res.body.attendance.status).toBe(AttendanceStatus.PRESENT);
      expect(res.body.attendance.checkedInAt).toBeDefined();
    });

    it('POST /student/sessions/:sessionId/check-in — Điểm danh lần 2 trả về trạng thái đã có, không tạo trùng (201)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/student/sessions/${sessionLiveId}/check-in`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .send({ note: 'Thử điểm danh lại' })
        .expect(201);

      expect(res.body.alreadyCheckedIn).toBe(true);
      expect(res.body.message).toContain('hoàn tất điểm danh');

      // Xác nhận DB chỉ có duy nhất 1 bản ghi
      const count = await prisma.attendance.count({
        where: { sessionId: sessionLiveId, studentId: student1.id },
      });
      expect(count).toBe(1);
    });

    it('POST /student/sessions/:sessionId/check-in — Học sinh 2 ngoài lớp bị chặn (403)', async () => {
      await request(app.getHttpServer())
        .post(`/student/sessions/${sessionLiveId}/check-in`)
        .set('Authorization', `Bearer ${tokenStudent2}`)
        .expect(403);
    });
  });

  // =========================================================================
  // 5. GIÁO VIÊN BẮT ĐẦU / KẾT THÚC BUỔI HỌC & QUẢN LÝ ĐIỂM DANH
  // =========================================================================
  describe('5. Giáo viên Bắt đầu / Kết thúc & Quản lý Điểm danh', () => {
    let sessionToControlId: string;

    beforeAll(async () => {
      const sess = await prisma.classSession.create({
        data: {
          classId: classAId,
          title: 'Buổi 3: Luyện đề tổng hợp',
          startTime: new Date(Date.now() + 60 * 60 * 1000),
          endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
          status: SessionStatus.SCHEDULED,
          createdById: teacherA.id,
        },
      });
      sessionToControlId = sess.id;
      createdSessionIds.push(sessionToControlId);
    });

    it('POST /teacher/sessions/:sessionId/start — Giáo viên khác bị chặn 403 khi cố bắt đầu buổi học', async () => {
      await request(app.getHttpServer())
        .post(`/teacher/sessions/${sessionToControlId}/start`)
        .set('Authorization', `Bearer ${tokenTeacherB}`)
        .expect(403);
    });

    it('POST /teacher/sessions/:sessionId/start — Giáo viên phụ trách bắt đầu buổi học thành công (LIVE) (201)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/teacher/sessions/${sessionToControlId}/start`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(201);

      expect(res.body.session.status).toBe(SessionStatus.IN_PROGRESS);
    });

    it('PUT /sessions/:sessionId/attendance — Chặn đánh dấu vắng (ABSENT) khi buổi học đang diễn ra (400)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/sessions/${sessionToControlId}/attendance`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          records: [
            { studentId: student1.id, status: AttendanceStatus.ABSENT },
          ],
        })
        .expect(400);

      expect(res.body.message).toContain('Không thể đánh dấu vắng (ABSENT)');
    });

    it('POST /teacher/sessions/:sessionId/end — Giáo viên phụ trách kết thúc buổi học (COMPLETED) (201)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/teacher/sessions/${sessionToControlId}/end`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(201);

      expect(res.body.session.status).toBe(SessionStatus.COMPLETED);
    });

    it('PUT /sessions/:sessionId/attendance — Sau khi buổi kết thúc, cho phép ghi nhận vắng (200)', async () => {
      const res = await request(app.getHttpServer())
        .put(`/sessions/${sessionToControlId}/attendance`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          records: [
            { studentId: student1.id, status: AttendanceStatus.ABSENT },
          ],
        })
        .expect(200);

      expect(res.body.count).toBe(1);
    });
  });
});
