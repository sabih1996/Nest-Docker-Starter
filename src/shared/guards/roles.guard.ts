import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private userService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();

    const user = await this.userService.getUser(request.user.id);

    if (user.roles.role_name) {
      request.user.role = user.roles.role_name;
      return matchRoles(roles, user.roles.role_name);
    } else {
      return false;
    }
  }
}
function matchRoles(roles: string[], Roles: string) {
  if (!roles.includes(Roles)) return false;
  return true;
}
