import {
  Controller,
  Get,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service.js';
import { BatchAttendanceDto } from './dto/batch-attendance.dto.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TEACHER)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('sessions/:sessionId/attendance')
  async getSessionAttendance(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    await this.attendanceService.validateTeacherOrAdminAccess(
      sessionId,
      user.sub,
      user.role,
    );
    return this.attendanceService.getSessionAttendance(sessionId);
  }

  @Get('sessions/:sessionId/attendance/summary')
  async getSessionSummary(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    await this.attendanceService.validateTeacherOrAdminAccess(
      sessionId,
      user.sub,
      user.role,
    );
    return this.attendanceService.getSessionSummary(sessionId);
  }

  @Put('sessions/:sessionId/attendance')
  async batchSaveAttendance(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Body() dto: BatchAttendanceDto,
  ) {
    await this.attendanceService.validateTeacherOrAdminAccess(
      sessionId,
      user.sub,
      user.role,
    );
    return this.attendanceService.batchSaveAttendance(
      sessionId,
      user.sub,
      dto,
    );
  }

  @Patch('attendance/:id')
  async updateAttendance(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.updateAttendance(
      id,
      user.sub,
      dto,
      user.role,
    );
  }
}
