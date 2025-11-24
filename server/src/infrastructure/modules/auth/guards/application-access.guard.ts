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
import { AuthApplicationAccessEnum } from '@shared/constants/auth.constants';

/**
 * ! Guard: ApplicationAccessGuard
 */
@Injectable()
export class ApplicationAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(REPOSITORY_TOKENS.AUTH) private authPort: AuthPort,
  ) {}

  /**
   * Determines if the current request is allowed access to the route.
   *
   * @param context - The execution context of the request, providing access to request details.
   * @returns A promise that resolves to `true` if the user has the required applicationAccess, otherwise throws an UnauthorizedException.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // extract applicationAccess from route metadata.
    const requiredApplicationAccess = this.reflector.getAllAndOverride<
      AuthApplicationAccessEnum[]
    >('applicationAccess', [context.getHandler(), context.getClass()]);

    // allowing access routes without applicationAccess
    if (!requiredApplicationAccess) {
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
    const _applicationAccess = user.applicationAccess;

    // validate applicationAccess if match for the route required applicationAccess
    const isAuthorized = requiredApplicationAccess.some((applicationAccess) =>
      _applicationAccess.includes(applicationAccess),
    );

    // throw error if not authorized
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    // return boolean
    return isAuthorized;
  }
}
