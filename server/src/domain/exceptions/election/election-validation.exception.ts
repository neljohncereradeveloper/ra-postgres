import { DomainException } from '../domain.exception';

/**
 * ElectionValidationException
 *
 * Exception thrown when election validation fails due to business rule violations.
 */
export class ElectionValidationException extends DomainException {
  constructor(message: string) {
    super(message, 'ELECTION_VALIDATION_FAILED');
  }
}

