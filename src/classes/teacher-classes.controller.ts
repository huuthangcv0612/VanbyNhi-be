import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TeacherClassesService } from './teacher-classes.service.js';
import { TeacherCreateClassDto } from './dto/teacher-create-class.dto.js';
import { TeacherUpdateClassDto } from './dto/teacher-update-class.dto.js';
import { TeacherUpdateClassStatusDto } from './dto/teacher-update-class-status.dto.js';
import { QueryTeacherClassesDto } from './dto/query-teacher-classes.dto.js';
import { QueryClassMembersDto } from './dto/query-class-members.dto.js';
import { QueryJoinRequestsDto } from './dto/query-join-requests.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('teacher/classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
export class TeacherClassesController {
  constructor(private readonly teacherClassesService: TeacherClassesService) {}

  /**
   * POST /teacher/classes — Tạo lớp học mới
   */
  @Post()
  async createClass(
    @CurrentUser('sub') teacherId: string,
    @Body() dto: TeacherCreateClassDto,
  ) {
    return this.teacherClassesService.createClass(teacherId, dto);
  }

  /**
   * GET /teacher/classes — Lấy danh sách lớp của giáo viên
   */
  @Get()
  async getMyClasses(
    @CurrentUser('sub') teacherId: string,
    @Query() query: QueryTeacherClassesDto,
  ) {
    return this.teacherClassesService.getMyClasses(teacherId, query);
  }

  /**
   * GET /teacher/classes/:classId — Chi tiết lớp học
   */
  @Get(':classId')
  async getClassDetail(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
  ) {
    return this.teacherClassesService.getClassDetail(teacherId, classId);
  }

  /**
   * GET /teacher/classes/:classId/meet — Chi tiết phòng Google Meet của lớp học
   */
  @Get(':classId/meet')
  async getClassMeet(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
  ) {
    return this.teacherClassesService.getClassMeetSpace(teacherId, classId);
  }

  /**
   * POST /teacher/classes/:classId/meet/retry — Thử lại tạo phòng Google Meet khi lớp chưa có phòng READY
   */
  @Post(':classId/meet/retry')
  async retryClassMeet(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
  ) {
    return this.teacherClassesService.retryCreateClassMeetSpace(
      teacherId,
      classId,
    );
  }

  /**
   * PATCH /teacher/classes/:classId — Sửa thông tin lớp học
   */
  @Patch(':classId')
  async updateClass(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
    @Body() dto: TeacherUpdateClassDto,
  ) {
    return this.teacherClassesService.updateClass(teacherId, classId, dto);
  }

  /**
   * PATCH /teacher/classes/:classId/status — Đóng hoặc mở lại lớp học
   */
  @Patch(':classId/status')
  async updateClassStatus(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
    @Body() dto: TeacherUpdateClassStatusDto,
  ) {
    return this.teacherClassesService.updateClassStatus(
      teacherId,
      classId,
      dto,
    );
  }

  /**
   * POST /teacher/classes/:classId/regenerate-join-code — Tạo lại mã tham gia mới
   */
  @Post(':classId/regenerate-join-code')
  async regenerateJoinCode(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
  ) {
    return this.teacherClassesService.regenerateJoinCode(teacherId, classId);
  }

  /**
   * GET /teacher/classes/:classId/members — Danh sách thành viên lớp học
   */
  @Get(':classId/members')
  async getClassMembers(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
    @Query() query: QueryClassMembersDto,
  ) {
    return this.teacherClassesService.getClassMembers(
      teacherId,
      classId,
      query,
    );
  }

  /**
   * GET /teacher/classes/:classId/join-requests — Danh sách yêu cầu chờ duyệt
   */
  @Get(':classId/join-requests')
  async getJoinRequests(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
    @Query() query: QueryJoinRequestsDto,
  ) {
    return this.teacherClassesService.getJoinRequests(
      teacherId,
      classId,
      query,
    );
  }

  /**
   * POST /teacher/classes/:classId/join-requests/:membershipId/approve — Duyệt yêu cầu tham gia
   */
  @Post(':classId/join-requests/:membershipId/approve')
  async approveJoinRequest(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
    @Param('membershipId') membershipId: string,
  ) {
    return this.teacherClassesService.approveJoinRequest(
      teacherId,
      classId,
      membershipId,
    );
  }

  /**
   * POST /teacher/classes/:classId/join-requests/:membershipId/reject — Từ chối yêu cầu tham gia
   */
  @Post(':classId/join-requests/:membershipId/reject')
  async rejectJoinRequest(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
    @Param('membershipId') membershipId: string,
  ) {
    return this.teacherClassesService.rejectJoinRequest(
      teacherId,
      classId,
      membershipId,
    );
  }

  /**
   * DELETE /teacher/classes/:classId/members/:studentId — Xóa thành viên khỏi lớp
   */
  @Delete(':classId/members/:studentId')
  async removeMember(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.teacherClassesService.removeMember(
      teacherId,
      classId,
      studentId,
    );
  }
}
