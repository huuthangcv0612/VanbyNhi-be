import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health/database')
  async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        success: true,
        message: 'Database connection successful',
        database: 'connected',
      };
    } catch {
      throw new ServiceUnavailableException({
        success: false,
        message: 'Database connection failed',
        database: 'disconnected',
      });
    }
  }
}
