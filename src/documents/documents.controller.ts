import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { UpdateDocumentContentDto } from './dto/update-content.dto.js';
import { QueryDocumentsDto } from './dto/query-documents.dto.js';
import { QueryVersionsDto } from './dto/query-versions.dto.js';
import { ImportDocumentDto } from './dto/import-document.dto.js';
import { ExportDocumentDto } from './dto/export-document.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * GET /documents: Danh sách tài liệu (chỉ trả tài liệu user có quyền xem)
   */
  @Get()
  async getDocuments(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Query() query: QueryDocumentsDto,
  ) {
    if (role === UserRole.TEACHER || role === UserRole.ADMIN) {
      return this.documentsService.getLibraryDocuments(userId, query);
    }
    // Đối với Student: chỉ xem được qua lớp học hoặc tài liệu được cấp quyền
    return {
      items: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
    };
  }

  /**
   * POST /documents: Tạo tài liệu cấu trúc mới (mặc định owner theo authenticated user)
   */
  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async createDocument(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.createStructuredDocument(userId, dto);
  }

  /**
   * POST /documents/import: Nhập tài liệu DOCX từ file tải lên R2
   */
  @Post('import')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async importDocument(
    @CurrentUser('sub') userId: string,
    @Body() dto: ImportDocumentDto,
  ) {
    return this.documentsService.importDocxDocument(userId, dto);
  }

  /**
   * GET /documents/:id: Lấy chi tiết tài liệu kèm nội dung theo quyền
   */
  @Get(':id')
  async getDocument(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id') id: string,
  ) {
    return this.documentsService.getDocumentByIdWithContent(
      { sub: userId, role },
      id,
    );
  }

  /**
   * PATCH /documents/:id: Cập nhật metadata tài liệu với DTO whitelist
   */
  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async updateDocument(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.updateDocument(userId, id, dto);
  }

  /**
   * PUT /documents/:id/content: Lưu nội dung và expectedRevision (chống lost update qua OCC)
   */
  @Put(':id/content')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async updateContent(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentContentDto,
  ) {
    return this.documentsService.updateDocumentContent(
      { sub: userId, role },
      id,
      dto,
    );
  }

  /**
   * GET /documents/:id/versions: Xem lịch sử các phiên bản
   */
  @Get(':id/versions')
  async getVersions(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id') id: string,
    @Query() query: QueryVersionsDto,
  ) {
    return this.documentsService.getDocumentVersions(
      { sub: userId, role },
      id,
      query,
    );
  }

  /**
   * POST /documents/:id/restore/:versionId: Khôi phục phiên bản snapshot tạo revision mới
   */
  @Post(':id/restore/:versionId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async restoreVersion(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ) {
    return this.documentsService.restoreDocumentVersion(
      { sub: userId, role },
      id,
      versionId,
    );
  }

  /**
   * POST /documents/:id/export: Tạo file xuất DOCX hoặc PDF
   */
  @Post(':id/export')
  async exportDocument(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id') id: string,
    @Body() dto: ExportDocumentDto,
  ) {
    return this.documentsService.exportDocument(
      { sub: userId, role },
      id,
      dto,
    );
  }

  /**
   * GET /documents/:id/export/:exportId: Lấy trạng thái và presigned download URL
   */
  @Get(':id/export/:exportId')
  async getExportStatus(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id') id: string,
    @Param('exportId') exportId: string,
  ) {
    return this.documentsService.getExportJobStatus(
      { sub: userId, role },
      id,
      exportId,
    );
  }
}
