// domain/exceptions/election/election-lock.exception.ts
import { DomainException } from '../domain.exception';

/**
 * ElectionMutationLockedException
 *
 * Thrown when an attempt is made to modify an election or related data after the election has started.
 */
export class ElectionMutationLockedException extends DomainException {
  constructor(message: string) {
    super(message, 'ELECTION_MUTATION_LOCKED');
  }
}
