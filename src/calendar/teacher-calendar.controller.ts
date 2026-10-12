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
import { CalendarService } from './calendar.service.js';
import { QueryCalendarEventsDto } from './dto/query-calendar-events.dto.js';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto.js';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto.js';
import { CreateCalendarLabelDto } from './dto/create-calendar-label.dto.js';
import { UpdateCalendarLabelDto } from './dto/update-calendar-label.dto.js';
import { AddCalendarParticipantsDto } from './dto/add-calendar-participants.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('teacher-calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
export class TeacherCalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  // ==========================================
  // NHÃN (LABELS)
  // ==========================================

  @Get('labels')
  async getLabels(@CurrentUser('sub') teacherId: string) {
    return this.calendarService.getTeacherLabels(teacherId);
  }

  @Post('labels')
  async createLabel(
    @CurrentUser('sub') teacherId: string,
    @Body() dto: CreateCalendarLabelDto,
  ) {
    return this.calendarService.createTeacherLabel(teacherId, dto);
  }

  @Patch('labels/:id')
  async updateLabel(
    @CurrentUser('sub') teacherId: string,
    @Param('id') labelId: string,
    @Body() dto: UpdateCalendarLabelDto,
  ) {
    return this.calendarService.updateTeacherLabel(teacherId, labelId, dto);
  }

  @Delete('labels/:id')
  async deleteLabel(
    @CurrentUser('sub') teacherId: string,
    @Param('id') labelId: string,
  ) {
    return this.calendarService.deleteTeacherLabel(teacherId, labelId);
  }

  // ==========================================
  // SỰ KIỆN (EVENTS)
  // ==========================================

  @Get('events')
  async getEvents(
    @CurrentUser('sub') teacherId: string,
    @Query() query: QueryCalendarEventsDto,
  ) {
    return this.calendarService.getTeacherEvents(teacherId, query);
  }

  @Get('events/:id')
  async getEventById(
    @CurrentUser('sub') teacherId: string,
    @Param('id') eventId: string,
  ) {
    return this.calendarService.getTeacherEventById(teacherId, eventId);
  }

  @Post('events')
  async createEvent(
    @CurrentUser('sub') teacherId: string,
    @Body() dto: CreateCalendarEventDto,
  ) {
    return this.calendarService.createTeacherEvent(teacherId, dto);
  }

  @Patch('events/:id')
  async updateEvent(
    @CurrentUser('sub') teacherId: string,
    @Param('id') eventId: string,
    @Body() dto: UpdateCalendarEventDto,
  ) {
    return this.calendarService.updateTeacherEvent(teacherId, eventId, dto);
  }

  @Delete('events/:id')
  async deleteEvent(
    @CurrentUser('sub') teacherId: string,
    @Param('id') eventId: string,
  ) {
    return this.calendarService.deleteTeacherEvent(teacherId, eventId);
  }

  // ==========================================
  // HỌC SINH THAM GIA (PARTICIPANTS)
  // ==========================================

  @Get('events/:id/participants')
  async getParticipants(
    @CurrentUser('sub') teacherId: string,
    @Param('id') eventId: string,
  ) {
    return this.calendarService.getEventParticipants(teacherId, eventId);
  }

  @Post('events/:id/participants')
  async addParticipants(
    @CurrentUser('sub') teacherId: string,
    @Param('id') eventId: string,
    @Body() dto: AddCalendarParticipantsDto,
  ) {
    return this.calendarService.addEventParticipants(teacherId, eventId, dto);
  }

  @Delete('events/:id/participants/:studentId')
  async removeParticipant(
    @CurrentUser('sub') teacherId: string,
    @Param('id') eventId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.calendarService.removeEventParticipant(
      teacherId,
      eventId,
      studentId,
    );
  }
}
