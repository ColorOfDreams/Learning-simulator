import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (...scopes: string[]) =>
  SetMetadata(PERMISSIONS_KEY, scopes);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) return true;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { user } = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userScopes: string[] = user?.scopes ?? [];

    return required.some((s) => this.userHasScope(userScopes, s));
  }

  private userHasScope(userScopes: string[], required: string): boolean {
    if (userScopes.includes(required)) return true;
    // Hierarchy: tao → xem
    const pipeIndex = required.indexOf('|');
    if (pipeIndex === -1) return false;
    const action = required.slice(pipeIndex + 1);
    if (action === 'xem') {
      const prefix = required.slice(0, pipeIndex);
      return userScopes.includes(`${prefix}|tao`);
    }
    return false;
  }
}
