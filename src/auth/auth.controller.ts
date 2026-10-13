import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ZaloAuthQueryDto } from './dto/zalo-auth-query.dto.js';
import { ZaloCallbackDto } from './dto/zalo-callback.dto.js';
import { LinkZaloDto } from './dto/link-zalo.dto.js';
import { ExchangeZaloTicketDto } from './dto/exchange-zalo-ticket.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: JwtPayload) {
    return {
      user,
    };
  }

  /**
   * Khởi tạo đăng nhập Zalo OAuth V4:
   * Sinh PKCE (code_verifier, code_challenge), state chống CSRF và chuyển hướng tới Zalo Permission URL
   */
  @Get('zalo')
  async zaloLogin(
    @Res() res: Response,
    @Query() query: ZaloAuthQueryDto,
  ) {
    const redirectUrl = this.authService.getZaloAuthorizationUrl();
    if (query?.format === 'json') {
      return res.json({ redirectUrl });
    }
    return res.redirect(redirectUrl);
  }

  /**
   * Tiếp nhận callback từ Zalo sau khi người dùng phê duyệt/từ chối
   */
  @Get('zalo/callback')
  async zaloCallback(
    @Query() query: ZaloCallbackDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.handleZaloCallback(query, req, res);
  }

  /**
   * Đổi vé exchange ticket lấy JWT access token và refresh token
   */
  @Post('zalo/exchange')
  @HttpCode(HttpStatus.OK)
  async exchangeZaloTicket(@Body() dto: ExchangeZaloTicketDto) {
    return this.authService.exchangeZaloTicket(dto);
  }

  /**
   * Xác minh tài khoản VanbyNhi hiện có và liên kết với tài khoản Zalo
   */
  @Post('zalo/link')
  @HttpCode(HttpStatus.OK)
  async linkZaloAccount(@Body() dto: LinkZaloDto) {
    return this.authService.linkZaloAccount(dto);
  }

  /**
   * Hủy liên kết tài khoản Zalo của người dùng đang đăng nhập
   */
  @Post('zalo/unlink')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unlinkZaloAccount(@CurrentUser() user: JwtPayload) {
    return this.authService.unlinkZaloAccount(user.sub);
  }
}
