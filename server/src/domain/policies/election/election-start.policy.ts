// domain/policies/event-start.policy.ts
import { Election } from '@domain/models/election.model';
import { ElectionStartViolationException } from '@domains/exceptions/election/election-start.exception';
import { ELECTION_STATUS_CONSTANTS } from '@shared/constants/election.constants';
import { getPHDateString } from '@shared/utils/format-ph-time';

export class ElectionStartPolicy {
  validateElectionStart(
    election: Election,
    delegatesCount: number,
    districtCount: number,
    positionCount: number,
    candidateCount: number,
  ): void {
    const currentDate = getPHDateString();
    const electionDate = getPHDateString(election.date);

    if (delegatesCount === 0) {
      throw new ElectionStartViolationException(
        'No delegates. Please upload delegates first',
      );
    }

    if (districtCount === 0) {
      throw new ElectionStartViolationException(
        'No districts. Please create districts first',
      );
    }

    if (positionCount === 0) {
      throw new ElectionStartViolationException(
        'No positions. Please create positions first',
      );
    }

    if (candidateCount === 0) {
      throw new ElectionStartViolationException(
        'No candidates. Please create candidates first',
      );
    }

    if (election.startTime) {
      throw new ElectionStartViolationException(
        'Election has already started.',
      );
    }

    if (election.status === ELECTION_STATUS_CONSTANTS.CANCELLED) {
      throw new ElectionStartViolationException(`Election cancelled.`);
    }

    if (election.status === ELECTION_STATUS_CONSTANTS.ENDED) {
      throw new ElectionStartViolationException(`Election already ended.`);
    }

    if (electionDate !== currentDate) {
      throw new ElectionStartViolationException(
        'Cannot start. Election is not scheduled for today.',
      );
    }
  }
}
