import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@domain/models/user.model';
import { AuthPort } from '@domain/ports/auth.port';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { AuthUserRolesEnum } from '@shared/constants/auth.constants';

/**
 * ! Guard: RolesGuard
 */
@Injectable()
export class UserRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(REPOSITORY_TOKENS.AUTH) private authPort: AuthPort,
  ) {}

  /**
   * Determines if the current request is allowed access to the route.
   *
   * @param context - The execution context of the request, providing access to request details.
   * @returns A promise that resolves to `true` if the user has the required roles, otherwise throws an UnauthorizedException.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // extract roles from route metadata.
    const requiredRoles = this.reflector.getAllAndOverride<AuthUserRolesEnum[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    // allowing access routes without roles
    if (!requiredRoles) {
      return true;
    }

    // extract JWT token from the request's authorization header.
    const req = context.switchToHttp().getRequest();
    const bearerToken = req.headers['authorization'];

    if (!bearerToken) {
      throw new UnauthorizedException();
    }
    const token = bearerToken.split(' ')[1];

    // validate token
    const user: User = await this.authPort.jwtVerify(token);
    const _roles = user.userRoles;

    // validate roles if match for the route required role
    const isAuthorized = requiredRoles.some((role) => _roles.includes(role));

    // console.log('isAuthorized user : ', isAuthorized);
    // throw error if not authorized
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    // return boolean
    return isAuthorized;
  }
}
