// domain/policies/event-end.policy.ts

import { Election } from '@domain/models/election.model';
import { ElectionEndViolationException } from '@domains/exceptions/election/election-end.exception';
import { ElectionStartViolationException } from '@domains/exceptions/election/election-start.exception';
import { ELECTION_STATUS_CONSTANTS } from '@shared/constants/election.constants';

export class ElectionClosePolicy {
  validateElectionClose(election: Election, delegatesCount: number): void {
    if (delegatesCount === 0) {
      throw new ElectionStartViolationException(
        'No delegates. Please upload delegates first',
      );
    }
    if (election.status === ELECTION_STATUS_CONSTANTS.ENDED) {
      throw new ElectionEndViolationException('Election has already ended.');
    }
    if (election.status !== ELECTION_STATUS_CONSTANTS.STARTED) {
      throw new ElectionEndViolationException(
        'Election must be started before closing the election.',
      );
    }
    if (election.startTime && new Date() < election.startTime) {
      throw new ElectionEndViolationException(
        'End time cannot be before the start time.',
      );
    }
  }
}
