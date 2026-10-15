import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ClassesModule } from './classes/classes.module.js';
import { EnrollmentsModule } from './enrollments/enrollments.module.js';
import { SessionsModule } from './sessions/sessions.module.js';
import { AttendanceModule } from './attendance/attendance.module.js';
import { TuitionModule } from './tuition/tuition.module.js';
import { AssignmentsModule } from './assignments/assignments.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { CalendarModule } from './calendar/calendar.module.js';
import { SchedulesModule } from './schedules/schedules.module.js';
import { StorageModule } from './storage/storage.module.js';
import { DocumentsModule } from './documents/documents.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'A!w0jPj1NXsFX^jw',
      appSecret: '6bBqdBAqzXeyQu5UKfmSj99R2WHl5kd9s5dyEZj2V71P3',
      serviceId: 'VanbyNhi-be',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClassesModule,
    EnrollmentsModule,
    SessionsModule,
    AttendanceModule,
    TuitionModule,
    AssignmentsModule,
    NotificationsModule,
    CalendarModule,
    SchedulesModule,
    StorageModule,
    DocumentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
