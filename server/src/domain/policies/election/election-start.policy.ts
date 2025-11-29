import { ElectionStatus } from '@domain/enums/index';
import { Election } from '@domain/models/election.model';
import { ElectionStartViolationException } from '@domains/exceptions/election/election-start.exception';
import { getPHDateString } from '@shared/utils/format-ph-time';

/**
 * ElectionStartPolicy
 *
 * This policy enforces business rules for starting an election.
 *
 * @param election - The election to validate
 * @param delegatesCount - The number of delegates in the election
 * @param districtCount - The number of districts in the election
 * @param positionCount - The number of positions in the election
 * @param candidateCount - The number of candidates in the election
 * @throws ElectionStartViolationException - If the election cannot be started
 */
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

    // Validate if the delegates are uploaded
    if (delegatesCount === 0) {
      throw new ElectionStartViolationException(
        'No delegates. Please upload delegates first',
      );
    }

    // Validate if the districts are created
    if (districtCount === 0) {
      throw new ElectionStartViolationException(
        'No districts. Please create districts first',
      );
    }

    // Validate if the positions are created
    if (positionCount === 0) {
      throw new ElectionStartViolationException(
        'No positions. Please create positions first',
      );
    }

    // Validate if the candidates are created
    if (candidateCount === 0) {
      throw new ElectionStartViolationException(
        'No candidates. Please create candidates first',
      );
    }

    // Validate if the election is not started
    if (election.electionStatus === ElectionStatus.STARTED) {
      throw new ElectionStartViolationException(
        'Election has already started.',
      );
    }

    // Validate if the election is not cancelled
    if (election.electionStatus === ElectionStatus.CANCELLED) {
      throw new ElectionStartViolationException(`Election cancelled.`);
    }

    // Validate if the election is not closed
    if (election.electionStatus === ElectionStatus.CLOSED) {
      throw new ElectionStartViolationException(`Election already closed.`);
    }

    // Validate if the election is scheduled for today
    if (electionDate !== currentDate) {
      throw new ElectionStartViolationException(
        'Cannot start. Election is not scheduled for today.',
      );
    }
  }
}
