import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { QueryUsersDto } from './dto/query-users.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../../generated/prisma/client.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me: Xem thông tin cá nhân
   */
  @Get('me')
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.findOne(user.sub);
  }

  /**
   * PATCH /users/me: Cập nhật thông tin cá nhân
   */
  @Patch('me')
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateMe(user.sub, updateUserDto);
  }

  /**
   * PATCH /users/me/password: Đổi mật khẩu cá nhân
   */
  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.sub, changePasswordDto);
  }

  /**
   * GET /users: Danh sách người dùng (chỉ ADMIN)
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  /**
   * POST /users: Tạo tài khoản TEACHER hoặc STUDENT (chỉ ADMIN)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * GET /users/:id: Chi tiết tài khoản theo ID (chỉ ADMIN)
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * PATCH /users/:id: Cập nhật thông tin người dùng (chỉ ADMIN)
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * PATCH /users/:id/status: Bật/tắt trạng thái hoạt động (chỉ ADMIN)
   */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayload,
    @Body() statusDto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(id, currentUser.sub, statusDto);
  }
}
