import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '../../generated/prisma/client.js';
import { ZaloOAuthService } from './zalo-oauth.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RefreshTokenDto } from './dto/refresh-token.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { ZaloCallbackDto } from './dto/zalo-callback.dto.js';
import type { LinkZaloDto } from './dto/link-zalo.dto.js';
import type { ExchangeZaloTicketDto } from './dto/exchange-zalo-ticket.dto.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly zaloOAuthService: ZaloOAuthService,
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
   * Sinh các biến thể số điện thoại phổ biến tại Việt Nam (+84, 0..., khoảng trắng, dấu gạch, chấm)
   */
  getPhoneVariants(phone: string): string[] {
    const cleaned = phone.replace(/[\s.\-()]/g, '');
    const variants = new Set<string>();

    if (cleaned !== phone) {
      variants.add(cleaned);
    }

    if (cleaned.startsWith('+84')) {
      const rest = cleaned.slice(3);
      variants.add(`0${rest}`);
      variants.add(`84${rest}`);
      variants.add(rest);
    } else if (cleaned.startsWith('84') && cleaned.length >= 11) {
      const rest = cleaned.slice(2);
      variants.add(`0${rest}`);
      variants.add(`+84${rest}`);
      variants.add(rest);
    } else if (cleaned.startsWith('0') && cleaned.length >= 10) {
      const rest = cleaned.slice(1);
      variants.add(`+84${rest}`);
      variants.add(`84${rest}`);
      variants.add(rest);
    }

    return [...variants];
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
      this.logger.error(
        'Lỗi cấu hình: JWT_ACCESS_SECRET chưa được cấu hình trong biến môi trường (.env)',
      );
      throw new InternalServerErrorException(
        'Lỗi cấu hình hệ thống: Không thể xử lý yêu cầu xác thực',
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
    const rawIdentifier =
      loginDto.identifier?.trim() ||
      loginDto.email?.trim() ||
      loginDto.phone?.trim() ||
      loginDto.username?.trim();

    if (!rawIdentifier) {
      throw new BadRequestException(
        'Tài khoản (email hoặc số điện thoại) không được để trống',
      );
    }

    const { email, phone } = this.normalizeIdentifier(rawIdentifier);

    let user = await this.prisma.user.findFirst({
      where: email ? { email } : { phone },
    });

    // Nếu chưa tìm thấy và là số điện thoại, thử tìm theo các biến thể số điện thoại (+84, 0...)
    if (!user && phone) {
      const phoneVariants = this.getPhoneVariants(phone);
      if (phoneVariants.length > 0) {
        user = await this.prisma.user.findFirst({
          where: {
            phone: { in: phoneVariants },
          },
        });
      }
    }

    // Nếu chưa tìm thấy và là email, thử tìm không phân biệt chữ hoa/thường
    if (!user && email) {
      user = await this.prisma.user.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
        },
      });
    }

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

  /**
   * Đăng ký tài khoản học viên (STUDENT) mới
   */
  async register(registerDto: RegisterDto) {
    const email = registerDto.email.trim().toLowerCase();
    const phone = registerDto.phone.trim();

    // 1. Kiểm tra email đã tồn tại hay chưa
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    // 2. Kiểm tra số điện thoại đã tồn tại hay chưa
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      throw new ConflictException('Số điện thoại này đã được sử dụng');
    }

    // 3. Băm mật khẩu bằng bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // 4. Lưu người dùng vào database với role mặc định là STUDENT và isActive là true
    try {
      const user = await this.prisma.user.create({
        data: {
          fullName: registerDto.fullName.trim(),
          phone,
          email,
          passwordHash,
          role: UserRole.STUDENT,
          isActive: true,
          dateOfBirth: registerDto.dateOfBirth
            ? new Date(registerDto.dateOfBirth)
            : null,
        },
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          role: true,
          isActive: true,
          dateOfBirth: true,
          createdAt: true,
        },
      });

      return {
        message: 'Đăng ký tài khoản thành công',
        user,
      };
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const target = Array.isArray(error?.meta?.target)
          ? error.meta.target
          : typeof error?.meta?.target === 'string'
            ? [error.meta.target]
            : [];

        if (target.includes('email')) {
          throw new ConflictException('Email này đã được sử dụng');
        }
        if (target.includes('phone')) {
          throw new ConflictException('Số điện thoại này đã được sử dụng');
        }
        throw new ConflictException('Email hoặc số điện thoại đã được sử dụng');
      }
      throw error;
    }
  }

  /**
   * Khởi tạo URL xác thực Zalo OAuth V4
   */
  getZaloAuthorizationUrl(): string {
    return this.zaloOAuthService.getAuthorizationUrl();
  }

  /**
   * Xử lý callback sau khi người dùng phê duyệt hoặc từ chối tại Zalo
   */
  async handleZaloCallback(
    query: ZaloCallbackDto,
    req: Request,
    res: Response,
  ) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const prefersJson = this.prefersJson(req);

    // 1. Xử lý trường hợp người dùng từ chối cấp quyền hoặc có lỗi trả về từ Zalo
    if (
      query.error !== undefined ||
      query.error_description ||
      query.error_reason
    ) {
      const errorMsg =
        query.error_description ||
        query.error_reason ||
        'Người dùng đã hủy hoặc từ chối cấp quyền truy cập Zalo';
      this.logger.warn(`Zalo OAuth bị từ chối hoặc phát sinh lỗi: ${errorMsg}`);

      if (frontendUrl && !prefersJson) {
        const redirectUrl = this.buildFrontendRedirectUrl(frontendUrl);
        redirectUrl.searchParams.set('error', 'zalo_access_denied');
        redirectUrl.searchParams.set('error_description', errorMsg);
        return res.redirect(redirectUrl.toString());
      }

      throw new UnauthorizedException(
        `Người dùng đã từ chối cấp quyền truy cập Zalo: ${errorMsg}`,
      );
    }

    // 2. Xác minh state chống CSRF
    if (!query.state) {
      if (frontendUrl && !prefersJson) {
        const redirectUrl = this.buildFrontendRedirectUrl(frontendUrl);
        redirectUrl.searchParams.set('error', 'invalid_state');
        redirectUrl.searchParams.set(
          'error_description',
          'Mã state không được cung cấp',
        );
        return res.redirect(redirectUrl.toString());
      }
      throw new BadRequestException('Mã state không được cung cấp');
    }

    const codeVerifier = this.zaloOAuthService.validateAndConsumeState(
      query.state,
    );
    if (!codeVerifier) {
      if (frontendUrl && !prefersJson) {
        const redirectUrl = this.buildFrontendRedirectUrl(frontendUrl);
        redirectUrl.searchParams.set('error', 'state_expired');
        redirectUrl.searchParams.set(
          'error_description',
          'Mã state không hợp lệ hoặc phiên đăng nhập Zalo đã hết hạn',
        );
        return res.redirect(redirectUrl.toString());
      }
      throw new BadRequestException(
        'Mã state không hợp lệ hoặc phiên đăng nhập Zalo đã hết hạn',
      );
    }

    // 3. Kiểm tra authorization code
    if (!query.code) {
      if (frontendUrl && !prefersJson) {
        const redirectUrl = this.buildFrontendRedirectUrl(frontendUrl);
        redirectUrl.searchParams.set('error', 'missing_code');
        redirectUrl.searchParams.set(
          'error_description',
          'Mã code xác thực không được cung cấp',
        );
        return res.redirect(redirectUrl.toString());
      }
      throw new BadRequestException('Mã code xác thực không được cung cấp');
    }

    // 4. Đổi authorization code lấy Access Token của Zalo
    const zaloAccessToken =
      await this.zaloOAuthService.exchangeCodeForAccessToken(
        query.code,
        codeVerifier,
      );

    // 5. Gọi Social API chính thức để lấy thông tin người dùng
    const zaloProfile =
      await this.zaloOAuthService.getZaloUserProfile(zaloAccessToken);

    // 6. Tìm kiếm người dùng trong cơ sở dữ liệu theo zaloId
    const existingUser = await this.prisma.user.findUnique({
      where: { zaloId: zaloProfile.zaloId },
    });

    // Trường hợp A: Đã liên kết tài khoản
    if (existingUser) {
      if (!existingUser.isActive) {
        this.logger.warn(
          `Tài khoản user ${existingUser.id} đã bị vô hiệu hóa khi đăng nhập qua Zalo`,
        );
        if (frontendUrl && !prefersJson) {
          const redirectUrl = this.buildFrontendRedirectUrl(frontendUrl);
          redirectUrl.searchParams.set('error', 'account_inactive');
          redirectUrl.searchParams.set(
            'error_description',
            'Tài khoản của bạn đã bị vô hiệu hóa hoặc khóa',
          );
          return res.redirect(redirectUrl.toString());
        }
        throw new UnauthorizedException(
          'Tài khoản của bạn đã bị vô hiệu hóa hoặc khóa',
        );
      }

      const accessToken = await this.generateAccessToken(existingUser);
      const refreshToken = await this.generateAndSaveRefreshToken(
        existingUser.id,
      );

      const loginResult = {
        message: 'Đăng nhập bằng Zalo thành công',
        isLinked: true,
        user: {
          id: existingUser.id,
          fullName: existingUser.fullName,
          phone: existingUser.phone,
          email: existingUser.email,
          role: existingUser.role,
          avatarUrl: existingUser.avatarUrl,
        },
        tokens: {
          accessToken: accessToken.token,
          tokenType: 'Bearer',
          expiresIn: accessToken.expiresIn,
          refreshToken: refreshToken.refreshToken,
        },
      };

      if (frontendUrl && !prefersJson) {
        // Sinh ticket đổi token 1 lần, không đưa token trực tiếp lên URL
        const ticket = this.zaloOAuthService.createExchangeTicket(loginResult);
        const redirectUrl = this.buildFrontendRedirectUrl(frontendUrl);
        redirectUrl.searchParams.set('ticket', ticket);
        redirectUrl.searchParams.set('isLinked', 'true');
        return res.redirect(redirectUrl.toString());
      }

      return res.json(loginResult);
    }

    // Trường hợp B: Chưa liên kết tài khoản -> Yêu cầu xác minh tài khoản VanbyNhi hiện có
    // Không tự động tạo tài khoản mới theo yêu cầu nghiệp vụ
    const linkTicket = this.zaloOAuthService.createLinkTicket(zaloProfile);

    const unlinkedResult = {
      message:
        'Tài khoản Zalo chưa được liên kết với bất kỳ tài khoản VanbyNhi nào',
      isLinked: false,
      linkTicket,
      zaloName: zaloProfile.name,
      instructions:
        'Vui lòng gọi API POST /auth/zalo/link với thông tin tài khoản hiện có (email/phone và mật khẩu) để hoàn tất liên kết',
    };

    if (frontendUrl && !prefersJson) {
      const redirectUrl = this.buildFrontendRedirectUrl(frontendUrl);
      redirectUrl.searchParams.set('linkTicket', linkTicket);
      redirectUrl.searchParams.set('isLinked', 'false');
      return res.redirect(redirectUrl.toString());
    }

    return res.json(unlinkedResult);
  }

  /**
   * Đổi vé ticket lấy JWT access token và refresh token
   */
  async exchangeZaloTicket(dto: ExchangeZaloTicketDto) {
    const data = this.zaloOAuthService.consumeExchangeTicket(dto.ticket);
    if (!data) {
      throw new UnauthorizedException('Mã ticket không hợp lệ hoặc đã hết hạn');
    }
    return data;
  }

  /**
   * Xác minh tài khoản VanbyNhi hiện có và liên kết với tài khoản Zalo
   */
  async linkZaloAccount(dto: LinkZaloDto) {
    const zaloProfile = this.zaloOAuthService.consumeLinkTicket(dto.linkTicket);
    if (!zaloProfile) {
      throw new UnauthorizedException(
        'Mã liên kết không hợp lệ hoặc đã hết hạn. Vui lòng thực hiện lại quy trình đăng nhập Zalo.',
      );
    }

    const { email, phone } = this.normalizeIdentifier(dto.identifier);
    let user = await this.prisma.user.findFirst({
      where: email ? { email } : { phone },
    });

    if (!user && phone) {
      const phoneVariants = this.getPhoneVariants(phone);
      if (phoneVariants.length > 0) {
        user = await this.prisma.user.findFirst({
          where: {
            phone: { in: phoneVariants },
          },
        });
      }
    }

    if (!user && email) {
      user = await this.prisma.user.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
        },
      });
    }

    if (!user) {
      throw new UnauthorizedException(
        'Thông tin tài khoản xác minh không chính xác',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Tài khoản của bạn đã bị vô hiệu hóa hoặc khóa',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Thông tin tài khoản xác minh không chính xác',
      );
    }

    // Kiểm tra tài khoản này đã gắn zaloId khác chưa
    if (user.zaloId && user.zaloId !== zaloProfile.zaloId) {
      throw new ConflictException(
        'Tài khoản này đã được liên kết với một tài khoản Zalo khác',
      );
    }

    // Kiểm tra zaloId này có thuộc về người dùng khác hay không
    const existingZaloUser = await this.prisma.user.findUnique({
      where: { zaloId: zaloProfile.zaloId },
    });
    if (existingZaloUser && existingZaloUser.id !== user.id) {
      throw new ConflictException(
        'Tài khoản Zalo này đã được liên kết với một tài khoản người dùng khác',
      );
    }

    // Cập nhật zaloId và ghi nhận AuthAccount trong database
    const [updatedUser] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { zaloId: zaloProfile.zaloId },
      }),
      this.prisma.authAccount.upsert({
        where: {
          provider_providerAccountId: {
            provider: 'zalo',
            providerAccountId: zaloProfile.zaloId,
          },
        },
        update: { userId: user.id },
        create: {
          userId: user.id,
          provider: 'zalo',
          providerAccountId: zaloProfile.zaloId,
        },
      }),
    ]);

    const accessToken = await this.generateAccessToken(updatedUser);
    const refreshToken = await this.generateAndSaveRefreshToken(updatedUser.id);

    return {
      message: 'Liên kết tài khoản Zalo thành công',
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        email: updatedUser.email,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
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
   * Hủy liên kết tài khoản Zalo
   */
  async unlinkZaloAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.zaloId) {
      throw new BadRequestException('Tài khoản chưa được liên kết với Zalo');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { zaloId: null },
      }),
      this.prisma.authAccount.deleteMany({
        where: { userId, provider: 'zalo' },
      }),
    ]);

    return {
      message: 'Hủy liên kết tài khoản Zalo thành công',
    };
  }

  private buildFrontendRedirectUrl(frontendUrl: string): URL {
    const url = new URL(frontendUrl);
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/auth/zalo/callback';
    }
    return url;
  }

  private prefersJson(req: Request): boolean {
    if (req.query?.format === 'json') return true;
    const accept = req.headers?.accept || '';
    return accept.includes('application/json') && !accept.includes('text/html');
  }
}

