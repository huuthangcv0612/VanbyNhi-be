import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TuitionService } from './tuition.service.js';
import { QueryTuitionFeesDto } from './dto/query-tuition-fees.dto.js';
import { GenerateTuitionFeeDto } from './dto/generate-tuition-fee.dto.js';
import { RecordPaymentDto } from './dto/record-payment.dto.js';
import { VoidPaymentDto } from './dto/void-payment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';

@Controller('tuition')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class TuitionController {
  constructor(private readonly tuitionService: TuitionService) {}

  @Get('fees')
  async findAll(@Query() query: QueryTuitionFeesDto) {
    return this.tuitionService.findAll(query);
  }

  @Get('fees/:id')
  async findOne(@Param('id') id: string) {
    return this.tuitionService.findOne(id);
  }

  @Post('fees/generate')
  async generateTuitionFee(@Body() dto: GenerateTuitionFeeDto) {
    return this.tuitionService.generateTuitionFee(dto);
  }

  @Post('fees/:id/payments')
  async recordPayment(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.tuitionService.recordPayment(id, adminId, dto);
  }

  @Post('payments/:id/void')
  async voidPayment(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Body() dto: VoidPaymentDto,
  ) {
    return this.tuitionService.voidPayment(id, adminId, dto);
  }
}
