import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { QueryEnrollmentsDto } from './dto/query-enrollments.dto.js';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment-status.dto.js';
import { UpdateEnrollmentTuitionDto } from './dto/update-enrollment-tuition.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('classes/:classId/enrollments')
  async create(
    @Param('classId') classId: string,
    @Body() createDto: CreateEnrollmentDto,
  ) {
    return this.enrollmentsService.create(classId, createDto);
  }

  @Get('classes/:classId/enrollments')
  async findByClass(
    @Param('classId') classId: string,
    @Query() query: QueryEnrollmentsDto,
  ) {
    return this.enrollmentsService.findByClass(classId, query);
  }

  @Get('enrollments/:id')
  async findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch('enrollments/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateEnrollmentStatusDto,
  ) {
    return this.enrollmentsService.updateStatus(id, statusDto);
  }

  @Patch('enrollments/:id/tuition')
  async updateTuition(
    @Param('id') id: string,
    @Body() tuitionDto: UpdateEnrollmentTuitionDto,
  ) {
    return this.enrollmentsService.updateTuition(id, tuitionDto);
  }
}
