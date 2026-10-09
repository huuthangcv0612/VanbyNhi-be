import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';
import { UserRole } from '../../../generated/prisma/client.js';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  const createMockContext = (userRole?: UserRole): any => ({
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        user: userRole ? { sub: 'user-1', role: userRole } : undefined,
      }),
    }),
  });

  it('cho phép truy cập khi route không yêu cầu role', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext(UserRole.STUDENT);

    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('cho phép truy cập khi user có role hợp lệ', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN, UserRole.TEACHER]);
    const context = createMockContext(UserRole.TEACHER);

    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('từ chối truy cập (ForbiddenException) khi user không có role hợp lệ', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = createMockContext(UserRole.STUDENT);

    expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('từ chối truy cập khi request không có user', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.STUDENT]);
    const context = createMockContext(undefined);

    expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
  });
});
