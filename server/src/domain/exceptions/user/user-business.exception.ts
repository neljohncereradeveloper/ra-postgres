import { DomainException } from '../domain.exception';

/**
 * UserBusinessException
 *
 * Exception thrown when user business rule validation fails at the domain level.
 */
export class UserBusinessException extends DomainException {
  private static readonly ERROR_CODE = 'USER_BUSINESS_EXCEPTION';

  constructor(message: string, statusCode: number) {
    super(message, statusCode, UserBusinessException.ERROR_CODE);
  }
}
