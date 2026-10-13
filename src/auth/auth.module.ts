import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { ZaloOAuthService } from './zalo-oauth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

export const jwtOptionsFactory = (configService: ConfigService) => {
  const secret = configService.get<string>('JWT_ACCESS_SECRET');
  if (!secret) {
    throw new Error(
      'Lỗi cấu hình: JWT_ACCESS_SECRET chưa được cấu hình trong biến môi trường (.env)',
    );
  }
  return {
    secret,
    signOptions: {
      expiresIn: (configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
        '15m') as any,
    },
  };
};

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        jwtOptionsFactory(configService),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, ZaloOAuthService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, ZaloOAuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
