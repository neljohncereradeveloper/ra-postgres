import { DomainException } from '../domain.exception';

/**
 * PrecinctValidationException
 *
 * Exception thrown when precinct validation fails due to business rule violations.
 */
export class PrecinctValidationException extends DomainException {
  constructor(message: string) {
    super(message, 'PRECINCT_VALIDATION_FAILED');
  }
}

