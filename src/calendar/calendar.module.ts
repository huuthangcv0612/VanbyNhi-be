import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service.js';
import { CalendarNotificationWorkerService } from './calendar-notification-worker.service.js';
import { TeacherCalendarController } from './teacher-calendar.controller.js';
import { StudentCalendarController } from './student-calendar.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule],
  controllers: [TeacherCalendarController, StudentCalendarController],
  providers: [CalendarService, CalendarNotificationWorkerService],
  exports: [CalendarService, CalendarNotificationWorkerService],
})
export class CalendarModule {}
