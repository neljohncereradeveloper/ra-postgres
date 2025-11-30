import { DomainException } from '../domain.exception';

/**
 * PrecinctBusinessException
 *
 * Exception thrown when precinct business rule validation fails at the domain level.
 */
export class PrecinctBusinessException extends DomainException {
  private static readonly ERROR_CODE = 'PRECINCT_BUSINESS_EXCEPTION';

  constructor(message: string, statusCode: number) {
    super(message, statusCode, PrecinctBusinessException.ERROR_CODE);
  }
}
