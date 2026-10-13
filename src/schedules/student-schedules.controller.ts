import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service.js';
import { QueryStudentSchedulesDto } from './dto/query-student-schedules.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('student/schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class StudentSchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  /**
   * GET /student/schedules — Toàn bộ lịch mà học sinh được phép xem
   * Gồm lịch từ lớp đang tham gia và lịch được chỉ định trực tiếp, không bị trùng
   */
  @Get()
  async getSchedules(
    @CurrentUser('sub') studentId: string,
    @Query() query: QueryStudentSchedulesDto,
  ) {
    return this.schedulesService.getStudentSchedules(studentId, query);
  }

  /**
   * GET /student/schedules/:id — Chi tiết lịch khi học sinh có quyền truy cập
   */
  @Get(':id')
  async getScheduleById(
    @CurrentUser('sub') studentId: string,
    @Param('id') id: string,
  ) {
    return this.schedulesService.getStudentScheduleById(studentId, id);
  }
}
