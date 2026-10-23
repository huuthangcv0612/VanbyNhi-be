import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service.js';
import { AssignmentsController } from './assignments.controller.js';
import { AssignmentRetentionService } from './assignment-retention.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { StorageModule } from '../storage/storage.module.js';

@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule, StorageModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentRetentionService],
  exports: [AssignmentsService, AssignmentRetentionService],
})
export class AssignmentsModule {}
