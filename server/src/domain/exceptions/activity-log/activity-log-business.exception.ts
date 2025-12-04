import { DomainException } from '../domain.exception';

/**
 * ActivityLogBusinessException
 *
 * Exception thrown when activity log business rule validation fails at the domain level.
 */
export class ActivityLogBusinessException extends DomainException {
  private static readonly ERROR_CODE = 'ACTIVITY_LOG_BUSINESS_EXCEPTION';

  constructor(message: string, statusCode: number) {
    super(message, statusCode, ActivityLogBusinessException.ERROR_CODE);
  }
}
