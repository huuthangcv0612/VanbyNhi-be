import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClassMaterialsService } from './class-materials.service.js';
import { QueryMaterialsDto } from './dto/query-materials.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class StudentMaterialsController {
  constructor(private readonly classMaterialsService: ClassMaterialsService) {}

  /**
   * GET /student/classes/:classId/materials — Lấy danh sách tài liệu lớp mà học sinh được phép truy cập
   */
  @Get('classes/:classId/materials')
  async getStudentClassMaterials(
    @CurrentUser('sub') studentId: string,
    @Param('classId') classId: string,
    @Query() query: QueryMaterialsDto,
  ) {
    return this.classMaterialsService.getStudentClassMaterials(
      studentId,
      classId,
      query,
    );
  }

  /**
   * GET /student/sessions/:sessionId/materials — Lấy danh sách tài liệu buổi học mà học sinh được phép truy cập
   */
  @Get('sessions/:sessionId/materials')
  async getStudentSessionMaterials(
    @CurrentUser('sub') studentId: string,
    @Param('sessionId') sessionId: string,
    @Query() query: QueryMaterialsDto,
  ) {
    return this.classMaterialsService.getStudentSessionMaterials(
      studentId,
      sessionId,
      query,
    );
  }

  /**
   * POST /student/materials/:materialId/download-url — Yêu cầu cấp liên kết tải/xem tài liệu có kiểm tra quyền nghiêm ngặt
   */
  @Post('materials/:materialId/download-url')
  async requestDownloadUrl(
    @CurrentUser('sub') studentId: string,
    @Param('materialId') materialId: string,
  ) {
    return this.classMaterialsService.getStudentMaterialDownloadUrl(
      studentId,
      materialId,
    );
  }

  /**
   * GET /student/materials/:materialId/download-url — Hỗ trợ cả phương thức GET
   */
  @Get('materials/:materialId/download-url')
  async getDownloadUrl(
    @CurrentUser('sub') studentId: string,
    @Param('materialId') materialId: string,
  ) {
    return this.classMaterialsService.getStudentMaterialDownloadUrl(
      studentId,
      materialId,
    );
  }
}
