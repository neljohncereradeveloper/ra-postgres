// domain/policies/event-lock.policy.ts

import { Election } from '@domain/models/election.model';
import { ElectionMutationLockedException } from '@domains/exceptions/election/election-lock.exception';
import { ELECTION_STATUS_CONSTANTS } from '@shared/constants/election.constants';

/**
 * ElectionLockPolicy
 *
 * This policy enforces data lock rules when an election is in progress or ended.
 */
export class ElectionLockPolicy {
  /**
   * Determines if mutations are allowed for the election.
   *
   * @param election - The election to validate.
   * @throws ElectionMutationLockedException - Thrown if the election is in a locked state.
   */
  validateMutationAllowed(election: Election): void {
    if (election.status === ELECTION_STATUS_CONSTANTS.ENDED) {
      throw new ElectionMutationLockedException(
        'Updating system data is not allowed. Election has already ended.',
      );
    }

    if (election.status === ELECTION_STATUS_CONSTANTS.CANCELLED) {
      throw new ElectionMutationLockedException(
        'Updating system data is not allowed. Updating system data is not allowed. Election has already cancelled.',
      );
    }

    if (election.status === ELECTION_STATUS_CONSTANTS.STARTED) {
      throw new ElectionMutationLockedException(
        'Updating system data is not allowed. Election has already started.',
      );
    }
  }
}
