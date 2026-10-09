import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service.js';
import { CreateAssignmentDto } from './dto/create-assignment.dto.js';
import { UpdateAssignmentDto } from './dto/update-assignment.dto.js';
import { QueryAssignmentsDto } from './dto/query-assignments.dto.js';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto.js';
import { GradeSubmissionDto } from './dto/grade-submission.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  /**
   * ADMIN tạo bài tập mới
   */
  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @CurrentUser('sub') adminId: string,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.assignmentsService.create(adminId, dto);
  }

  /**
   * Lấy danh sách bài tập (ADMIN hoặc STUDENT)
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  async findAll(
    @CurrentUser() user: { sub: string; role: UserRole },
    @Query() query: QueryAssignmentsDto,
  ) {
    return this.assignmentsService.findAll(
      { id: user.sub, role: user.role },
      query,
    );
  }

  /**
   * Xem chi tiết một bài tập
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.assignmentsService.findOne(id, {
      id: user.sub,
      role: user.role,
    });
  }

  /**
   * ADMIN cập nhật thông tin bài tập
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.update(id, dto);
  }

  /**
   * HỌC SINH nộp bài tập (hỗ trợ nộp lại)
   */
  @Post(':id/submissions')
  @Roles(UserRole.STUDENT)
  async submit(
    @Param('id') id: string,
    @CurrentUser('sub') studentId: string,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.assignmentsService.submitAssignment(id, studentId, dto);
  }

  /**
   * Xem danh sách bài nộp của bài tập (ADMIN xem tất cả, STUDENT xem bài của chính mình)
   */
  @Get(':id/submissions')
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  async getSubmissions(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.assignmentsService.getSubmissionsByAssignment(id, {
      id: user.sub,
      role: user.role,
    });
  }

  /**
   * Xem chi tiết một bài nộp
   */
  @Get('submissions/:submissionId')
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  async getSubmission(
    @Param('submissionId') submissionId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.assignmentsService.getSubmission(submissionId, {
      id: user.sub,
      role: user.role,
    });
  }

  /**
   * ADMIN chấm điểm bài nộp (Thang điểm 0 - 10)
   */
  @Patch('submissions/:submissionId/grade')
  @Roles(UserRole.ADMIN)
  async gradeSubmission(
    @Param('submissionId') submissionId: string,
    @CurrentUser('sub') adminId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.assignmentsService.gradeSubmission(submissionId, adminId, dto);
  }
}
