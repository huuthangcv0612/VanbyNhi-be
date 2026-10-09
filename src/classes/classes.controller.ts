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
import { ClassesService } from './classes.service.js';
import { CreateClassDto } from './dto/create-class.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';
import { UpdateClassStatusDto } from './dto/update-class-status.dto.js';
import { QueryClassesDto } from './dto/query-classes.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  async create(
    @CurrentUser('sub') adminId: string,
    @Body() createClassDto: CreateClassDto,
  ) {
    return this.classesService.create(adminId, createClassDto);
  }

  @Get()
  async findAll(@Query() query: QueryClassesDto) {
    return this.classesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classesService.update(id, updateClassDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateClassStatusDto,
  ) {
    return this.classesService.updateStatus(id, statusDto);
  }
}
