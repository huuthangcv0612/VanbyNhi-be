import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { SessionsController } from './sessions.controller.js';
import { StudentSessionsController } from './student-sessions.controller.js';
import { TeacherSessionsController } from './teacher-sessions.controller.js';
import { MeetAccessService } from './meet-access.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule],
  controllers: [
    SessionsController,
    StudentSessionsController,
    TeacherSessionsController,
  ],
  providers: [SessionsService, MeetAccessService],
  exports: [SessionsService, MeetAccessService],
})
export class SessionsModule {}
