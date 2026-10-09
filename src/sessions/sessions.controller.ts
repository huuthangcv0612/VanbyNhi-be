import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { CreateClassSessionDto } from './dto/create-class-session.dto.js';
import { UpdateClassSessionDto } from './dto/update-class-session.dto.js';
import { UpdateSessionStatusDto } from './dto/update-session-status.dto.js';
import { QuerySessionsDto } from './dto/query-sessions.dto.js';
import { UpsertLessonRecordDto } from './dto/upsert-lesson-record.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('classes/:classId/sessions')
  async create(
    @Param('classId') classId: string,
    @CurrentUser('sub') adminId: string,
    @Body() createDto: CreateClassSessionDto,
  ) {
    return this.sessionsService.create(classId, adminId, createDto);
  }

  @Get('classes/:classId/sessions')
  async findByClass(
    @Param('classId') classId: string,
    @Query() query: QuerySessionsDto,
  ) {
    return this.sessionsService.findByClass(classId, query);
  }

  @Get('sessions/:id')
  async findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Patch('sessions/:id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateClassSessionDto,
  ) {
    return this.sessionsService.update(id, updateDto);
  }

  @Patch('sessions/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateSessionStatusDto,
  ) {
    return this.sessionsService.updateStatus(id, statusDto);
  }

  @Get('sessions/:sessionId/lesson-record')
  async getLessonRecord(@Param('sessionId') sessionId: string) {
    return this.sessionsService.getLessonRecord(sessionId);
  }

  @Put('sessions/:sessionId/lesson-record')
  async upsertLessonRecord(
    @Param('sessionId') sessionId: string,
    @Body() dto: UpsertLessonRecordDto,
  ) {
    return this.sessionsService.upsertLessonRecord(sessionId, dto);
  }
}
