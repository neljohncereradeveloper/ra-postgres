import { DomainException } from '../domain.exception';

/**
 * DelegateBusinessException
 *
 * Exception thrown when delegate business rule validation fails at the domain level.
 */
export class DelegateBusinessException extends DomainException {
  private static readonly ERROR_CODE = 'DELEGATE_BUSINESS_EXCEPTION';

  constructor(message: string, statusCode: number) {
    super(message, statusCode, DelegateBusinessException.ERROR_CODE);
  }
}
