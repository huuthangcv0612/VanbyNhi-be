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
import { ClassMaterialsService } from './class-materials.service.js';
import { InitUploadDto } from './dto/init-upload.dto.js';
import { CompleteUploadDto } from './dto/complete-upload.dto.js';
import { ShareMaterialDto } from './dto/share-material.dto.js';
import { UpdateMaterialDto } from './dto/update-material.dto.js';
import { QueryMaterialsDto } from './dto/query-materials.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
export class TeacherClassMaterialsController {
  constructor(private readonly classMaterialsService: ClassMaterialsService) {}

  // ==================== TÀI LIỆU LỚP HỌC ====================

  /**
   * POST /teacher/classes/:classId/materials/upload-url — Khởi tạo upload trực tiếp tài liệu vào lớp
   */
  @Post('classes/:classId/materials/upload-url')
  async initClassUpload(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
    @Body() dto: InitUploadDto,
  ) {
    return this.classMaterialsService.initClassDirectUpload(
      teacherId,
      classId,
      dto,
    );
  }

  /**
   * POST /teacher/classes/:classId/materials/complete-upload — Xác nhận upload trực tiếp tài liệu vào lớp
   */
  @Post('classes/:classId/materials/complete-upload')
  async completeClassUpload(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
    @Body() dto: CompleteUploadDto,
  ) {
    return this.classMaterialsService.completeClassDirectUpload(
      teacherId,
      classId,
      dto,
    );
  }

  /**
   * POST /teacher/classes/:classId/materials — Chia sẻ tài liệu từ thư viện vào lớp học
   */
  @Post('classes/:classId/materials')
  async shareDocumentToClass(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
    @Body() dto: ShareMaterialDto,
  ) {
    return this.classMaterialsService.shareDocumentToClass(
      teacherId,
      classId,
      dto,
    );
  }

  /**
   * GET /teacher/classes/:classId/materials — Danh sách tài liệu chung của lớp học
   */
  @Get('classes/:classId/materials')
  async getClassMaterials(
    @CurrentUser('sub') teacherId: string,
    @Param('classId') classId: string,
    @Query() query: QueryMaterialsDto,
  ) {
    return this.classMaterialsService.getTeacherClassMaterials(
      teacherId,
      classId,
      query,
    );
  }

  // ==================== TÀI LIỆU BUỔI HỌC ====================

  /**
   * POST /teacher/sessions/:sessionId/materials/upload-url — Khởi tạo upload trực tiếp tài liệu vào buổi học
   */
  @Post('sessions/:sessionId/materials/upload-url')
  async initSessionUpload(
    @CurrentUser('sub') teacherId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: InitUploadDto,
  ) {
    return this.classMaterialsService.initSessionDirectUpload(
      teacherId,
      sessionId,
      dto,
    );
  }

  /**
   * POST /teacher/sessions/:sessionId/materials/complete-upload — Xác nhận upload trực tiếp tài liệu vào buổi học
   */
  @Post('sessions/:sessionId/materials/complete-upload')
  async completeSessionUpload(
    @CurrentUser('sub') teacherId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: CompleteUploadDto,
  ) {
    return this.classMaterialsService.completeSessionDirectUpload(
      teacherId,
      sessionId,
      dto,
    );
  }

  /**
   * POST /teacher/sessions/:sessionId/materials — Chia sẻ tài liệu từ thư viện vào buổi học
   */
  @Post('sessions/:sessionId/materials')
  async shareDocumentToSession(
    @CurrentUser('sub') teacherId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: ShareMaterialDto,
  ) {
    return this.classMaterialsService.shareDocumentToSession(
      teacherId,
      sessionId,
      dto,
    );
  }

  /**
   * GET /teacher/sessions/:sessionId/materials — Danh sách tài liệu của buổi học
   */
  @Get('sessions/:sessionId/materials')
  async getSessionMaterials(
    @CurrentUser('sub') teacherId: string,
    @Param('sessionId') sessionId: string,
    @Query() query: QueryMaterialsDto,
  ) {
    return this.classMaterialsService.getTeacherSessionMaterials(
      teacherId,
      sessionId,
      query,
    );
  }

  // ==================== CHỈNH SỬA / GỠ LIÊN KẾT / TẢI VỀ ====================

  /**
   * PATCH /teacher/materials/:materialId — Cập nhật thông tin hiển thị hoặc quyền truy cập tài liệu
   */
  @Patch('materials/:materialId')
  async updateMaterial(
    @CurrentUser('sub') teacherId: string,
    @Param('materialId') materialId: string,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.classMaterialsService.updateMaterial(
      teacherId,
      materialId,
      dto,
    );
  }

  /**
   * DELETE /teacher/materials/:materialId — Gỡ liên kết tài liệu khỏi lớp hoặc buổi học
   */
  @Delete('materials/:materialId')
  async removeMaterial(
    @CurrentUser('sub') teacherId: string,
    @Param('materialId') materialId: string,
  ) {
    return this.classMaterialsService.removeMaterial(teacherId, materialId);
  }

  /**
   * GET /teacher/materials/:materialId/download-url — Giáo viên lấy liên kết tải tài liệu
   */
  @Get('materials/:materialId/download-url')
  async getDownloadUrl(
    @CurrentUser('sub') teacherId: string,
    @Param('materialId') materialId: string,
  ) {
    return this.classMaterialsService.getTeacherMaterialDownloadUrl(
      teacherId,
      materialId,
    );
  }
}
