import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../author/entity/author.entity';
import { ROLES_KEY } from './roles.decorator';
import { RequestWithUser } from './interfaces/request-with-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    if (!requiredRoles) {
      return true; // No roles required, allow access
    }
    
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    
    if (!request.user || !request.user.role) {
      return false;
    }
    
    // Always allow admins to access any endpoint
    if (request.user.role === UserRole.ADMIN) {
      return true;
    }
    
    return requiredRoles.some((role) => request.user.role === role);
  }
}
