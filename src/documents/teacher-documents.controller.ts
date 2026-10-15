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
import { DocumentsService } from './documents.service.js';
import { InitUploadDto } from './dto/init-upload.dto.js';
import { CompleteUploadDto } from './dto/complete-upload.dto.js';
import { QueryDocumentsDto } from './dto/query-documents.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('teacher/documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
export class TeacherDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * POST /teacher/documents/upload-url — Khởi tạo upload tài liệu vào thư viện cá nhân
   */
  @Post('upload-url')
  async initUpload(
    @CurrentUser('sub') teacherId: string,
    @Body() dto: InitUploadDto,
  ) {
    return this.documentsService.initLibraryUpload(teacherId, dto);
  }

  /**
   * POST /teacher/documents/complete-upload — Xác nhận upload tài liệu vào thư viện cá nhân
   */
  @Post('complete-upload')
  async completeUpload(
    @CurrentUser('sub') teacherId: string,
    @Body() dto: CompleteUploadDto,
  ) {
    return this.documentsService.completeLibraryUpload(teacherId, dto);
  }

  /**
   * GET /teacher/documents — Danh sách tài liệu trong thư viện cá nhân
   */
  @Get()
  async getLibraryDocuments(
    @CurrentUser('sub') teacherId: string,
    @Query() query: QueryDocumentsDto,
  ) {
    return this.documentsService.getLibraryDocuments(teacherId, query);
  }

  /**
   * GET /teacher/documents/:id — Chi tiết một tài liệu trong thư viện
   */
  @Get(':id')
  async getDocumentDetail(
    @CurrentUser('sub') teacherId: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.getDocumentDetail(teacherId, id);
  }

  /**
   * GET /teacher/documents/:id/download-url — Lấy liên kết tải/xem tài liệu từ thư viện
   */
  @Get(':id/download-url')
  async getDownloadUrl(
    @CurrentUser('sub') teacherId: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.getDocumentDownloadUrl(teacherId, id);
  }

  /**
   * PATCH /teacher/documents/:id — Cập nhật thông tin tài liệu
   */
  @Patch(':id')
  async updateDocument(
    @CurrentUser('sub') teacherId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.updateDocument(teacherId, id, dto);
  }

  /**
   * DELETE /teacher/documents/:id — Xóa tài liệu khỏi thư viện
   */
  @Delete(':id')
  async deleteDocument(
    @CurrentUser('sub') teacherId: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.deleteDocument(teacherId, id);
  }
}
