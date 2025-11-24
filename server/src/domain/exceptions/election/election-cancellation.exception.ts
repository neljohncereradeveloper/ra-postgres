// domain/exceptions/election-cancellation.exception.ts
import { DomainException } from '../domain.exception';

/**
 * ElectionCancellationNotAllowedException
 *
 * Exception thrown when an election cannot be canceled due to its current state.
 */
export class ElectionCancellationNotAllowedException extends DomainException {
  constructor(
    message: string = 'Election cannot be canceled due to timing or state restrictions.',
  ) {
    super(message);
  }
}
