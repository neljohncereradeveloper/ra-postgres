import { SetMetadata } from '@nestjs/common';
import { AuthApplicationAccessEnum } from '@shared/constants/auth.constants';

/**
 * Custom decorator for specifying required applicationAccess for access control.
 * @param applicationAccess - An array of applicationAccess that are required to access a route.
 * @returns A metadata key with the specified roles.
 */
export const AuthorizeApplicationAccess = (
  ...applicationAccess: AuthApplicationAccessEnum[]
) => SetMetadata('applicationAccess', applicationAccess);
