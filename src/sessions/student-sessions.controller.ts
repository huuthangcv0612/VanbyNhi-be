import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { QueryStudentClassSessionsDto } from './dto/query-student-class-sessions.dto.js';
import { StudentCheckInDto } from './dto/student-check-in.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class StudentSessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * GET /student/classes/:classId/sessions — Lấy danh sách buổi học của lớp học sinh đang tham gia
   */
  @Get('classes/:classId/sessions')
  async getStudentClassSessions(
    @CurrentUser('sub') studentId: string,
    @Param('classId') classId: string,
    @Query() query: QueryStudentClassSessionsDto,
  ) {
    return this.sessionsService.getStudentClassSessions(
      studentId,
      classId,
      query,
    );
  }

  /**
   * GET /student/sessions/:sessionId — Chi tiết buổi học dành cho học sinh
   */
  @Get('sessions/:sessionId')
  async getStudentSessionDetail(
    @CurrentUser('sub') studentId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessionsService.getStudentSessionDetail(studentId, sessionId);
  }

  /**
   * GET /student/sessions/:sessionId/join-meet — Lấy link Google Meet có kiểm tra quyền và cửa sổ 15 phút
   */
  @Get('sessions/:sessionId/join-meet')
  async joinMeet(
    @CurrentUser('sub') studentId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessionsService.getMeetJoinUrl(studentId, sessionId);
  }

  /**
   * POST /student/sessions/:sessionId/check-in — Học sinh tự xác nhận điểm danh trong buổi học
   */
  @Post('sessions/:sessionId/check-in')
  async checkIn(
    @CurrentUser('sub') studentId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: StudentCheckInDto,
  ) {
    return this.sessionsService.studentCheckIn(studentId, sessionId, dto);
  }
}
