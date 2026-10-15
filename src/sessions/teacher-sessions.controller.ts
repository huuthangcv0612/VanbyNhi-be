import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { QuerySessionsDto } from './dto/query-sessions.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
export class TeacherSessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * POST /teacher/sessions/:sessionId/start — Giáo viên bắt đầu buổi học (LIVE)
   */
  @Post('sessions/:sessionId/start')
  async startSession(
    @CurrentUser('sub') teacherId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessionsService.startSession(
      sessionId,
      teacherId,
      UserRole.TEACHER,
    );
  }

  /**
   * POST /teacher/sessions/:sessionId/end — Giáo viên kết thúc buổi học (COMPLETED)
   */
  @Post('sessions/:sessionId/end')
  async endSession(
    @CurrentUser('sub') teacherId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessionsService.endSession(
      sessionId,
      teacherId,
      UserRole.TEACHER,
    );
  }

  /**
   * GET /teacher/classes/:classId/sessions — Giáo viên xem danh sách buổi học của lớp mình dạy
   */
  @Get('classes/:classId/sessions')
  async getTeacherClassSessions(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
    @Query() query: QuerySessionsDto,
  ) {
    return this.sessionsService.findTeacherClassSessions(
      teacherId,
      classId,
      query,
    );
  }

  /**
   * GET /teacher/sessions/:sessionId — Giáo viên xem chi tiết buổi học
   */
  @Get('sessions/:sessionId')
  async getTeacherSessionDetail(
    @CurrentUser('sub') teacherId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessionsService.findTeacherSessionDetail(teacherId, sessionId);
  }
}
