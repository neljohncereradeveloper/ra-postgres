// domain/exceptions/election-timing.exception.ts
import { DomainException } from '../domain.exception';

/**
 * ElectionTimingViolationException
 *
 * Exception thrown when an election violates timing policies.
 */
export class ElectionEndViolationException extends DomainException {
  constructor(message: string = 'Election timing constraints violated.') {
    super(message);
  }
}
