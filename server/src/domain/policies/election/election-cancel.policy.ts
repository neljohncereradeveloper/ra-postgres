// domain/policies/event-cancellation.policy.ts

import { Election } from '@domain/models/election.model';
import { ElectionCancellationNotAllowedException } from '@domains/exceptions/election/election-cancellation.exception';
import { ELECTION_STATUS_CONSTANTS } from '@shared/constants/election.constants';

export class ElectionCancelPolicy {
  validateElectionCancel(election: Election): void {
    if (election.status === ELECTION_STATUS_CONSTANTS.CANCELLED) {
      throw new ElectionCancellationNotAllowedException(
        'Election is already canceled.',
      );
    }
    if (election.status === ELECTION_STATUS_CONSTANTS.ENDED) {
      throw new ElectionCancellationNotAllowedException(
        'Election has ended. Cannot be canceled.',
      );
    }
  }
}
