import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { ReviewSubmissionDto } from './dto/review-submission.dto.js';
import { QuerySubmissionsDto } from './dto/query-submissions.dto.js';
import { InitAssignmentUploadDto } from './dto/init-assignment-upload.dto.js';
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
   * Khởi tạo presigned URL tải lên Cloudflare R2 cho tài liệu bài tập, bài nộp hoặc bài chữa
   */
  @Post('upload-url')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  async initUpload(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: InitAssignmentUploadDto,
  ) {
    return this.assignmentsService.initUpload(userId, role, dto);
  }

  /**
   * Lấy liên kết tải xuống an toàn cho tệp đính kèm (có kiểm tra quyền)
   */
  @Get('attachments/:attachmentId/download-url')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  async getAttachmentDownloadUrl(
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.assignmentsService.getAttachmentDownloadUrl(attachmentId, {
      id: user.sub,
      role: user.role,
    });
  }

  /**
   * GIÁO VIÊN / ADMIN tạo bài tập mới
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async create(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.assignmentsService.create(userId, role, dto);
  }

  /**
   * Lấy danh sách bài tập (ADMIN xem tất cả, TEACHER xem lớp mình, STUDENT xem lớp đang học)
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
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
   * Thống kê tổng hợp số liệu nộp bài của bài tập
   */
  @Get(':id/stats')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getStats(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.assignmentsService.getAssignmentStats(id, {
      id: user.sub,
      role: user.role,
    });
  }

  /**
   * Danh sách học sinh đủ điều kiện và trạng thái bài làm (chưa nộp, nộp muộn, đã chấm, đã trả bài)
   */
  @Get(':id/eligible-students')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async getEligibleStudents(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.assignmentsService.getEligibleStudents(id, {
      id: user.sub,
      role: user.role,
    });
  }

  /**
   * Xem chi tiết một bài tập
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
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
   * GIÁO VIÊN / ADMIN cập nhật thông tin bài tập
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.update(id, userId, role, dto);
  }

  /**
   * GIÁO VIÊN / ADMIN xóa bài tập
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.assignmentsService.remove(id, userId, role);
  }

  /**
   * HỌC SINH nộp bài tập (hỗ trợ nộp lại và kiểm tra chính sách nộp bài)
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
   * Xem danh sách bài nộp của bài tập (TEACHER/ADMIN xem tất cả, STUDENT chỉ xem bài của mình)
   */
  @Get(':id/submissions')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  async getSubmissions(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Query() query: QuerySubmissionsDto,
  ) {
    return this.assignmentsService.getSubmissionsByAssignment(
      id,
      { id: user.sub, role: user.role },
      query,
    );
  }

  /**
   * Xem chi tiết một bài nộp (TEACHER/ADMIN xem tất cả, STUDENT chỉ xem bài của chính mình và ẩn draft review)
   */
  @Get('submissions/:submissionId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
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
   * GIÁO VIÊN / ADMIN chấm điểm và nhận xét (hỗ trợ lưu bản nháp DRAFT hoặc trả bài RETURNED)
   */
  @Post('submissions/:submissionId/review')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async reviewSubmission(
    @Param('submissionId') submissionId: string,
    @CurrentUser('sub') reviewerId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: ReviewSubmissionDto,
  ) {
    return this.assignmentsService.reviewSubmission(
      submissionId,
      reviewerId,
      role,
      dto,
    );
  }

  /**
   * GIÁO VIÊN / ADMIN thực hiện thao tác TRẢ BÀI riêng biệt
   */
  @Post('submissions/:submissionId/return')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async returnSubmission(
    @Param('submissionId') submissionId: string,
    @CurrentUser('sub') reviewerId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.assignmentsService.returnSubmissionReview(
      submissionId,
      reviewerId,
      role,
    );
  }

  /**
   * Chấm điểm bài nộp theo định dạng cũ (tương thích ngược)
   */
  @Patch('submissions/:submissionId/grade')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async gradeSubmission(
    @Param('submissionId') submissionId: string,
    @CurrentUser('sub') reviewerId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.assignmentsService.gradeSubmission(
      submissionId,
      reviewerId,
      dto,
    );
  }

  /**
   * GIÁO VIÊN / ADMIN đánh dấu giữ tệp đính kèm vĩnh viễn (ngoại lệ lưu giữ)
   */
  @Patch('attachments/:attachmentId/keep')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async toggleKeepForever(
    @Param('attachmentId') attachmentId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body('isKeepForever') isKeepForever: boolean,
  ) {
    return this.assignmentsService.toggleAttachmentKeepForever(
      attachmentId,
      isKeepForever,
      { id: userId, role },
    );
  }
}
