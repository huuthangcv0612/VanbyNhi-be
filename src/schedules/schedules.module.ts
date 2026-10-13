import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service.js';
import { TeacherSchedulesController } from './teacher-schedules.controller.js';
import { StudentSchedulesController } from './student-schedules.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule],
  controllers: [TeacherSchedulesController, StudentSchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
