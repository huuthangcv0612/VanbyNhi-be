import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service.js';
import { AttendanceExportService } from './attendance-export.service.js';
import { AttendanceCleanupService } from './attendance-cleanup.service.js';
import { AttendanceController } from './attendance.controller.js';
import { StudentAttendanceController } from './student-attendance.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AttendanceController, StudentAttendanceController],
  providers: [
    AttendanceService,
    AttendanceExportService,
    AttendanceCleanupService,
  ],
  exports: [
    AttendanceService,
    AttendanceExportService,
    AttendanceCleanupService,
  ],
})
export class AttendanceModule {}
