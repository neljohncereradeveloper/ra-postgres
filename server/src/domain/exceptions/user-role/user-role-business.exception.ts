import { DomainException } from '../domain.exception';

/**
 * UserRoleBusinessException
 *
 * Exception thrown when user role business rule validation fails at the domain level.
 */
export class UserRoleBusinessException extends DomainException {
  private static readonly ERROR_CODE = 'USER_ROLE_BUSINESS_EXCEPTION';

  constructor(message: string, statusCode: number) {
    super(message, statusCode, UserRoleBusinessException.ERROR_CODE);
  }
}
