import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RefreshTokenDto } from './dto/refresh-token.dto.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Chuẩn hóa identifier: Nếu có ký tự @ thì coi là email (trim + lowercase),
   * ngược lại coi là số điện thoại (trim).
   */
  normalizeIdentifier(identifier: string): { email?: string; phone?: string } {
    const trimmed = identifier.trim();
    if (trimmed.includes('@')) {
      return { email: trimmed.toLowerCase() };
    }
    return { phone: trimmed };
  }

  /**
   * Băm refresh token bằng SHA-256 trước khi lưu vào DB
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Tạo Access Token JWT
   */
  async generateAccessToken(user: {
    id: string;
    role: any;
    phone: string;
    email: string | null;
  }): Promise<{ token: string; expiresIn: string }> {
    const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new InternalServerErrorException(
        'JWT_ACCESS_SECRET chưa được cấu hình',
      );
    }

    const expiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      phone: user.phone,
      email: user.email,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: expiresIn as any,
    });

    return { token, expiresIn };
  }

  /**
   * Tạo và lưu Refresh Token với thời hạn cấu hình
   */
  async generateAndSaveRefreshToken(
    userId: string,
  ): Promise<{ refreshToken: string; expiresAt: Date }> {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    const expiresDaysStr =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_DAYS') ?? '7';
    const expiresDays = parseInt(expiresDaysStr, 10) || 7;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresDays);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        isRevoked: false,
      },
    });

    return { refreshToken: rawToken, expiresAt };
  }

  /**
   * Đăng nhập với Email hoặc Số điện thoại + Mật khẩu
   */
  async login(loginDto: LoginDto) {
    const { email, phone } = this.normalizeIdentifier(loginDto.identifier);

    const user = await this.prisma.user.findFirst({
      where: email ? { email } : { phone },
    });

    // Thông báo lỗi chung, không tiết lộ tài khoản có tồn tại hay không
    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    // Kiểm tra tài khoản có bị vô hiệu hóa hay không (field isActive trong model User)
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Tài khoản của bạn đã bị vô hiệu hóa hoặc khóa',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateAndSaveRefreshToken(user.id);

    return {
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      tokens: {
        accessToken: accessToken.token,
        tokenType: 'Bearer',
        expiresIn: accessToken.expiresIn,
        refreshToken: refreshToken.refreshToken,
      },
    };
  }

  /**
   * Làm mới Access Token và xoay vòng Refresh Token (Token Rotation)
   */
  async refresh(dto: RefreshTokenDto) {
    const tokenHash = this.hashToken(dto.refreshToken);

    const existingToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!existingToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    if (existingToken.isRevoked) {
      throw new UnauthorizedException(
        'Refresh token đã bị thu hồi hoặc đã được sử dụng',
      );
    }

    if (new Date() > existingToken.expiresAt) {
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }

    if (!existingToken.user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    // Thu hồi token cũ và sinh token mới trong Transaction nguyên tử
    const rawNewToken = crypto.randomBytes(40).toString('hex');
    const newTokenHash = this.hashToken(rawNewToken);

    const expiresDaysStr =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_DAYS') ?? '7';
    const expiresDays = parseInt(expiresDaysStr, 10) || 7;
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + expiresDays);

    const [updateResult] = await this.prisma.$transaction([
      this.prisma.refreshToken.updateMany({
        where: {
          id: existingToken.id,
          isRevoked: false,
        },
        data: { isRevoked: true },
      }),
      this.prisma.refreshToken.create({
        data: {
          userId: existingToken.userId,
          tokenHash: newTokenHash,
          expiresAt: newExpiresAt,
          isRevoked: false,
        },
      }),
    ]);

    if (updateResult.count === 0) {
      throw new UnauthorizedException(
        'Refresh token đã bị thu hồi hoặc đã được sử dụng',
      );
    }

    const accessToken = await this.generateAccessToken(existingToken.user);

    return {
      message: 'Làm mới token thành công',
      tokens: {
        accessToken: accessToken.token,
        tokenType: 'Bearer',
        expiresIn: accessToken.expiresIn,
        refreshToken: rawNewToken,
      },
    };
  }

  /**
   * Đăng xuất: Thu hồi Refresh Token hợp lệ
   */
  async logout(dto: RefreshTokenDto) {
    const tokenHash = this.hashToken(dto.refreshToken);

    const existingToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (existingToken && !existingToken.isRevoked) {
      await this.prisma.refreshToken.update({
        where: { id: existingToken.id },
        data: { isRevoked: true },
      });
    }

    return {
      message: 'Đăng xuất thành công',
    };
  }
}
