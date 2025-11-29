import { ElectionStatus } from '@domain/enums/index';
import { Election } from '@domain/models/election.model';
import { ElectionEndViolationException } from '@domains/exceptions/election/election-end.exception';

/**
 * ElectionClosePolicy
 *
 * This policy enforces business rules for closing an election.
 *
 * @param election - The election to validate
 * @throws ElectionEndViolationException - If the election cannot be closed
 */
export class ElectionClosePolicy {
  validateElectionClose(election: Election): void {
    // Validate if the election is not closed
    if (election.electionStatus === ElectionStatus.CLOSED) {
      throw new ElectionEndViolationException('Election has already closed.');
    }
    // Validate if the election is started
    if (election.electionStatus !== ElectionStatus.STARTED) {
      throw new ElectionEndViolationException(
        'Cannot close election. Election is not started.',
      );
    }
    // Validate if the start time is before the current time
    if (election.startTime && new Date() < election.startTime) {
      throw new ElectionEndViolationException(
        'End time cannot be before the start time.',
      );
    }
  }
}
