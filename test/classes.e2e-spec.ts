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
} from '../generated/prisma/client.js';

describe('Teacher Class Management & Student Join E2E Integration Audit', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let teacherA: any;
  let teacherB: any;
  let student1: any;
  let student2: any;
  let student3: any;

  let tokenTeacherA: string;
  let tokenTeacherB: string;
  let tokenStudent1: string;
  let tokenStudent2: string;
  let tokenStudent3: string;

  const createdClassIds: string[] = [];
  const createdCalendarEventIds: string[] = [];

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

    // Khởi tạo các user kiểm thử duy nhất
    teacherA = await prisma.user.upsert({
      where: { phone: '+84988001001' },
      update: { isActive: true, role: UserRole.TEACHER },
      create: {
        fullName: 'Thầy Giáo Test A',
        phone: '+84988001001',
        passwordHash: 'dummy_hash',
        role: UserRole.TEACHER,
        isActive: true,
      },
    });

    teacherB = await prisma.user.upsert({
      where: { phone: '+84988001002' },
      update: { isActive: true, role: UserRole.TEACHER },
      create: {
        fullName: 'Cô Giáo Test B',
        phone: '+84988001002',
        passwordHash: 'dummy_hash',
        role: UserRole.TEACHER,
        isActive: true,
      },
    });

    student1 = await prisma.user.upsert({
      where: { phone: '+84988001003' },
      update: { isActive: true, role: UserRole.STUDENT },
      create: {
        fullName: 'Học Sinh Test 1',
        phone: '+84988001003',
        passwordHash: 'dummy_hash',
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    student2 = await prisma.user.upsert({
      where: { phone: '+84988001004' },
      update: { isActive: true, role: UserRole.STUDENT },
      create: {
        fullName: 'Học Sinh Test 2',
        phone: '+84988001004',
        passwordHash: 'dummy_hash',
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    student3 = await prisma.user.upsert({
      where: { phone: '+84988001005' },
      update: { isActive: true, role: UserRole.STUDENT },
      create: {
        fullName: 'Học Sinh Test 3',
        phone: '+84988001005',
        passwordHash: 'dummy_hash',
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    tokenTeacherA = jwtService.sign(
      { sub: teacherA.id, role: teacherA.role, phone: teacherA.phone },
      { secret: jwtSecret, expiresIn: '1h' },
    );
    tokenTeacherB = jwtService.sign(
      { sub: teacherB.id, role: teacherB.role, phone: teacherB.phone },
      { secret: jwtSecret, expiresIn: '1h' },
    );
    tokenStudent1 = jwtService.sign(
      { sub: student1.id, role: student1.role, phone: student1.phone },
      { secret: jwtSecret, expiresIn: '1h' },
    );
    tokenStudent2 = jwtService.sign(
      { sub: student2.id, role: student2.role, phone: student2.phone },
      { secret: jwtSecret, expiresIn: '1h' },
    );
    tokenStudent3 = jwtService.sign(
      { sub: student3.id, role: student3.role, phone: student3.phone },
      { secret: jwtSecret, expiresIn: '1h' },
    );
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu test
    if (createdCalendarEventIds.length > 0) {
      await prisma.teacherCalendarEvent.deleteMany({
        where: { id: { in: createdCalendarEventIds } },
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
  // 1. GIÁO VIÊN TẠO VÀ QUẢN LÝ LỚP HỌC
  // =========================================================================
  describe('1. Quản lý lớp của giáo viên', () => {
    let classAId: string;
    let initialJoinCode: string;

    it('POST /teacher/classes — Tạo lớp học với thông tin hợp lệ (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/teacher/classes')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          name: 'Lớp Ngữ Văn 12A',
          description: 'Lớp ôn thi THPT Quốc Gia môn Văn',
          maxStudents: 2,
          monthlyTuition: 1500000,
        })
        .expect(201);

      expect(res.body.class).toBeDefined();
      expect(res.body.class.name).toBe('Lớp Ngữ Văn 12A');
      expect(res.body.class.teacherId).toBe(teacherA.id);
      expect(res.body.class.status).toBe(ClassStatus.ACTIVE);
      expect(res.body.class.joinCode).toBeDefined();
      expect(res.body.class.maxStudents).toBe(2);

      classAId = res.body.class.id;
      initialJoinCode = res.body.class.joinCode;
      createdClassIds.push(classAId);
    });

    it('GET /teacher/classes — Xem danh sách lớp của mình (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/teacher/classes')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .query({ search: '12A' })
        .expect(200);

      expect(res.body.items).toBeDefined();
      expect(res.body.items.length).toBeGreaterThanOrEqual(1);
      const found = res.body.items.find((c: any) => c.id === classAId);
      expect(found).toBeDefined();
      expect(found.activeStudentCount).toBe(0);
    });

    it('GET /teacher/classes/:classId — Xem chi tiết lớp của mình (200)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/teacher/classes/${classAId}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      expect(res.body.id).toBe(classAId);
      expect(res.body.name).toBe('Lớp Ngữ Văn 12A');
      expect(res.body.activeStudentCount).toBe(0);
      expect(res.body.pendingRequestsCount).toBe(0);
    });

    it('GET /teacher/classes/:classId — Giáo viên khác không được xem lớp này (403)', async () => {
      await request(app.getHttpServer())
        .get(`/teacher/classes/${classAId}`)
        .set('Authorization', `Bearer ${tokenTeacherB}`)
        .expect(403);
    });

    it('PATCH /teacher/classes/:classId — Sửa thông tin lớp (200)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/teacher/classes/${classAId}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          name: 'Lớp Ngữ Văn 12A Chuyên Sâu',
          description: 'Mô tả cập nhật',
        })
        .expect(200);

      expect(res.body.class.name).toBe('Lớp Ngữ Văn 12A Chuyên Sâu');
      expect(res.body.class.description).toBe('Mô tả cập nhật');
    });

    it('PATCH /teacher/classes/:classId — Giáo viên khác không được sửa lớp (403)', async () => {
      await request(app.getHttpServer())
        .patch(`/teacher/classes/${classAId}`)
        .set('Authorization', `Bearer ${tokenTeacherB}`)
        .send({ name: 'Hack Name' })
        .expect(403);
    });

    it('POST /teacher/classes/:classId/regenerate-join-code — Tạo lại mã tham gia mới (201/200)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/teacher/classes/${classAId}/regenerate-join-code`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(201);

      expect(res.body.class.joinCode).toBeDefined();
      expect(res.body.class.joinCode).not.toBe(initialJoinCode);
      initialJoinCode = res.body.class.joinCode;
    });

    it('PATCH /teacher/classes/:classId/status — Đóng lớp học (200)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/teacher/classes/${classAId}/status`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({ status: ClassStatus.CLOSED })
        .expect(200);

      expect(res.body.class.status).toBe(ClassStatus.CLOSED);
    });

    it('POST /student/classes/join — Học sinh gửi mã tham gia vào lớp CLOSED bị từ chối (400)', async () => {
      const res = await request(app.getHttpServer())
        .post('/student/classes/join')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .send({ joinCode: initialJoinCode })
        .expect(400);

      expect(res.body.message).toContain('đóng');
    });

    it('PATCH /teacher/classes/:classId/status — Mở lại lớp học (200)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/teacher/classes/${classAId}/status`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({ status: ClassStatus.ACTIVE })
        .expect(200);

      expect(res.body.class.status).toBe(ClassStatus.ACTIVE);
    });
  });

  // =========================================================================
  // 2. HỌC SINH THAM GIA LỚP VÀ DUYỆT / TỪ CHỐI
  // =========================================================================
  describe('2. Quy trình gửi yêu cầu, duyệt, từ chối và quản lý thành viên', () => {
    let classId: string;
    let joinCode: string;
    let membership1Id: string;
    let membership2Id: string;
    let membership3Id: string;

    beforeAll(async () => {
      // Tạo lớp học giới hạn 2 học sinh (maxStudents = 2)
      const res = await request(app.getHttpServer())
        .post('/teacher/classes')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          name: 'Lớp Luyện Thi Văn 10',
          maxStudents: 2,
        })
        .expect(201);

      classId = res.body.class.id;
      joinCode = res.body.class.joinCode;
      createdClassIds.push(classId);
    });

    it('POST /student/classes/join — Học sinh gửi mã sai bị 404', async () => {
      await request(app.getHttpServer())
        .post('/student/classes/join')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .send({ joinCode: 'INVALID_CODE_999' })
        .expect(404);
    });

    it('POST /student/classes/join — Học sinh 1 gửi yêu cầu tham gia hợp lệ (201, PENDING)', async () => {
      const res = await request(app.getHttpServer())
        .post('/student/classes/join')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .send({ joinCode })
        .expect(201);

      expect(res.body.membership).toBeDefined();
      expect(res.body.membership.status).toBe(MemberStatus.PENDING);
      membership1Id = res.body.membership.id;
    });

    it('POST /student/classes/join — Không cho gửi yêu cầu trùng khi đang PENDING (409)', async () => {
      await request(app.getHttpServer())
        .post('/student/classes/join')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .send({ joinCode })
        .expect(409);
    });

    it('GET /teacher/classes/:classId/join-requests — Giáo viên xem danh sách yêu cầu chờ duyệt (200)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/teacher/classes/${classId}/join-requests`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].id).toBe(membership1Id);
      expect(res.body.items[0].student.fullName).toBe('Học Sinh Test 1');
    });

    it('GET /teacher/classes/:classId/join-requests — Giáo viên B không xem được của Giáo viên A (403)', async () => {
      await request(app.getHttpServer())
        .get(`/teacher/classes/${classId}/join-requests`)
        .set('Authorization', `Bearer ${tokenTeacherB}`)
        .expect(403);
    });

    it('POST /teacher/classes/:classId/join-requests/:membershipId/reject — Giáo viên từ chối yêu cầu (201/200)', async () => {
      const res = await request(app.getHttpServer())
        .post(
          `/teacher/classes/${classId}/join-requests/${membership1Id}/reject`,
        )
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(201);

      expect(res.body.membership.status).toBe(MemberStatus.REJECTED);
    });

    it('POST /student/classes/join — Học sinh bị từ chối được phép gửi lại yêu cầu mới (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/student/classes/join')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .send({ joinCode })
        .expect(201);

      expect(res.body.membership.status).toBe(MemberStatus.PENDING);
      membership1Id = res.body.membership.id;
    });

    it('POST /teacher/classes/:classId/join-requests/:membershipId/approve — Giáo viên duyệt học sinh 1 (201/200, ACTIVE)', async () => {
      const res = await request(app.getHttpServer())
        .post(
          `/teacher/classes/${classId}/join-requests/${membership1Id}/approve`,
        )
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(201);

      expect(res.body.membership.status).toBe(MemberStatus.ACTIVE);
      expect(res.body.membership.joinedAt).toBeDefined();
    });

    it('POST /student/classes/join — Học sinh đã ACTIVE không được gửi yêu cầu trùng (409)', async () => {
      await request(app.getHttpServer())
        .post('/student/classes/join')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .send({ joinCode })
        .expect(409);
    });

    it('GET /student/classes — Học sinh xem danh sách lớp đã tham gia thành công (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/student/classes')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].class.id).toBe(classId);
    });

    it('GET /student/classes/:classId — Học sinh xem chi tiết lớp mình đã tham gia (200)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/student/classes/${classId}`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      expect(res.body.id).toBe(classId);
      expect(res.body.teacher.fullName).toBe('Thầy Giáo Test A');
    });

    it('GET /student/classes/:classId — Học sinh 2 chưa tham gia không xem được chi tiết lớp (403)', async () => {
      await request(app.getHttpServer())
        .get(`/student/classes/${classId}`)
        .set('Authorization', `Bearer ${tokenStudent2}`)
        .expect(403);
    });

    // Thêm học sinh 2 để lớp đạt maxStudents = 2
    it('Học sinh 2 gửi yêu cầu và giáo viên duyệt (Lớp đạt 2/2 học sinh)', async () => {
      const joinRes = await request(app.getHttpServer())
        .post('/student/classes/join')
        .set('Authorization', `Bearer ${tokenStudent2}`)
        .send({ joinCode })
        .expect(201);
      membership2Id = joinRes.body.membership.id;

      const approveRes = await request(app.getHttpServer())
        .post(
          `/teacher/classes/${classId}/join-requests/${membership2Id}/approve`,
        )
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(201);
      expect(approveRes.body.membership.status).toBe(MemberStatus.ACTIVE);
    });

    // Học sinh 3 gửi yêu cầu khi lớp đã đủ 2 học sinh
    it('Học sinh 3 gửi yêu cầu -> giáo viên duyệt bị từ chối do vượt maxStudents (400)', async () => {
      const joinRes = await request(app.getHttpServer())
        .post('/student/classes/join')
        .set('Authorization', `Bearer ${tokenStudent3}`)
        .send({ joinCode })
        .expect(201);
      membership3Id = joinRes.body.membership.id;

      const approveRes = await request(app.getHttpServer())
        .post(
          `/teacher/classes/${classId}/join-requests/${membership3Id}/approve`,
        )
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(400);

      expect(approveRes.body.message).toContain('tối đa');
    });

    it('GET /teacher/classes/:classId/members — Giáo viên xem danh sách thành viên lớp (200)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/teacher/classes/${classId}/members`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      expect(res.body.items).toBeDefined();
      const activeMembers = res.body.items.filter(
        (m: any) => m.status === MemberStatus.ACTIVE,
      );
      expect(activeMembers).toHaveLength(2);
      // Đảm bảo không lộ thông tin nhạy cảm (passwordHash)
      for (const m of res.body.items) {
        expect(m.student.passwordHash).toBeUndefined();
      }
    });

    it('DELETE /student/classes/:classId/membership — Học sinh 1 tự rời lớp (LEFT) (200)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/student/classes/${classId}/membership`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      expect(res.body.membership.status).toBe(MemberStatus.LEFT);
    });

    it('Giáo viên duyệt học sinh 3 sau khi học sinh 1 đã rời lớp (Số lượng trở về < maxStudents) (201)', async () => {
      const approveRes = await request(app.getHttpServer())
        .post(
          `/teacher/classes/${classId}/join-requests/${membership3Id}/approve`,
        )
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(201);

      expect(approveRes.body.membership.status).toBe(MemberStatus.ACTIVE);
    });

    it('DELETE /teacher/classes/:classId/members/:studentId — Giáo viên xóa học sinh 2 khỏi lớp (REMOVED) (200)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/teacher/classes/${classId}/members/${student2.id}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      expect(res.body.membership.status).toBe(MemberStatus.REMOVED);
    });

    it('Học sinh 1 (LEFT) và học sinh 2 (REMOVED) đều có thể gửi lại yêu cầu tham gia (201)', async () => {
      await request(app.getHttpServer())
        .post('/student/classes/join')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .send({ joinCode })
        .expect(201);

      await request(app.getHttpServer())
        .post('/student/classes/join')
        .set('Authorization', `Bearer ${tokenStudent2}`)
        .send({ joinCode })
        .expect(201);
    });
  });

  // =========================================================================
  // 3. TÍCH HỢP VỚI LỊCH GIẢNG DẠY (TEACHER CALENDAR INTEGRATION)
  // =========================================================================
  describe('3. Tích hợp với Teacher Calendar', () => {
    let integrationClassId: string;
    let integrationJoinCode: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/teacher/classes')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          name: 'Lớp Test Tích Hợp Lịch Dạy',
        })
        .expect(201);

      integrationClassId = res.body.class.id;
      integrationJoinCode = res.body.class.joinCode;
      createdClassIds.push(integrationClassId);

      // Cho Student 1 và Student 2 tham gia ACTIVE
      const j1 = await request(app.getHttpServer())
        .post('/student/classes/join')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .send({ joinCode: integrationJoinCode })
        .expect(201);

      await request(app.getHttpServer())
        .post(
          `/teacher/classes/${integrationClassId}/join-requests/${j1.body.membership.id}/approve`,
        )
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(201);

      const j2 = await request(app.getHttpServer())
        .post('/student/classes/join')
        .set('Authorization', `Bearer ${tokenStudent2}`)
        .send({ joinCode: integrationJoinCode })
        .expect(201);

      await request(app.getHttpServer())
        .post(
          `/teacher/classes/${integrationClassId}/join-requests/${j2.body.membership.id}/approve`,
        )
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(201);

      // Student 3 chỉ PENDING (chưa được duyệt)
      await request(app.getHttpServer())
        .post('/student/classes/join')
        .set('Authorization', `Bearer ${tokenStudent3}`)
        .send({ joinCode: integrationJoinCode })
        .expect(201);
    });

    it('POST /teacher-calendar/events — Tạo ca dạy theo classId tự động mời học sinh ACTIVE (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/teacher-calendar/events')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Buổi học chuyên đề Văn học hiện thực',
          classId: integrationClassId,
          startAt: '2026-10-31T09:00:00.000Z',
          endAt: '2026-10-31T11:00:00.000Z',
        })
        .expect(201);

      const event = res.body.event;
      expect(event).toBeDefined();
      expect(event.classId).toBe(integrationClassId);
      createdCalendarEventIds.push(event.id);

      // Participants phải bao gồm Student 1 và Student 2, KHÔNG có Student 3 (vì PENDING)
      const participantStudentIds = event.participants.map(
        (p: any) => p.student.id,
      );
      expect(participantStudentIds).toContain(student1.id);
      expect(participantStudentIds).toContain(student2.id);
      expect(participantStudentIds).not.toContain(student3.id);
    });

    it('POST /teacher-calendar/events — Giáo viên B không thể tạo lịch cho lớp của Giáo viên A (403)', async () => {
      await request(app.getHttpServer())
        .post('/teacher-calendar/events')
        .set('Authorization', `Bearer ${tokenTeacherB}`)
        .send({
          title: 'Ca dạy mạo danh',
          classId: integrationClassId,
          startAt: '2026-10-31T14:00:00.000Z',
          endAt: '2026-10-31T16:00:00.000Z',
        })
        .expect(403);
    });
  });

  // =========================================================================
  // 4. BẢO MẬT VÀ PHÂN QUYỀN (SECURITY & ROLE GUARDS)
  // =========================================================================
  describe('4. Bảo mật, phân quyền và Validation', () => {
    it('STUDENT không thể gọi API tạo lớp của giáo viên (403)', async () => {
      await request(app.getHttpServer())
        .post('/teacher/classes')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .send({ name: 'Lớp học giả' })
        .expect(403);
    });

    it('TEACHER không thể gọi API gửi mã tham gia của học sinh (403)', async () => {
      await request(app.getHttpServer())
        .post('/student/classes/join')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({ joinCode: 'ANY_CODE' })
        .expect(403);
    });

    it('Không có Token -> 401 Unauthorized', async () => {
      await request(app.getHttpServer()).get('/teacher/classes').expect(401);

      await request(app.getHttpServer()).get('/student/classes').expect(401);
    });

    it('Dữ liệu không hợp lệ (ValidationPipe) -> 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post('/teacher/classes')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          name: '', // Empty name
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/student/classes/join')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .send({
          joinCode: '', // Empty joinCode
        })
        .expect(400);
    });
  });
});
