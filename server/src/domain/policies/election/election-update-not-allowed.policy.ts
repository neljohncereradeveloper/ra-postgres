import { Election } from '@domain/models/election.model';
import { ElectionUpdateNotAllowedException } from '@domains/exceptions/election/election-update-not-allowed.exception';
import { ELECTION_STATUS_CONSTANTS } from '@shared/constants/election.constants';

export class ElectionUpdateNotAllowedPolicy {
  validateUpdateAllowed(election: Election): void {
    if (
      election.status === ELECTION_STATUS_CONSTANTS.STARTED ||
      election.status === ELECTION_STATUS_CONSTANTS.ENDED ||
      election.status === ELECTION_STATUS_CONSTANTS.CANCELLED
    ) {
      throw new ElectionUpdateNotAllowedException(
        'Active elections that are started, ended, or cancelled cannot be updated.',
      );
    }

    if (
      election.status === ELECTION_STATUS_CONSTANTS.ENDED ||
      election.status === ELECTION_STATUS_CONSTANTS.CANCELLED
    ) {
      throw new ElectionUpdateNotAllowedException(
        'Inactive elections with ended or cancelled status cannot be updated.',
      );
    }
  }
}
