import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('teacher/document-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
export class TeacherDocumentCategoriesController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * GET /teacher/document-categories — Lấy danh sách danh mục tài liệu của giáo viên
   */
  @Get()
  async getCategories(@CurrentUser('sub') teacherId: string) {
    return this.documentsService.getCategories(teacherId);
  }

  /**
   * POST /teacher/document-categories — Tạo danh mục tài liệu mới
   */
  @Post()
  async createCategory(
    @CurrentUser('sub') teacherId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.documentsService.createCategory(teacherId, dto);
  }

  /**
   * PATCH /teacher/document-categories/:id — Cập nhật thông tin danh mục
   */
  @Patch(':id')
  async updateCategory(
    @CurrentUser('sub') teacherId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.documentsService.updateCategory(teacherId, id, dto);
  }

  /**
   * DELETE /teacher/document-categories/:id — Xóa danh mục an toàn
   */
  @Delete(':id')
  async deleteCategory(
    @CurrentUser('sub') teacherId: string,
    @Param('id') id: string,
  ) {
    return this.documentsService.deleteCategory(teacherId, id);
  }
}
