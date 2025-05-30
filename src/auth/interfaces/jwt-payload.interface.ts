import { UserRole } from '../../author/entity/author.entity';

export interface JwtPayload {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  sub: number;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: number;
  refreshTokenId: string;
}
