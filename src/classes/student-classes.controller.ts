import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StudentClassesService } from './student-classes.service.js';
import { StudentJoinClassDto } from './dto/student-join-class.dto.js';
import { QueryStudentClassesDto } from './dto/query-student-classes.dto.js';
import { QueryStudentRequestsDto } from './dto/query-student-requests.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('student/classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class StudentClassesController {
  constructor(private readonly studentClassesService: StudentClassesService) {}

  /**
   * POST /student/classes/join — Gửi yêu cầu tham gia lớp bằng mã joinCode
   */
  @Post('join')
  async joinClass(
    @CurrentUser('sub') studentId: string,
    @Body() dto: StudentJoinClassDto,
  ) {
    return this.studentClassesService.joinClass(studentId, dto);
  }

  /**
   * GET /student/classes — Danh sách các lớp học sinh đã tham gia thành công (ACTIVE)
   */
  @Get()
  async getMyClasses(
    @CurrentUser('sub') studentId: string,
    @Query() query: QueryStudentClassesDto,
  ) {
    return this.studentClassesService.getMyClasses(studentId, query);
  }

  /**
   * GET /student/classes/my-requests — Xem lịch sử và trạng thái các yêu cầu tham gia lớp
   */
  @Get('my-requests')
  async getMyRequests(
    @CurrentUser('sub') studentId: string,
    @Query() query: QueryStudentRequestsDto,
  ) {
    return this.studentClassesService.getMyRequests(studentId, query);
  }

  /**
   * GET /student/classes/:classId — Chi tiết lớp học học sinh được phép xem
   */
  @Get(':classId')
  async getClassDetail(
    @CurrentUser('sub') studentId: string,
    @Param('classId') classId: string,
  ) {
    return this.studentClassesService.getClassDetail(studentId, classId);
  }

  /**
   * GET /student/classes/:classId/meet — Học sinh lấy link Google Meet của lớp học
   */
  @Get(':classId/meet')
  async getClassMeet(
    @CurrentUser('sub') studentId: string,
    @Param('classId') classId: string,
  ) {
    return this.studentClassesService.getClassMeetAccess(studentId, classId);
  }

  /**
   * DELETE /student/classes/:classId/membership — Học sinh tự rời khỏi lớp học
   */
  @Delete(':classId/membership')
  async leaveClass(
    @CurrentUser('sub') studentId: string,
    @Param('classId') classId: string,
  ) {
    return this.studentClassesService.leaveClass(studentId, classId);
  }
}
