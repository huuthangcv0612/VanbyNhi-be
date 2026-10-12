import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service.js';
import { QueryCalendarEventsDto } from './dto/query-calendar-events.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('student-calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class StudentCalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  async getEvents(
    @CurrentUser('sub') studentId: string,
    @Query() query: QueryCalendarEventsDto,
  ) {
    return this.calendarService.getStudentEvents(studentId, query);
  }

  @Get('events/:id')
  async getEventById(
    @CurrentUser('sub') studentId: string,
    @Param('id') eventId: string,
  ) {
    return this.calendarService.getStudentEventById(studentId, eventId);
  }
}
