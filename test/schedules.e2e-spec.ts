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
  ScheduleStatus,
  MeetingType,
} from '../generated/prisma/client.js';
import { ScheduleRecurrence } from '../src/schedules/utils/recurrence.util.js';

describe('Schedules Management E2E Integration Audit (10 Scenarios)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let teacherA: any;
  let teacherB: any;
  let student1: any;
  let student2: any;
  let student3: any;
  let studentInactive: any;

  let classA: any;
  let classB: any;

  let tokenTeacherA: string;
  let tokenTeacherB: string;
  let tokenStudent1: string;
  let tokenStudent2: string;
  let tokenStudent3: string;

  const createdScheduleIds: string[] = [];
  const createdClassIds: string[] = [];

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

    // Tạo các tài khoản test với phone duy nhất
    teacherA = await prisma.user.upsert({
      where: { phone: '+84977001001' },
      update: { isActive: true, role: UserRole.TEACHER },
      create: {
        fullName: 'Thầy Giáo Văn A',
        phone: '+84977001001',
        passwordHash: 'dummy_hash',
        role: UserRole.TEACHER,
        isActive: true,
      },
    });

    teacherB = await prisma.user.upsert({
      where: { phone: '+84977001002' },
      update: { isActive: true, role: UserRole.TEACHER },
      create: {
        fullName: 'Cô Giáo Toán B',
        phone: '+84977001002',
        passwordHash: 'dummy_hash',
        role: UserRole.TEACHER,
        isActive: true,
      },
    });

    student1 = await prisma.user.upsert({
      where: { phone: '+84977001003' },
      update: { isActive: true, role: UserRole.STUDENT },
      create: {
        fullName: 'Học Sinh Lớp A và B',
        phone: '+84977001003',
        passwordHash: 'dummy_hash',
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    student2 = await prisma.user.upsert({
      where: { phone: '+84977001004' },
      update: { isActive: true, role: UserRole.STUDENT },
      create: {
        fullName: 'Học Sinh Lớp A',
        phone: '+84977001004',
        passwordHash: 'dummy_hash',
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    student3 = await prisma.user.upsert({
      where: { phone: '+84977001005' },
      update: { isActive: true, role: UserRole.STUDENT },
      create: {
        fullName: 'Học Sinh Ngoài Lớp',
        phone: '+84977001005',
        passwordHash: 'dummy_hash',
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    studentInactive = await prisma.user.upsert({
      where: { phone: '+84977001006' },
      update: { isActive: false, role: UserRole.STUDENT },
      create: {
        fullName: 'Học Sinh Đã Bị Vô Hiệu',
        phone: '+84977001006',
        passwordHash: 'dummy_hash',
        role: UserRole.STUDENT,
        isActive: false,
      },
    });

    tokenTeacherA = jwtService.sign(
      { sub: teacherA.id, role: UserRole.TEACHER, phone: teacherA.phone },
      { secret: jwtSecret },
    );
    tokenTeacherB = jwtService.sign(
      { sub: teacherB.id, role: UserRole.TEACHER, phone: teacherB.phone },
      { secret: jwtSecret },
    );
    tokenStudent1 = jwtService.sign(
      { sub: student1.id, role: UserRole.STUDENT, phone: student1.phone },
      { secret: jwtSecret },
    );
    tokenStudent2 = jwtService.sign(
      { sub: student2.id, role: UserRole.STUDENT, phone: student2.phone },
      { secret: jwtSecret },
    );
    tokenStudent3 = jwtService.sign(
      { sub: student3.id, role: UserRole.STUDENT, phone: student3.phone },
      { secret: jwtSecret },
    );

    // Tạo Class A cho Teacher A (student1 và student2 là active member)
    classA = await prisma.class.create({
      data: {
        name: 'Lớp Văn 12 Chuyên A',
        createdById: teacherA.id,
        teacherId: teacherA.id,
        status: ClassStatus.ACTIVE,
      },
    });
    createdClassIds.push(classA.id);

    await prisma.enrollment.createMany({
      data: [
        {
          classId: classA.id,
          studentId: student1.id,
          status: MemberStatus.ACTIVE,
        },
        {
          classId: classA.id,
          studentId: student2.id,
          status: MemberStatus.ACTIVE,
        },
      ],
    });

    // Tạo Class B cho Teacher B (student1 là active member)
    classB = await prisma.class.create({
      data: {
        name: 'Lớp Toán 12 Nâng Cao B',
        createdById: teacherB.id,
        teacherId: teacherB.id,
        status: ClassStatus.ACTIVE,
      },
    });
    createdClassIds.push(classB.id);

    await prisma.enrollment.create({
      data: {
        classId: classB.id,
        studentId: student1.id,
        status: MemberStatus.ACTIVE,
      },
    });
  });

  afterAll(async () => {
    // Dọn dẹp schedules
    if (createdScheduleIds.length > 0) {
      await prisma.calendarNotification.deleteMany({
        where: { eventId: { in: createdScheduleIds } },
      });
      await prisma.calendarEventParticipant.deleteMany({
        where: { eventId: { in: createdScheduleIds } },
      });
      await prisma.teacherCalendarEvent.deleteMany({
        where: { id: { in: createdScheduleIds } },
      });
    }

    // Dọn dẹp enrollments & classes
    if (createdClassIds.length > 0) {
      await prisma.enrollment.deleteMany({
        where: { classId: { in: createdClassIds } },
      });
      await prisma.class.deleteMany({
        where: { id: { in: createdClassIds } },
      });
    }

    // Dọn dẹp notifications & users
    const userIds = [
      teacherA.id,
      teacherB.id,
      student1.id,
      student2.id,
      student3.id,
      studentInactive.id,
    ];
    await prisma.notification.deleteMany({
      where: { recipientId: { in: userIds } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });

    await app.close();
  });

  // =========================================================================
  // KỊCH BẢN 1 & 2: GIÁO VIÊN TẠO LỊCH CHO LỚP; HỌC SINH TRONG LỚP XEM ĐƯỢC, NGOÀI LỚP KHÔNG
  // =========================================================================
  describe('Kịch bản 1 & 2: Lịch học cho lớp học', () => {
    let scheduleClassA: any;

    it('Kịch bản 1: Giáo viên tạo lịch cho lớp, học sinh trong lớp xem được lịch', async () => {
      const res = await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Buổi ôn tập Nghị luận xã hội Lớp A',
          description: 'Chuẩn bị bài tập số 3',
          startAt: '2026-11-10T08:00:00.000Z',
          endAt: '2026-11-10T10:00:00.000Z',
          classId: classA.id,
          meetingType: MeetingType.ONLINE_MEET,
          meetingUrl: 'https://meet.google.com/lop-a-123',
          location: 'Phòng học Google Meet',
          reminderMinutes: 30,
        })
        .expect(201);

      scheduleClassA = res.body.schedule;
      expect(scheduleClassA).toBeDefined();
      expect(scheduleClassA.id).toBeDefined();
      expect(scheduleClassA.classId).toBe(classA.id);
      expect(scheduleClassA.status).toBe(ScheduleStatus.SCHEDULED);
      createdScheduleIds.push(scheduleClassA.id);

      // Student 1 (thuộc Class A) xem danh sách lịch
      const stu1ListRes = await request(app.getHttpServer())
        .get('/student/schedules')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      const foundStu1 = stu1ListRes.body.schedules.find(
        (s: any) => s.id === scheduleClassA.id,
      );
      expect(foundStu1).toBeDefined();
      expect(foundStu1.title).toBe('Buổi ôn tập Nghị luận xã hội Lớp A');
      expect(foundStu1.class.name).toBe(classA.name);
      expect(foundStu1.teacher.fullName).toBe(teacherA.fullName);

      // Student 1 xem chi tiết lịch
      const stu1DetailRes = await request(app.getHttpServer())
        .get(`/student/schedules/${scheduleClassA.id}`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      expect(stu1DetailRes.body.id).toBe(scheduleClassA.id);
      expect(stu1DetailRes.body.meetingUrl).toBe('https://meet.google.com/lop-a-123');

      // Student 2 (cũng thuộc Class A) xem được lịch
      const stu2ListRes = await request(app.getHttpServer())
        .get('/student/schedules')
        .set('Authorization', `Bearer ${tokenStudent2}`)
        .expect(200);

      const foundStu2 = stu2ListRes.body.schedules.find(
        (s: any) => s.id === scheduleClassA.id,
      );
      expect(foundStu2).toBeDefined();
    });

    it('Kịch bản 2: Học sinh ngoài lớp không xem được lịch đó', async () => {
      // Student 3 không thuộc Class A
      const stu3ListRes = await request(app.getHttpServer())
        .get('/student/schedules')
        .set('Authorization', `Bearer ${tokenStudent3}`)
        .expect(200);

      const foundStu3 = stu3ListRes.body.schedules.find(
        (s: any) => s.id === scheduleClassA.id,
      );
      expect(foundStu3).toBeUndefined();

      // Student 3 thử truy cập chi tiết bằng ID bị chặn (404)
      await request(app.getHttpServer())
        .get(`/student/schedules/${scheduleClassA.id}`)
        .set('Authorization', `Bearer ${tokenStudent3}`)
        .expect(404);
    });
  });

  // =========================================================================
  // KỊCH BẢN 3 & 4: CHỈ ĐỊNH MỘT HOẶC NHIỀU HỌC SINH CỤ THỂ
  // =========================================================================
  describe('Kịch bản 3 & 4: Lịch học chỉ định học sinh cụ thể', () => {
    let scheduleSoloStudent3: any;
    let scheduleMultiStudents: any;

    it('Kịch bản 3: Giáo viên chỉ định 1 học sinh, đúng học sinh đó xem được lịch', async () => {
      const res = await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Kèm riêng kỹ năng viết cho Student 3',
          startAt: '2026-11-12T14:00:00.000Z',
          endAt: '2026-11-12T15:30:00.000Z',
          studentIds: [student3.id],
          meetingType: MeetingType.IN_PERSON,
          location: 'Phòng hội thảo 102',
        })
        .expect(201);

      scheduleSoloStudent3 = res.body.schedule;
      createdScheduleIds.push(scheduleSoloStudent3.id);

      // Student 3 xem được
      const stu3Res = await request(app.getHttpServer())
        .get(`/student/schedules/${scheduleSoloStudent3.id}`)
        .set('Authorization', `Bearer ${tokenStudent3}`)
        .expect(200);
      expect(stu3Res.body.title).toBe('Kèm riêng kỹ năng viết cho Student 3');

      // Student 1 và Student 2 không được chỉ định nên không xem được
      await request(app.getHttpServer())
        .get(`/student/schedules/${scheduleSoloStudent3.id}`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(404);

      await request(app.getHttpServer())
        .get(`/student/schedules/${scheduleSoloStudent3.id}`)
        .set('Authorization', `Bearer ${tokenStudent2}`)
        .expect(404);
    });

    it('Kịch bản 4: Giáo viên chỉ định nhiều học sinh, tất cả học sinh hợp lệ xem được lịch', async () => {
      const res = await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Nhóm bồi dưỡng học sinh giỏi Văn (Student 2 & Student 3)',
          startAt: '2026-11-14T09:00:00.000Z',
          endAt: '2026-11-14T11:00:00.000Z',
          studentIds: [student2.id, student3.id],
        })
        .expect(201);

      scheduleMultiStudents = res.body.schedule;
      createdScheduleIds.push(scheduleMultiStudents.id);

      // Cả Student 2 và Student 3 đều xem được
      await request(app.getHttpServer())
        .get(`/student/schedules/${scheduleMultiStudents.id}`)
        .set('Authorization', `Bearer ${tokenStudent2}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/student/schedules/${scheduleMultiStudents.id}`)
        .set('Authorization', `Bearer ${tokenStudent3}`)
        .expect(200);

      // Student 1 không nằm trong nhóm chỉ định nên không xem được
      await request(app.getHttpServer())
        .get(`/student/schedules/${scheduleMultiStudents.id}`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(404);
    });
  });

  // =========================================================================
  // KỊCH BẢN 5: TỔNG HỢP LỊCH TỪ NHIỀU NGUỒN KHÔNG BỊ TRÙNG LẶP
  // =========================================================================
  describe('Kịch bản 5: Tổng hợp lịch từ nhiều lớp và lịch riêng không trùng lặp', () => {
    let scheduleCombined: any;

    it('Tạo lịch vừa cho Class A vừa chỉ định thêm Student 1 trực tiếp (học sinh vừa trong lớp vừa được gán)', async () => {
      // Teacher B tạo 1 lịch cho Class B
      const schedClassBRes = await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherB}`)
        .send({
          title: 'Toán 12 - Giải tích nâng cao Lớp B',
          startAt: '2026-11-16T08:00:00.000Z',
          endAt: '2026-11-16T10:00:00.000Z',
          classId: classB.id,
        })
        .expect(201);
      createdScheduleIds.push(schedClassBRes.body.schedule.id);

      // Teacher A tạo 1 lịch cho Class A VÀ chỉ định thêm Student 1 (trực tiếp)
      const schedCombRes = await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Lịch phối hợp Class A và thêm Student 1 trực tiếp',
          startAt: '2026-11-18T08:00:00.000Z',
          endAt: '2026-11-18T10:00:00.000Z',
          classId: classA.id,
          studentIds: [student1.id, student3.id],
        })
        .expect(201);
      scheduleCombined = schedCombRes.body.schedule;
      createdScheduleIds.push(scheduleCombined.id);

      // Student 1 gọi API GET /student/schedules
      const res = await request(app.getHttpServer())
        .get('/student/schedules')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      // Kiểm tra danh sách không có ID nào bị lặp lại
      const scheduleIds = res.body.schedules.map((s: any) => s.id);
      const uniqueIds = new Set(scheduleIds);
      expect(scheduleIds.length).toBe(uniqueIds.size);

      // Lịch phối hợp chỉ xuất hiện đúng 1 lần duy nhất trong mảng trả về của Student 1
      const countCombined = scheduleIds.filter(
        (id: string) => id === scheduleCombined.id,
      ).length;
      expect(countCombined).toBe(1);
    });
  });

  // =========================================================================
  // KỊCH BẢN 6: CẬP NHẬT THỜI GIAN/LINK, DỮ LIỆU ĐỒNG BỘ TỨC THÌ
  // =========================================================================
  describe('Kịch bản 6: Cập nhật thông tin lịch', () => {
    let scheduleToUpdate: any;

    it('Cập nhật thời gian và link, học sinh lập tức nhận dữ liệu mới từ bản ghi nguồn', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Lịch chuẩn bị thay đổi thông tin',
          startAt: '2026-11-20T08:00:00.000Z',
          endAt: '2026-11-20T10:00:00.000Z',
          classId: classA.id,
          meetingUrl: 'https://meet.google.com/old-link',
        })
        .expect(201);
      scheduleToUpdate = createRes.body.schedule;
      createdScheduleIds.push(scheduleToUpdate.id);

      // Giáo viên cập nhật giờ mới và link mới
      const updateRes = await request(app.getHttpServer())
        .patch(`/teacher/schedules/${scheduleToUpdate.id}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Lịch ĐÃ ĐƯỢC CẬP NHẬT',
          startAt: '2026-11-20T14:00:00.000Z',
          endAt: '2026-11-20T16:00:00.000Z',
          meetingUrl: 'https://meet.google.com/new-brand-room',
        })
        .expect(200);

      expect(updateRes.body.schedule.title).toBe('Lịch ĐÃ ĐƯỢC CẬP NHẬT');
      expect(updateRes.body.schedule.meetingUrl).toBe('https://meet.google.com/new-brand-room');

      // Student 1 kiểm tra chi tiết: nhận ngay dữ liệu mới nhất
      const stuRes = await request(app.getHttpServer())
        .get(`/student/schedules/${scheduleToUpdate.id}`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      expect(stuRes.body.title).toBe('Lịch ĐÃ ĐƯỢC CẬP NHẬT');
      expect(stuRes.body.meetingUrl).toBe('https://meet.google.com/new-brand-room');
      expect(stuRes.body.startAt).toBe('2026-11-20T14:00:00.000Z');
      expect(stuRes.body.endAt).toBe('2026-11-20T16:00:00.000Z');
    });
  });

  // =========================================================================
  // KỊCH BẢN 7: HỦY LỊCH, HỌC SINH THẤY TRẠNG THÁI CANCELLED
  // =========================================================================
  describe('Kịch bản 7: Hủy lịch học', () => {
    let scheduleToCancel: any;

    it('Hủy lịch: bản ghi được giữ lại và chuyển trạng thái CANCELLED', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Ca thực hành cuối tuần',
          startAt: '2026-11-22T08:00:00.000Z',
          endAt: '2026-11-22T10:00:00.000Z',
          classId: classA.id,
        })
        .expect(201);
      scheduleToCancel = createRes.body.schedule;
      createdScheduleIds.push(scheduleToCancel.id);

      // Giáo viên hủy lịch
      const cancelRes = await request(app.getHttpServer())
        .patch(`/teacher/schedules/${scheduleToCancel.id}/cancel`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      expect(cancelRes.body.schedule.status).toBe(ScheduleStatus.CANCELLED);

      // Học sinh xem chi tiết lịch vẫn xem được và thấy trạng thái CANCELLED
      const stuDetailRes = await request(app.getHttpServer())
        .get(`/student/schedules/${scheduleToCancel.id}`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      expect(stuDetailRes.body.status).toBe(ScheduleStatus.CANCELLED);

      // Học sinh lọc theo trạng thái CANCELLED
      const stuListRes = await request(app.getHttpServer())
        .get('/student/schedules?status=CANCELLED')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      const foundCancelled = stuListRes.body.schedules.find(
        (s: any) => s.id === scheduleToCancel.id,
      );
      expect(foundCancelled).toBeDefined();
      expect(foundCancelled.status).toBe(ScheduleStatus.CANCELLED);
    });
  });

  // =========================================================================
  // KỊCH BẢN 8: HỌC SINH KHÔNG THỂ XEM LỊCH CỦA NGƯỜI KHÁC BẰNG CÁCH THAY ID
  // =========================================================================
  describe('Kịch bản 8: Bảo mật dữ liệu học sinh', () => {
    it('Học sinh không thể xem lịch riêng tư của người khác khi đổi ID trên URL (404 Not Found)', async () => {
      // Teacher A tạo lịch riêng chỉ cho Student 2
      const res = await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Buổi tư vấn tâm lý riêng cho Student 2',
          startAt: '2026-11-25T08:00:00.000Z',
          endAt: '2026-11-25T09:00:00.000Z',
          studentIds: [student2.id],
        })
        .expect(201);
      const secretSchedule = res.body.schedule;
      createdScheduleIds.push(secretSchedule.id);

      // Student 3 (không có quyền) thử truy cập xem chi tiết
      await request(app.getHttpServer())
        .get(`/student/schedules/${secretSchedule.id}`)
        .set('Authorization', `Bearer ${tokenStudent3}`)
        .expect(404);

      // Student 1 (cũng không được chỉ định) thử truy cập xem chi tiết
      await request(app.getHttpServer())
        .get(`/student/schedules/${secretSchedule.id}`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(404);
    });
  });

  // =========================================================================
  // KỊCH BẢN 9: PHÂN QUYỀN GIÁO VIÊN ĐỐI VỚI LỚP VÀ LỊCH DẠY
  // =========================================================================
  describe('Kịch bản 9: Giáo viên không có quyền không thể tạo/sửa lịch lớp khác', () => {
    let scheduleOfB: any;

    it('Tạo lịch mẫu của Teacher B', async () => {
      const res = await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherB}`)
        .send({
          title: 'Lịch riêng của Teacher B',
          startAt: '2026-11-26T08:00:00.000Z',
          endAt: '2026-11-26T10:00:00.000Z',
          classId: classB.id,
        })
        .expect(201);
      scheduleOfB = res.body.schedule;
      createdScheduleIds.push(scheduleOfB.id);
    });

    it('Teacher A không thể tạo lịch cho lớp của Teacher B (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Teacher A cố tình tạo lịch vào Class B',
          startAt: '2026-11-26T14:00:00.000Z',
          endAt: '2026-11-26T16:00:00.000Z',
          classId: classB.id, // Class B thuộc Teacher B
        })
        .expect(403);
    });

    it('Teacher A không thể sửa lịch của Teacher B (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .patch(`/teacher/schedules/${scheduleOfB.id}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({ title: 'Hacked by Teacher A' })
        .expect(403);
    });

    it('Teacher A không thể hủy lịch của Teacher B (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .patch(`/teacher/schedules/${scheduleOfB.id}/cancel`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(403);
    });

    it('Teacher A không thể xem chi tiết lịch của Teacher B (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .get(`/teacher/schedules/${scheduleOfB.id}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(403);
    });
  });

  // =========================================================================
  // KỊCH BẢN 10: XỬ LÝ DỮ LIỆU KHÔNG TỒN TẠI, THỜI GIAN KHÔNG HỢP LỆ, PAYLOAD THIẾU
  // =========================================================================
  describe('Kịch bản 10: Validation dữ liệu và xử lý ngoại lệ', () => {
    it('Từ chối khi thiếu title (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          startAt: '2026-11-28T08:00:00.000Z',
          endAt: '2026-11-28T10:00:00.000Z',
        })
        .expect(400);
    });

    it('Từ chối khi startAt >= endAt (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Lịch sai thời gian',
          startAt: '2026-11-28T10:00:00.000Z',
          endAt: '2026-11-28T08:00:00.000Z',
        })
        .expect(400);
    });

    it('Từ chối khi classId không tồn tại (404 Not Found)', async () => {
      await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Lịch lớp ma',
          startAt: '2026-11-28T08:00:00.000Z',
          endAt: '2026-11-28T10:00:00.000Z',
          classId: 'non-existent-class-id',
        })
        .expect(404);
    });

    it('Từ chối khi studentId không tồn tại trong hệ thống (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Lịch học sinh ma',
          startAt: '2026-11-28T08:00:00.000Z',
          endAt: '2026-11-28T10:00:00.000Z',
          studentIds: ['non-existent-student-id'],
        })
        .expect(400);
    });

    it('Từ chối khi chỉ định học sinh đã bị vô hiệu hóa isActive = false (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Lịch học sinh inactive',
          startAt: '2026-11-28T08:00:00.000Z',
          endAt: '2026-11-28T10:00:00.000Z',
          studentIds: [studentInactive.id],
        })
        .expect(400);
    });

    it('Xử lý ID trùng lặp trong studentIds: tự động deduplicate không sinh lỗi', async () => {
      const res = await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Lịch test trùng lặp ID trong mảng',
          startAt: '2026-11-28T08:00:00.000Z',
          endAt: '2026-11-28T10:00:00.000Z',
          studentIds: [student1.id, student1.id, student1.id],
        })
        .expect(201);

      createdScheduleIds.push(res.body.schedule.id);
      expect(res.body.schedule.participants).toHaveLength(1);
    });

    it('Truy vấn lịch với ID không tồn tại trả về 404', async () => {
      await request(app.getHttpServer())
        .get('/teacher/schedules/non-existent-schedule-id')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(404);

      await request(app.getHttpServer())
        .patch('/teacher/schedules/non-existent-schedule-id')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({ title: 'New' })
        .expect(404);

      await request(app.getHttpServer())
        .patch('/teacher/schedules/non-existent-schedule-id/cancel')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(404);
    });
  });

  // =========================================================================
  // KỊCH BẢN 11: LẶP LẠI HÀNG TUẦN TRONG MỘT THÁNG (RECURRENCE: WEEKLY_FOR_MONTH)
  // =========================================================================
  describe('Kịch bản 11: Lặp lại hàng tuần trong một tháng', () => {
    let recurringScheduleIds: string[] = [];

    it('Tạo chuỗi lịch lặp lại hàng tuần trong một tháng cho lớp: tạo đúng 5 buổi độc lập từ 27/10/2026', async () => {
      const res = await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Khóa bồi dưỡng định kỳ Văn 12',
          description: 'Luyện đề nghị luận văn học hàng tuần',
          startAt: '2026-10-27T08:00:00.000Z',
          endAt: '2026-10-27T10:00:00.000Z',
          timezone: 'Asia/Ho_Chi_Minh',
          classId: classA.id,
          meetingType: MeetingType.ONLINE_MEET,
          meetingUrl: 'https://meet.google.com/rec-lop-a',
          location: 'Phòng học trực tuyến Google Meet',
          reminderMinutes: 15,
          recurrence: ScheduleRecurrence.WEEKLY_FOR_MONTH,
        })
        .expect(201);

      expect(res.body.message).toBe('Tạo chuỗi lịch học lặp lại thành công');
      expect(res.body.totalOccurrences).toBe(5);
      expect(res.body.schedules).toBeDefined();
      expect(res.body.schedules).toHaveLength(5);
      expect(res.body.schedule).toBeDefined();
      expect(res.body.schedule.id).toBe(res.body.schedules[0].id);

      recurringScheduleIds = res.body.schedules.map((s: any) => s.id);
      createdScheduleIds.push(...recurringScheduleIds);

      // Kiểm tra tính độc lập và ngày của các buổi
      const expectedDays = [27, 3, 10, 17, 24];
      const expectedMonths = [10, 11, 11, 11, 11];

      res.body.schedules.forEach((sch: any, idx: number) => {
        const startDate = new Date(sch.startAt);
        const endDate = new Date(sch.endAt);

        expect(sch.classId).toBe(classA.id);
        expect(sch.teacherId).toBe(teacherA.id);
        expect(sch.status).toBe(ScheduleStatus.SCHEDULED);
        expect(sch.meetingUrl).toBe('https://meet.google.com/rec-lop-a');
        expect(sch.location).toBe('Phòng học trực tuyến Google Meet');

        // Kiểm tra ngày và tháng
        expect(startDate.getUTCDate()).toBe(expectedDays[idx]);
        expect(startDate.getUTCMonth() + 1).toBe(expectedMonths[idx]);

        // Giờ bắt đầu và kết thúc nhất quán theo startAt/endAt gốc (08:00 UTC và 10:00 UTC)
        expect(startDate.getUTCHours()).toBe(8);
        expect(startDate.getUTCMinutes()).toBe(0);
        expect(endDate.getUTCHours()).toBe(10);
        expect(endDate.getUTCMinutes()).toBe(0);

        // Thứ trong tuần phải giữ nguyên: thứ Ba
        expect(startDate.getUTCDay()).toBe(2);
      });
    });

    it('Học sinh trong lớp xem được đầy đủ 5 buổi qua /student/schedules', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/student/schedules')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      const foundSchedules = listRes.body.schedules.filter((s: any) =>
        recurringScheduleIds.includes(s.id),
      );
      expect(foundSchedules).toHaveLength(5);
    });

    it('Từ chối kiểu lặp lại không hỗ trợ (400 Bad Request)', async () => {
      await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Lịch lặp không hợp lệ',
          startAt: '2026-11-10T08:00:00.000Z',
          endAt: '2026-11-10T10:00:00.000Z',
          recurrence: 'DAILY', // không hỗ trợ
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Lịch lặp không hợp lệ 2',
          startAt: '2026-11-10T08:00:00.000Z',
          endAt: '2026-11-10T10:00:00.000Z',
          recurrence: 'YEARLY',
        })
        .expect(400);
    });

    it('Học sinh không thể gọi API tạo lịch (403 Forbidden)', async () => {
      await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .send({
          title: 'Học sinh giả mạo tạo lịch',
          startAt: '2026-11-10T08:00:00.000Z',
          endAt: '2026-11-10T10:00:00.000Z',
          recurrence: ScheduleRecurrence.WEEKLY_FOR_MONTH,
        })
        .expect(403);
    });

    it('Hủy hoặc sửa một buổi trong chuỗi không làm ảnh hưởng các buổi còn lại', async () => {
      const targetId = recurringScheduleIds[1]; // buổi thứ 2

      // Hủy buổi thứ 2
      await request(app.getHttpServer())
        .patch(`/teacher/schedules/${targetId}/cancel`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      // Kiểm tra buổi thứ 2 đã bị CANCELLED
      const detailRes = await request(app.getHttpServer())
        .get(`/teacher/schedules/${targetId}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);
      expect(detailRes.body.status).toBe(ScheduleStatus.CANCELLED);

      // Kiểm tra các buổi khác vẫn giữ nguyên SCHEDULED
      const otherDetailRes = await request(app.getHttpServer())
        .get(`/teacher/schedules/${recurringScheduleIds[0]}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);
      expect(otherDetailRes.body.status).toBe(ScheduleStatus.SCHEDULED);
    });

    it('Tạo một buổi cũ (không truyền recurrence): vẫn tạo 1 buổi độc lập bình thường', async () => {
      const res = await request(app.getHttpServer())
        .post('/teacher/schedules')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Buổi học phụ đạo 1-1',
          startAt: '2026-11-20T14:00:00.000Z',
          endAt: '2026-11-20T16:00:00.000Z',
          studentIds: [student1.id],
        })
        .expect(201);

      expect(res.body.message).toBe('Tạo lịch học thành công');
      expect(res.body.schedule).toBeDefined();
      expect(res.body.schedules).toBeUndefined();
      createdScheduleIds.push(res.body.schedule.id);
    });
  });
});
