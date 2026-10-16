import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service.js';
import { CreateCorrectionRequestDto } from './dto/create-correction-request.dto.js';
import { QueryCorrectionRequestsDto } from './dto/query-correction-requests.dto.js';
import { QueryStudentAttendanceDto } from './dto/query-student-attendance.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('student/attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class StudentAttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * GET /student/attendance — Học sinh xem lịch sử điểm danh của chính mình
   */
  @Get()
  async getMyAttendanceHistory(
    @CurrentUser('sub') studentId: string,
    @Query() query: QueryStudentAttendanceDto,
  ) {
    return this.attendanceService.getStudentAttendanceHistory(
      studentId,
      query,
    );
  }

  /**
   * GET /student/attendance/summary — Tổng hợp số buổi theo từng trạng thái của học sinh
   */
  @Get('summary')
  async getMyAttendanceSummary(
    @CurrentUser('sub') studentId: string,
    @Query() query: QueryStudentAttendanceDto,
  ) {
    return this.attendanceService.getStudentAttendanceSummary(
      studentId,
      query,
    );
  }

  /**
   * POST /student/attendance/correction-requests — Gửi yêu cầu điều chỉnh điểm danh
   */
  @Post('correction-requests')
  async createCorrectionRequest(
    @CurrentUser('sub') studentId: string,
    @Body() dto: CreateCorrectionRequestDto,
  ) {
    return this.attendanceService.createStudentCorrectionRequest(
      studentId,
      dto,
    );
  }

  /**
   * GET /student/attendance/correction-requests — Xem danh sách yêu cầu điều chỉnh của mình
   */
  @Get('correction-requests')
  async getMyCorrectionRequests(
    @CurrentUser('sub') studentId: string,
    @Query() query: QueryCorrectionRequestsDto,
  ) {
    return this.attendanceService.getStudentCorrectionRequests(
      studentId,
      query,
    );
  }
}
