import { DomainException } from '../domain.exception';

/**
 * ElectionBusinessException
 *
 * Exception thrown when election business rule validation fails at the domain level.
 */
export class ElectionBusinessException extends DomainException {
  private static readonly ERROR_CODE = 'ELECTION_BUSINESS_EXCEPTION';

  constructor(message: string, statusCode: number) {
    super(message, statusCode, ElectionBusinessException.ERROR_CODE);
  }
}
