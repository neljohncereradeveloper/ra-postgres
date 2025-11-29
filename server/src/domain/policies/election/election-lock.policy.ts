import { ElectionStatus } from '@domain/enums/index';
import { Election } from '@domain/models/election.model';
import { ElectionMutationLockedException } from '@domains/exceptions/election/election-lock.exception';

/**
 * ElectionLockPolicy
 *
 * This policy enforces data lock rules when an election is closed or cancelled.
 *
 * @param election - The election to validate
 * @throws ElectionMutationLockedException - If the election is closed or cancelled
 */
export class ElectionLockPolicy {
  validate(election: Election): void {
    // Validate if the election is not closed
    if (election.electionStatus === ElectionStatus.CLOSED) {
      throw new ElectionMutationLockedException(
        'Cannot update election. Election has already closed.',
      );
    }

    // Validate if the election is not cancelled
    if (election.electionStatus === ElectionStatus.CANCELLED) {
      throw new ElectionMutationLockedException(
        'Cannot update election. Election is already cancelled.',
      );
    }

    // Validate if the election is not started
    if (election.electionStatus === ElectionStatus.STARTED) {
      throw new ElectionMutationLockedException(
        'Cannot update election. Election has already started.',
      );
    }
  }
}
