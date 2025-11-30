import { DomainException } from '../domain.exception';

/**
 * PrecinctBusinessValidationException
 *
 * Exception thrown when precinct business rule validation fails at the domain level.
 * Uses a centralized error code (PRECINCT_BUSINESS_VALIDATION_FAILED) for all
 * precinct business rule violations. The statusCode differentiates the error type:
 * - Data validation (name, length, etc.) - uses BAD_REQUEST (400)
 * - State validation (already archived, etc.) - uses CONFLICT (409)
 * - Not found scenarios - uses NOT_FOUND (404)
 */
export class PrecinctBusinessValidationException extends DomainException {
  private static readonly ERROR_CODE = 'PRECINCT_BUSINESS_VALIDATION_FAILED';

  constructor(message: string, statusCode: number) {
    super(message, statusCode, PrecinctBusinessValidationException.ERROR_CODE);
  }
}
