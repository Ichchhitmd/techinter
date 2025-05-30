import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../author/entity/author.entity';
import { RequestWithUser } from './interfaces/request-with-user.interface';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user) {
      throw new UnauthorizedException('Not authenticated');
    }
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => request.user.role === role);

    const isAdmin = request.user.role === UserRole.ADMIN;

    return isAdmin || hasRole;
  }
}
