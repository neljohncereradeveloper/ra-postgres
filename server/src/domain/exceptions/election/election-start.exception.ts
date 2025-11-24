// domain/exceptions/election-start.exception.ts

import { DomainException } from '../domain.exception';

/**
 * ElectionStartViolationException
 *
 * Exception thrown when an election cannot be started due to its current state.
 */
export class ElectionStartViolationException extends DomainException {
  constructor(
    message: string = 'Election cannot be started due to timing or state restrictions.',
  ) {
    super(message);
  }
}
