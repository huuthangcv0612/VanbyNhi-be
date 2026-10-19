import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { GoogleCryptoService } from './google-crypto.service.js';
import { GoogleAuthService } from './google-auth.service.js';
import { GoogleMeetService } from './google-meet.service.js';
import { GoogleController } from './google.controller.js';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule],
  controllers: [GoogleController],
  providers: [GoogleCryptoService, GoogleAuthService, GoogleMeetService],
  exports: [GoogleCryptoService, GoogleAuthService, GoogleMeetService],
})
export class GoogleModule {}
