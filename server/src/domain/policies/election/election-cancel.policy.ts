// domain/policies/event-cancellation.policy.ts

import { Election } from '@domain/models/election.model';
import { ElectionCancellationNotAllowedException } from '@domains/exceptions/election/election-cancellation.exception';
import { ElectionStatus } from '@domain/enums/index';

/**
 * ElectionCancelPolicy
 *
 * This policy enforces business rules for canceling an election.
 *
 * @param election - The election to validate
 * @throws ElectionCancellationNotAllowedException - If the election cannot be canceled
 */
export class ElectionCancelPolicy {
  validateElectionCancel(election: Election): void {
    // Validate if the election is not cancelled
    if (election.electionStatus === ElectionStatus.CANCELLED) {
      throw new ElectionCancellationNotAllowedException(
        'Election is already canceled.',
      );
    }
    // Validate if the election is not closed
    if (election.electionStatus === ElectionStatus.CLOSED) {
      throw new ElectionCancellationNotAllowedException(
        'Election has closed. Cannot be canceled.',
      );
    }
  }
}
