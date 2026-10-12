import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CalendarNotificationWorkerService } from '../src/calendar/calendar-notification-worker.service.js';
import {
  UserRole,
  CalendarNotificationStatus,
  NotificationType,
} from '../generated/prisma/client.js';

describe('Teaching Calendar E2E Audit (12 Scenarios)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let worker: CalendarNotificationWorkerService;

  let teacherA: any;
  let teacherB: any;
  let student1: any;
  let student2: any;
  let student3: any;
  let studentInactive: any;

  let tokenTeacherA: string;
  let tokenTeacherB: string;
  let tokenStudent1: string;
  let _tokenStudent2: string;
  let tokenStudent3: string;

  const testEventIds: string[] = [];
  const testLabelIds: string[] = [];

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
    worker = app.get(CalendarNotificationWorkerService);
    const configService = app.get(ConfigService);
    const jwtSecret =
      configService.get<string>('JWT_ACCESS_SECRET') || 'secret';

    // Tạo các tài khoản test với thông tin duy nhất
    teacherA = await prisma.user.upsert({
      where: { phone: '+84999111001' },
      update: { isActive: true, role: UserRole.TEACHER },
      create: {
        fullName: 'Giáo viên Test A',
        phone: '+84999111001',
        passwordHash: 'dummy_hash',
        role: UserRole.TEACHER,
        isActive: true,
      },
    });

    teacherB = await prisma.user.upsert({
      where: { phone: '+84999111002' },
      update: { isActive: true, role: UserRole.TEACHER },
      create: {
        fullName: 'Giáo viên Test B',
        phone: '+84999111002',
        passwordHash: 'dummy_hash',
        role: UserRole.TEACHER,
        isActive: true,
      },
    });

    student1 = await prisma.user.upsert({
      where: { phone: '+84999111003' },
      update: { isActive: true, role: UserRole.STUDENT },
      create: {
        fullName: 'Học sinh Test 1',
        phone: '+84999111003',
        passwordHash: 'dummy_hash',
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    student2 = await prisma.user.upsert({
      where: { phone: '+84999111004' },
      update: { isActive: true, role: UserRole.STUDENT },
      create: {
        fullName: 'Học sinh Test 2',
        phone: '+84999111004',
        passwordHash: 'dummy_hash',
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    student3 = await prisma.user.upsert({
      where: { phone: '+84999111005' },
      update: { isActive: true, role: UserRole.STUDENT },
      create: {
        fullName: 'Học sinh Test 3',
        phone: '+84999111005',
        passwordHash: 'dummy_hash',
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    studentInactive = await prisma.user.upsert({
      where: { phone: '+84999111006' },
      update: { isActive: false, role: UserRole.STUDENT },
      create: {
        fullName: 'Học sinh Inactive',
        phone: '+84999111006',
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
    _tokenStudent2 = jwtService.sign(
      { sub: student2.id, role: UserRole.STUDENT, phone: student2.phone },
      { secret: jwtSecret },
    );
    tokenStudent3 = jwtService.sign(
      { sub: student3.id, role: UserRole.STUDENT, phone: student3.phone },
      { secret: jwtSecret },
    );
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu test
    if (testEventIds.length > 0) {
      await prisma.calendarNotification.deleteMany({
        where: { eventId: { in: testEventIds } },
      });
      await prisma.calendarEventParticipant.deleteMany({
        where: { eventId: { in: testEventIds } },
      });
      await prisma.teacherCalendarEvent.deleteMany({
        where: { id: { in: testEventIds } },
      });
    }

    if (testLabelIds.length > 0) {
      await prisma.teacherCalendarLabel.deleteMany({
        where: { id: { in: testLabelIds } },
      });
    }

    await prisma.notification.deleteMany({
      where: {
        recipientId: {
          in: [teacherA.id, teacherB.id, student1.id, student2.id, student3.id],
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: {
          in: [
            teacherA.id,
            teacherB.id,
            student1.id,
            student2.id,
            student3.id,
            studentInactive.id,
          ],
        },
      },
    });

    await app.close();
  });

  // =========================================================================
  // SCENARIO 1: GIÁO VIÊN A KHÔNG THỂ ĐỌC, SỬA, XÓA LỊCH HOẶC NHÃN CỦA GIÁO VIÊN B
  // =========================================================================
  describe('Tình huống 1: Phân quyền giữa 2 giáo viên', () => {
    let labelB: any;
    let eventB: any;

    it('Tạo nhãn và sự kiện cho Teacher B', async () => {
      const labelRes = await request(app.getHttpServer())
        .post('/teacher-calendar/labels')
        .set('Authorization', `Bearer ${tokenTeacherB}`)
        .send({ name: 'Nhãn riêng B', color: '#336699' })
        .expect(201);
      labelB = labelRes.body.label;
      testLabelIds.push(labelB.id);

      const eventRes = await request(app.getHttpServer())
        .post('/teacher-calendar/events')
        .set('Authorization', `Bearer ${tokenTeacherB}`)
        .send({
          title: 'Ca dạy riêng của B',
          startAt: '2026-10-20T08:00:00.000Z',
          endAt: '2026-10-20T10:00:00.000Z',
          labelId: labelB.id,
        })
        .expect(201);
      eventB = eventRes.body.event;
      testEventIds.push(eventB.id);
    });

    it('Teacher A không thể đọc sự kiện của Teacher B (403)', async () => {
      await request(app.getHttpServer())
        .get(`/teacher-calendar/events/${eventB.id}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(403);
    });

    it('Teacher A không thể sửa sự kiện của Teacher B (403)', async () => {
      await request(app.getHttpServer())
        .patch(`/teacher-calendar/events/${eventB.id}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({ title: 'Hacked by A' })
        .expect(403);
    });

    it('Teacher A không thể xóa sự kiện của Teacher B (403)', async () => {
      await request(app.getHttpServer())
        .delete(`/teacher-calendar/events/${eventB.id}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(403);
    });

    it('Teacher A không thể dùng nhãn của Teacher B khi tạo lịch (403)', async () => {
      await request(app.getHttpServer())
        .post('/teacher-calendar/events')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Ca của A dùng nhãn B',
          startAt: '2026-10-20T14:00:00.000Z',
          endAt: '2026-10-20T16:00:00.000Z',
          labelId: labelB.id,
        })
        .expect(403);
    });

    it('Teacher A không thể sửa nhãn của Teacher B (403)', async () => {
      await request(app.getHttpServer())
        .patch(`/teacher-calendar/labels/${labelB.id}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({ name: 'Hacked Label' })
        .expect(403);
    });

    it('Teacher A không thể xóa nhãn của Teacher B (403)', async () => {
      await request(app.getHttpServer())
        .delete(`/teacher-calendar/labels/${labelB.id}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(403);
    });
  });

  // =========================================================================
  // SCENARIO 2: HỌC SINH CHỈ XEM ĐƯỢC SỰ KIỆN MÌNH THAM GIA, KHÔNG LỘ HỌC SINH KHÁC
  // =========================================================================
  describe('Tình huống 2: Quyền riêng tư của học sinh', () => {
    let eventShared: any;

    it('Tạo ca dạy với Student 1 và Student 2 (Student 3 không tham gia)', async () => {
      const res = await request(app.getHttpServer())
        .post('/teacher-calendar/events')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Ca chuyên đề 12A',
          startAt: '2026-10-21T08:00:00.000Z',
          endAt: '2026-10-21T10:00:00.000Z',
          studentIds: [student1.id, student2.id],
        })
        .expect(201);
      eventShared = res.body.event;
      testEventIds.push(eventShared.id);
    });

    it('Student 1 xem danh sách lịch: không lộ danh sách học sinh khác', async () => {
      const res = await request(app.getHttpServer())
        .get('/student-calendar/events')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      const found = res.body.events.find((e: any) => e.id === eventShared.id);
      expect(found).toBeDefined();
      expect(found.participants).toBeUndefined(); // Không lộ participants
      expect(found.teacher).toBeDefined();
      expect(found.teacher.fullName).toBe(teacherA.fullName);
    });

    it('Student 1 xem chi tiết ca dạy: không lộ danh sách học sinh khác', async () => {
      const res = await request(app.getHttpServer())
        .get(`/student-calendar/events/${eventShared.id}`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      expect(res.body.id).toBe(eventShared.id);
      expect(res.body.participants).toBeUndefined(); // Không chứa participants
      expect(res.body.teacher).toBeDefined();
    });

    it('Student 3 không tham gia: không xem được chi tiết ca dạy (404)', async () => {
      await request(app.getHttpServer())
        .get(`/student-calendar/events/${eventShared.id}`)
        .set('Authorization', `Bearer ${tokenStudent3}`)
        .expect(404);
    });

    it('Student 3 xem danh sách lịch: không có ca dạy này', async () => {
      const res = await request(app.getHttpServer())
        .get('/student-calendar/events')
        .set('Authorization', `Bearer ${tokenStudent3}`)
        .expect(200);

      const found = res.body.events.find((e: any) => e.id === eventShared.id);
      expect(found).toBeUndefined();
    });
  });

  // =========================================================================
  // SCENARIO 3: TẠO LỊCH VỚI 3 HỌC SINH TẠO NHẮC LỊCH CHO GIÁO VIÊN VÀ CẢ 3 HỌC SINH
  // =========================================================================
  describe('Tình huống 3: Tạo nhắc lịch cho giáo viên và 3 học sinh', () => {
    let eventMultiStudents: any;

    it('Tạo ca dạy với 3 học sinh và reminderMinutes = 30', async () => {
      const res = await request(app.getHttpServer())
        .post('/teacher-calendar/events')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Ca bồi dưỡng Văn 12 (3 học sinh)',
          startAt: '2026-10-25T08:00:00.000Z',
          endAt: '2026-10-25T10:00:00.000Z',
          reminderMinutes: 30,
          studentIds: [student1.id, student2.id, student3.id],
        })
        .expect(201);
      eventMultiStudents = res.body.event;
      testEventIds.push(eventMultiStudents.id);

      // Kiểm tra DB có đúng 4 notification PENDING: giáo viên + 3 học sinh
      const notifications = await prisma.calendarNotification.findMany({
        where: { eventId: eventMultiStudents.id },
      });

      expect(notifications).toHaveLength(4);
      const recipientIds = notifications.map((n) => n.recipientId);
      expect(recipientIds).toContain(teacherA.id);
      expect(recipientIds).toContain(student1.id);
      expect(recipientIds).toContain(student2.id);
      expect(recipientIds).toContain(student3.id);

      for (const n of notifications) {
        expect(n.status).toBe(CalendarNotificationStatus.PENDING);
        // scheduledAt phải trước startAt 30 phút (07:30 UTC)
        expect(n.scheduledAt.toISOString()).toBe('2026-10-25T07:30:00.000Z');
      }
    });

    // =========================================================================
    // SCENARIO 4: SỬA STARTAT, REMINDERMINUTES HỦY JOB CŨ VÀ LÊN LỊCH LẠI CHÍNH XÁC
    // =========================================================================
    it('Tình huống 4: Sửa giờ và reminderMinutes hủy job cũ và lên lịch lại', async () => {
      await request(app.getHttpServer())
        .patch(`/teacher-calendar/events/${eventMultiStudents.id}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          startAt: '2026-10-25T14:00:00.000Z',
          endAt: '2026-10-25T16:00:00.000Z',
          reminderMinutes: 60,
        })
        .expect(200);

      const allNotifications = await prisma.calendarNotification.findMany({
        where: { eventId: eventMultiStudents.id },
      });

      const cancelled = allNotifications.filter(
        (n) => n.status === CalendarNotificationStatus.CANCELLED,
      );
      const pending = allNotifications.filter(
        (n) => n.status === CalendarNotificationStatus.PENDING,
      );

      // 4 job cũ bị CANCELLED
      expect(cancelled).toHaveLength(4);
      // 4 job mới PENDING được tạo với scheduledAt mới (14:00 - 60 phút = 13:00 UTC)
      expect(pending).toHaveLength(4);
      for (const n of pending) {
        expect(n.scheduledAt.toISOString()).toBe('2026-10-25T13:00:00.000Z');
      }
    });
  });

  // =========================================================================
  // SCENARIO 5 & 6: THÊM VÀ GỠ HỌC SINH KHỎI CA DẠY
  // =========================================================================
  describe('Tình huống 5 & 6: Thêm và gỡ học sinh khỏi ca dạy', () => {
    let eventDynamic: any;

    it('Tình huống 5: Thêm học sinh vào ca dạy tạo nhắc lịch cho học sinh mới', async () => {
      // Tạo ca chỉ có Student 1
      const res = await request(app.getHttpServer())
        .post('/teacher-calendar/events')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Ca thêm bớt học sinh',
          startAt: '2026-10-26T08:00:00.000Z',
          endAt: '2026-10-26T10:00:00.000Z',
          reminderMinutes: 15,
          studentIds: [student1.id],
        })
        .expect(201);
      eventDynamic = res.body.event;
      testEventIds.push(eventDynamic.id);

      // Thêm Student 2 vào ca
      await request(app.getHttpServer())
        .post(`/teacher-calendar/events/${eventDynamic.id}/participants`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({ studentId: student2.id })
        .expect(201);

      // Kiểm tra DB: Student 2 có job PENDING
      const notifStu2 = await prisma.calendarNotification.findFirst({
        where: {
          eventId: eventDynamic.id,
          recipientId: student2.id,
          status: CalendarNotificationStatus.PENDING,
        },
      });
      expect(notifStu2).toBeDefined();
      expect(notifStu2?.scheduledAt.toISOString()).toBe(
        '2026-10-26T07:45:00.000Z',
      );
    });

    it('Tình huống 6: Gỡ học sinh hủy job của học sinh đó, không ảnh hưởng người khác', async () => {
      // Gỡ Student 2
      await request(app.getHttpServer())
        .delete(
          `/teacher-calendar/events/${eventDynamic.id}/participants/${student2.id}`,
        )
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      // Job của Student 2 phải chuyển thành CANCELLED
      const notifStu2 = await prisma.calendarNotification.findFirst({
        where: {
          eventId: eventDynamic.id,
          recipientId: student2.id,
        },
      });
      expect(notifStu2?.status).toBe(CalendarNotificationStatus.CANCELLED);

      // Job của Teacher A và Student 1 vẫn PENDING bình thường
      const notifTeacher = await prisma.calendarNotification.findFirst({
        where: {
          eventId: eventDynamic.id,
          recipientId: teacherA.id,
        },
      });
      const notifStu1 = await prisma.calendarNotification.findFirst({
        where: {
          eventId: eventDynamic.id,
          recipientId: student1.id,
        },
      });

      expect(notifTeacher?.status).toBe(CalendarNotificationStatus.PENDING);
      expect(notifStu1?.status).toBe(CalendarNotificationStatus.PENDING);
    });
  });

  // =========================================================================
  // SCENARIO 7: XÓA LỊCH HỦY JOB LIÊN QUAN VÀ KHÔNG CÒN HIỂN THỊ Ở LỊCH HỌC SINH
  // =========================================================================
  describe('Tình huống 7: Xóa ca dạy', () => {
    let eventToDelete: any;

    it('Tạo ca dạy và sau đó xóa', async () => {
      const res = await request(app.getHttpServer())
        .post('/teacher-calendar/events')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Ca chuẩn bị xóa',
          startAt: '2026-10-27T08:00:00.000Z',
          endAt: '2026-10-27T10:00:00.000Z',
          reminderMinutes: 20,
          studentIds: [student1.id],
        })
        .expect(201);
      eventToDelete = res.body.event;

      // Xóa ca dạy
      await request(app.getHttpServer())
        .delete(`/teacher-calendar/events/${eventToDelete.id}`)
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      // Kiểm tra DB: ca dạy, participant và notification đã bị xóa (Cascade)
      const eventDb = await prisma.teacherCalendarEvent.findUnique({
        where: { id: eventToDelete.id },
      });
      const participantsDb = await prisma.calendarEventParticipant.findMany({
        where: { eventId: eventToDelete.id },
      });
      const notifsDb = await prisma.calendarNotification.findMany({
        where: { eventId: eventToDelete.id },
      });

      expect(eventDb).toBeNull();
      expect(participantsDb).toHaveLength(0);
      expect(notifsDb).toHaveLength(0);

      // Học sinh không còn thấy ca này
      const studentRes = await request(app.getHttpServer())
        .get('/student-calendar/events')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      const found = studentRes.body.events.find(
        (e: any) => e.id === eventToDelete.id,
      );
      expect(found).toBeUndefined();
    });
  });

  // =========================================================================
  // SCENARIO 8: REMINDERMINUTES = 0
  // =========================================================================
  describe('Tình huống 8: reminderMinutes = 0 nhắc đúng giờ bắt đầu', () => {
    it('Tạo ca với reminderMinutes = 0 có scheduledAt đúng bằng startAt', async () => {
      const startAt = '2026-10-28T09:00:00.000Z';
      const res = await request(app.getHttpServer())
        .post('/teacher-calendar/events')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Ca nhắc đúng giờ bắt đầu',
          startAt,
          endAt: '2026-10-28T11:00:00.000Z',
          reminderMinutes: 0,
          studentIds: [student1.id],
        })
        .expect(201);
      const event = res.body.event;
      testEventIds.push(event.id);

      const notifs = await prisma.calendarNotification.findMany({
        where: { eventId: event.id },
      });
      expect(notifs).toHaveLength(2);
      for (const n of notifs) {
        expect(n.scheduledAt.toISOString()).toBe(startAt);
      }
    });
  });

  // =========================================================================
  // SCENARIO 9: JOB FAILED VÀ KHÔI PHỤC JOB PROCESSING BỊ TREO
  // =========================================================================
  describe('Tình huống 9: Khôi phục job PROCESSING bị treo', () => {
    it('Khôi phục tự động job PROCESSING bị treo quá 5 phút về PENDING', async () => {
      const tempEvent = await prisma.teacherCalendarEvent.create({
        data: {
          teacherId: teacherA.id,
          title: 'Ca test worker recovery',
          startAt: new Date('2026-10-29T08:00:00Z'),
          endAt: new Date('2026-10-29T10:00:00Z'),
        },
      });
      testEventIds.push(tempEvent.id);

      // Giả lập job bị treo ở PROCESSING từ 10 phút trước
      const stuckNotif = await prisma.calendarNotification.create({
        data: {
          eventId: tempEvent.id,
          recipientId: teacherA.id,
          scheduledAt: new Date(Date.now() - 600000),
          status: CalendarNotificationStatus.PROCESSING,
          updatedAt: new Date(Date.now() - 600000), // 10 phút trước
          retryCount: 0,
        },
      });

      // Kích hoạt khôi phục
      const recoveredCount = await worker.recoverStuckProcessingJobs();
      expect(recoveredCount).toBeGreaterThanOrEqual(1);

      const updated = await prisma.calendarNotification.findUnique({
        where: { id: stuckNotif.id },
      });
      expect(updated?.status).toBe(CalendarNotificationStatus.PENDING);
      expect(updated?.retryCount).toBe(1);

      // Dọn dẹp job test này để không ảnh hưởng đếm số lượng ở test 10
      await prisma.calendarNotification.delete({
        where: { id: stuckNotif.id },
      });
    });
  });

  // =========================================================================
  // SCENARIO 10: HAI WORKER CHẠY ĐỒNG THỜI KHÔNG GỬI TRÙNG
  // =========================================================================
  describe('Tình huống 10: Hai worker chạy đồng thời chống trùng lặp', () => {
    it('Hai worker chạy đồng thời chỉ gửi duy nhất 1 thông báo', async () => {
      const tempEvent = await prisma.teacherCalendarEvent.create({
        data: {
          teacherId: teacherA.id,
          title: 'Ca test concurrency worker',
          startAt: new Date('2026-10-30T08:00:00Z'),
          endAt: new Date('2026-10-30T10:00:00Z'),
        },
      });
      testEventIds.push(tempEvent.id);

      const dueNotif = await prisma.calendarNotification.create({
        data: {
          eventId: tempEvent.id,
          recipientId: student1.id,
          scheduledAt: new Date(Date.now() - 5000), // Đến hạn 5 giây trước
          status: CalendarNotificationStatus.PENDING,
        },
      });

      // Chạy 2 lần đồng thời
      const [res1, res2] = await Promise.all([
        worker.processPendingNotifications(),
        worker.processPendingNotifications(),
      ]);

      // Tổng số gửi thành công cho notif này phải là 1 (worker thứ hai không được gửi lại)
      const totalSent = res1.sent + res2.sent;
      expect(totalSent).toBe(1);

      const finalNotif = await prisma.calendarNotification.findUnique({
        where: { id: dueNotif.id },
      });
      expect(finalNotif?.status).toBe(CalendarNotificationStatus.SENT);

      // Kiểm tra bảng Notification chỉ có đúng 1 thông báo được tạo
      const inAppNotifications = await prisma.notification.findMany({
        where: {
          recipientId: student1.id,
          referenceId: tempEvent.id,
          type: NotificationType.CALENDAR,
        },
      });
      expect(inAppNotifications).toHaveLength(1);
    });
  });

  // =========================================================================
  // SCENARIO 11: TRUY VẤN THỜI GIAN, ISO 8601, MÚI GIỜ ASIA/HO_CHI_MINH VÀ RANH GIỚI
  // =========================================================================
  describe('Tình huống 11: Truy vấn thời gian, múi giờ và ranh giới', () => {
    let boundaryEvent: any;

    it('Tạo sự kiện tại ranh giới thời gian', async () => {
      const res = await request(app.getHttpServer())
        .post('/teacher-calendar/events')
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .send({
          title: 'Ca tại ranh giới',
          startAt: '2026-11-01T08:00:00.000Z',
          endAt: '2026-11-01T10:00:00.000Z',
        })
        .expect(201);
      boundaryEvent = res.body.event;
      testEventIds.push(boundaryEvent.id);
    });

    it('Truy vấn với ranh giới chạm đúng startAt (to = 08:00)', async () => {
      const res = await request(app.getHttpServer())
        .get(
          '/teacher-calendar/events?from=2026-11-01T00:00:00.000Z&to=2026-11-01T08:00:00.000Z',
        )
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      const found = res.body.events.find((e: any) => e.id === boundaryEvent.id);
      expect(found).toBeDefined();
    });

    it('Truy vấn với múi giờ Asia/Ho_Chi_Minh (+07:00)', async () => {
      // 08:00 UTC = 15:00 UTC+7
      const res = await request(app.getHttpServer())
        .get(
          '/teacher-calendar/events?from=2026-11-01T14:00:00%2B07:00&to=2026-11-01T18:00:00%2B07:00',
        )
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(200);

      const found = res.body.events.find((e: any) => e.id === boundaryEvent.id);
      expect(found).toBeDefined();
    });

    it('Truy vấn sai thứ tự from > to trả về 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .get(
          '/teacher-calendar/events?from=2026-11-02T00:00:00.000Z&to=2026-11-01T00:00:00.000Z',
        )
        .set('Authorization', `Bearer ${tokenTeacherA}`)
        .expect(400);
    });
  });

  // =========================================================================
  // SCENARIO 12: THÔNG BÁO TẠO QUA NOTIFICATIONSSERVICE VÀ DỮ LIỆU ĐỦ ĐỂ FRONTEND ĐIỀU HƯỚNG
  // =========================================================================
  describe('Tình huống 12: Dữ liệu thông báo cho Frontend điều hướng', () => {
    it('Thông báo được tạo có referenceId = eventId và type = CALENDAR', async () => {
      const tempEvent = await prisma.teacherCalendarEvent.create({
        data: {
          teacherId: teacherA.id,
          title: 'Ca hướng dẫn ôn thi',
          address: 'Phòng học 301',
          meetUrl: 'https://meet.google.com/test-url',
          startAt: new Date('2026-11-05T08:00:00Z'),
          endAt: new Date('2026-11-05T10:00:00Z'),
        },
      });
      testEventIds.push(tempEvent.id);

      await prisma.calendarNotification.create({
        data: {
          eventId: tempEvent.id,
          recipientId: student1.id,
          scheduledAt: new Date(Date.now() - 1000),
          status: CalendarNotificationStatus.PENDING,
        },
      });

      // Worker xử lý
      await worker.processPendingNotifications();

      // Frontend gọi GET /notifications để hiển thị danh sách
      const notifRes = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      const notifItem = notifRes.body.items.find(
        (n: any) => n.referenceId === tempEvent.id,
      );

      expect(notifItem).toBeDefined();
      expect(notifItem.type).toBe(NotificationType.CALENDAR);
      expect(notifItem.referenceId).toBe(tempEvent.id);
      expect(notifItem.title).toContain('Nhắc lịch ca dạy');
      expect(notifItem.content).toContain('Ca hướng dẫn ôn thi');
      expect(notifItem.content).toContain('https://meet.google.com/test-url');

      // Frontend dùng referenceId để lấy chi tiết ca dạy qua GET /student-calendar/events/:id
      // (Nếu là participant)
      await prisma.calendarEventParticipant.create({
        data: {
          eventId: tempEvent.id,
          studentId: student1.id,
        },
      });

      const detailRes = await request(app.getHttpServer())
        .get(`/student-calendar/events/${notifItem.referenceId}`)
        .set('Authorization', `Bearer ${tokenStudent1}`)
        .expect(200);

      expect(detailRes.body.id).toBe(tempEvent.id);
      expect(detailRes.body.title).toBe('Ca hướng dẫn ôn thi');
    });
  });
});
