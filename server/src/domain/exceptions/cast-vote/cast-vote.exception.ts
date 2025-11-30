import { DomainException } from '../domain.exception';

/**
 * CastVoteValidationException
 *
 * Thrown when vote casting validation fails due to business rule violations.
 */
export class CastVoteValidationException extends DomainException {
  constructor(message: string) {
    super(message, 'CAST_VOTE_VALIDATION_FAILED');
  }
}
