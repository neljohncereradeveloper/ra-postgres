import { DomainException } from '../domain.exception';

/**
 * ApplicationAccessBusinessException
 *
 * Exception thrown when application access business rule validation fails at the domain level.
 */
export class ApplicationAccessBusinessException extends DomainException {
  private static readonly ERROR_CODE = 'APPLICATION_ACCESS_BUSINESS_EXCEPTION';

  constructor(message: string, statusCode: number) {
    super(message, statusCode, ApplicationAccessBusinessException.ERROR_CODE);
  }
}
