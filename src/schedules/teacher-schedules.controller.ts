import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import { QueryTeacherSchedulesDto } from './dto/query-teacher-schedules.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('teacher/schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
export class TeacherSchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  /**
   * POST /teacher/schedules — Tạo lịch cho lớp, học sinh hoặc cả hai
   */
  @Post()
  async createSchedule(
    @CurrentUser('sub') teacherId: string,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.schedulesService.createSchedule(teacherId, dto);
  }

  /**
   * GET /teacher/schedules — Danh sách lịch do giáo viên quản lý
   * Hỗ trợ lọc theo classId, studentId, status, khoảng thời gian from/to, phân trang
   */
  @Get()
  async getSchedules(
    @CurrentUser('sub') teacherId: string,
    @Query() query: QueryTeacherSchedulesDto,
  ) {
    return this.schedulesService.getTeacherSchedules(teacherId, query);
  }

  /**
   * GET /teacher/schedules/:id — Chi tiết lịch và danh sách người tham gia
   */
  @Get(':id')
  async getScheduleById(
    @CurrentUser('sub') teacherId: string,
    @Param('id') id: string,
  ) {
    return this.schedulesService.getTeacherScheduleById(teacherId, id);
  }

  /**
   * PATCH /teacher/schedules/:id — Cập nhật thông tin lịch
   */
  @Patch(':id')
  async updateSchedule(
    @CurrentUser('sub') teacherId: string,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulesService.updateTeacherSchedule(teacherId, id, dto);
  }

  /**
   * PATCH /teacher/schedules/:id/cancel — Hủy lịch học
   */
  @Patch(':id/cancel')
  async cancelSchedule(
    @CurrentUser('sub') teacherId: string,
    @Param('id') id: string,
  ) {
    return this.schedulesService.cancelTeacherSchedule(teacherId, id);
  }
}
