import { SetMetadata } from '@nestjs/common';
import { AuthUserRolesEnum } from '@shared/constants/auth.constants';

/**
 * Custom decorator for specifying required roles for access control.
 * @param roles - An array of roles that are required to access a route.
 * @returns A metadata key with the specified roles.
 */
export const AuthorizeRoles = (...roles: AuthUserRolesEnum[]) =>
  SetMetadata('roles', roles);
