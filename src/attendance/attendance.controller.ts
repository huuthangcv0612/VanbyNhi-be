import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AttendanceService } from './attendance.service.js';
import { AttendanceExportService } from './attendance-export.service.js';
import { AttendanceCleanupService } from './attendance-cleanup.service.js';
import { BatchAttendanceDto } from './dto/batch-attendance.dto.js';
import { AttendanceRecordDto } from './dto/attendance-record.dto.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';
import { MarkAllPresentDto } from './dto/mark-all-present.dto.js';
import { CloseAttendanceSessionDto } from './dto/close-session.dto.js';
import { QueryAttendanceHistoryDto } from './dto/query-attendance-history.dto.js';
import { ReviewCorrectionRequestDto } from './dto/review-correction-request.dto.js';
import { QueryCorrectionRequestsDto } from './dto/query-correction-requests.dto.js';
import { CloseMonthlySummaryDto } from './dto/close-monthly-summary.dto.js';
import { QueryMonthlySummaryDto } from './dto/query-monthly-summary.dto.js';
import { UpdateAttendanceConfigDto } from './dto/update-attendance-config.dto.js';
import { ExportAttendanceDto } from './dto/export-attendance.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TEACHER)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly attendanceExportService: AttendanceExportService,
    private readonly attendanceCleanupService: AttendanceCleanupService,
  ) {}

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

  @Post('sessions/:sessionId/attendance/open')
  async openAttendanceSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    await this.attendanceService.validateTeacherOrAdminAccess(
      sessionId,
      user.sub,
      user.role,
    );
    return this.attendanceService.openAttendanceSession(sessionId, user.sub);
  }

  @Post('sessions/:sessionId/attendance/save-draft')
  async saveDraftAttendance(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Body() dto: BatchAttendanceDto,
  ) {
    await this.attendanceService.validateTeacherOrAdminAccess(
      sessionId,
      user.sub,
      user.role,
    );
    return this.attendanceService.saveDraftAttendance(
      sessionId,
      user.sub,
      dto,
    );
  }

  @Post('sessions/:sessionId/attendance/close')
  async closeAttendanceSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Body() dto: CloseAttendanceSessionDto,
  ) {
    await this.attendanceService.validateTeacherOrAdminAccess(
      sessionId,
      user.sub,
      user.role,
    );
    return this.attendanceService.closeAttendanceSession(
      sessionId,
      user.sub,
      dto,
    );
  }

  @Post('sessions/:sessionId/attendance/mark-all')
  async markAllPresent(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Body() dto: MarkAllPresentDto,
  ) {
    await this.attendanceService.validateTeacherOrAdminAccess(
      sessionId,
      user.sub,
      user.role,
    );
    return this.attendanceService.markAllPresent(
      sessionId,
      user.sub,
      dto,
    );
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

  @Post('sessions/:sessionId/attendance/record')
  async saveSingleAttendance(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Body() dto: AttendanceRecordDto,
  ) {
    await this.attendanceService.validateTeacherOrAdminAccess(
      sessionId,
      user.sub,
      user.role,
    );
    return this.attendanceService.saveSingleAttendance(
      sessionId,
      user.sub,
      dto,
      user.role,
    );
  }

  @Get('sessions/:sessionId/attendance/export')
  async exportSessionAttendanceExcel(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Res() res: Response,
  ) {
    await this.attendanceService.validateTeacherOrAdminAccess(
      sessionId,
      user.sub,
      user.role,
    );
    return this.attendanceExportService.exportSessionAttendanceExcel(
      sessionId,
      res,
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

  @Get('classes/:classId/attendance/history')
  async getClassAttendanceHistory(
    @Param('classId') classId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Query() query: QueryAttendanceHistoryDto,
  ) {
    await this.attendanceService.validateClassTeacherOrAdminAccess(
      classId,
      user.sub,
      user.role,
    );
    return this.attendanceService.getClassAttendanceHistory(classId, query);
  }

  @Get('classes/:classId/attendance/summary')
  async getClassAttendanceSummary(
    @Param('classId') classId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Query() query: QueryAttendanceHistoryDto,
  ) {
    await this.attendanceService.validateClassTeacherOrAdminAccess(
      classId,
      user.sub,
      user.role,
    );
    return this.attendanceService.getClassAttendanceSummary(classId, query);
  }

  @Get('attendance/correction-requests')
  async getCorrectionRequests(
    @CurrentUser() user: { sub: string; role: UserRole },
    @Query() query: QueryCorrectionRequestsDto,
  ) {
    return this.attendanceService.getCorrectionRequests(
      user.sub,
      user.role,
      query,
    );
  }

  @Post('attendance/correction-requests/:id/review')
  async reviewCorrectionRequest(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Body() dto: ReviewCorrectionRequestDto,
  ) {
    return this.attendanceService.reviewCorrectionRequest(
      id,
      user.sub,
      user.role,
      dto,
    );
  }

  @Get('classes/:classId/attendance/monthly-summary')
  async getMonthlySummary(
    @Param('classId') classId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Query() query: QueryMonthlySummaryDto,
  ) {
    await this.attendanceService.validateClassTeacherOrAdminAccess(
      classId,
      user.sub,
      user.role,
    );
    return this.attendanceService.getMonthlySummary(classId, query);
  }

  @Post('classes/:classId/attendance/monthly-summary/close')
  async closeMonthlySummary(
    @Param('classId') classId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Body() dto: CloseMonthlySummaryDto,
  ) {
    await this.attendanceService.validateClassTeacherOrAdminAccess(
      classId,
      user.sub,
      user.role,
    );
    return this.attendanceService.closeMonthlySummary(
      classId,
      user.sub,
      dto,
    );
  }

  @Get('classes/:classId/attendance/config')
  async getClassAttendanceConfig(
    @Param('classId') classId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    await this.attendanceService.validateClassTeacherOrAdminAccess(
      classId,
      user.sub,
      user.role,
    );
    return this.attendanceService.getClassAttendanceConfig(classId);
  }

  @Put('classes/:classId/attendance/config')
  async updateClassAttendanceConfig(
    @Param('classId') classId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Body() dto: UpdateAttendanceConfigDto,
  ) {
    await this.attendanceService.validateClassTeacherOrAdminAccess(
      classId,
      user.sub,
      user.role,
    );
    return this.attendanceService.updateClassAttendanceConfig(classId, dto);
  }

  @Get('classes/:classId/attendance/export/detail')
  async exportDetailExcel(
    @Param('classId') classId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Query() query: ExportAttendanceDto,
    @Res() res: Response,
  ) {
    await this.attendanceService.validateClassTeacherOrAdminAccess(
      classId,
      user.sub,
      user.role,
    );
    return this.attendanceExportService.exportDetailExcel(classId, query, res);
  }

  @Get('classes/:classId/attendance/export/summary')
  async exportSummaryExcel(
    @Param('classId') classId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Query() query: ExportAttendanceDto,
    @Res() res: Response,
  ) {
    await this.attendanceService.validateClassTeacherOrAdminAccess(
      classId,
      user.sub,
      user.role,
    );
    return this.attendanceExportService.exportSummaryExcel(classId, query, res);
  }

  @Post('attendance/cleanup')
  @Roles(UserRole.ADMIN)
  async triggerCleanup() {
    const result = await this.attendanceCleanupService.runCleanupTask();
    return {
      message: 'Thực thi dọn dẹp dữ liệu điểm danh thành công',
      result,
    };
  }
}
