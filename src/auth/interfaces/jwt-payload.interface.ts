import type { UserRole } from '../../../generated/prisma/client.js';

export interface JwtPayload {
  sub: string;
  role: UserRole;
  phone: string;
  email: string | null;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  phone: string;
  email: string | null;
  fullName: string;
}
