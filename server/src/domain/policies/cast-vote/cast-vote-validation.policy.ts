// domain/policies/election/cast-vote.policy.ts

import { Election } from '@domain/models/election.model';
import { Delegate } from '@domain/models/delegate.model';
import { Ballot } from '@domain/models/ballot.model';
import { Candidate } from '@domain/models/candidate.model';
import { Position } from '@domain/models/position.model';
import { CastVoteValidationException } from '@domains/exceptions/cast-vote/cast-vote.exception';
import { BALLOT_STATUS_CONSTANTS } from '@shared/constants/ballot.constants';
import { ElectionStatus } from '@domain/enums/index';

/**
 * CastVotePolicy
 *
 * This policy enforces business rules for casting votes in an election.
 */
export class CastVoteValidationPolicy {
  /**
   * Validates the election state for voting
   *
   * @param election - The election to validate
   * @throws CastVoteValidationException - If election is not in a votable state
   */
  validateElectionState(election: Election): void {
    if (!election) {
      throw new CastVoteValidationException('Election not found');
    }

    // Validate if the election is not closed
    if (election.electionStatus === ElectionStatus.CLOSED) {
      throw new CastVoteValidationException(
        'Election has already been closed.',
      );
    }

    // Validate if the election is not cancelled
    if (election.electionStatus === ElectionStatus.CANCELLED) {
      throw new CastVoteValidationException('Election has been cancelled.');
    }

    // Validate if the election has started
    if (election.electionStatus === ElectionStatus.SCHEDULED) {
      throw new CastVoteValidationException(
        'Cannot cast votes. Election has not started.',
      );
    }
  }

  /**
   * Validates a delegate's eligibility to vote
   *
   * @param delegate - The delegate to validate
   * @throws CastVoteValidationException - If delegate is not eligible to vote
   */
  validateDelegateEligibility(delegate: Delegate): void {
    if (!delegate) {
      throw new CastVoteValidationException('Delegate not found');
    }

    // Validate if the delegate has not already voted
    if (delegate.hasVoted) {
      throw new CastVoteValidationException(
        'Delegate has already voted in this election.',
      );
    }

    // Optional: Add minimum balance check if needed
    // if (delegate.balance < minimumBalanceRequired) {
    //   throw new CastVoteValidationException('Delegate does not meet minimum balance requirement');
    // }
  }

  /**
   * Validates ballot status
   *
   * @param ballot - The ballot to validate
   * @throws CastVoteValidationException - If ballot is invalid or already used
   */
  validateBallot(ballot: Ballot): void {
    if (!ballot) {
      throw new CastVoteValidationException('Ballot not found');
    }

    // Validate if the ballot is in issued status
    if (ballot.status !== BALLOT_STATUS_CONSTANTS.ISSUED) {
      throw new CastVoteValidationException(
        `Ballot is in invalid state: ${ballot.status}. Expected: ${BALLOT_STATUS_CONSTANTS.ISSUED}`,
      );
    }
  }

  /**
   * Validates a candidate
   *
   * @param candidate - The candidate to validate
   * @param electionId - The ID of the election
   * @throws CastVoteValidationException - If candidate is invalid
   */
  validateCandidate(candidate: Candidate, electionId: number): void {
    if (!candidate) {
      throw new CastVoteValidationException('Candidate not found');
    }

    // Validate if the candidate belongs to the active election
    if (candidate.electionId !== electionId) {
      throw new CastVoteValidationException(
        `Candidate ${candidate.displayName} does not belong to the active election.`,
      );
    }

    // Validate if the candidate has not been removed
    if (candidate.deletedAt) {
      throw new CastVoteValidationException('Candidate has been removed.');
    }
  }

  /**
   * Validates that votes per position are within allowed limits
   *
   * @param candidatesPerPosition - Map of position IDs to vote counts
   * @param positions - Map of position IDs to position objects
   * @throws CastVoteValidationException - If voting limits are exceeded
   */
  validatePositionLimits(
    candidatesPerPosition: Map<number, number>,
    positions: Map<number, Position>,
  ): void {
    for (const [positionId, count] of candidatesPerPosition.entries()) {
      const position = positions.get(positionId);

      // Validate if the position exists
      if (!position) {
        throw new CastVoteValidationException(
          `Position with ID ${positionId} not found.`,
        );
      }

      // Validate if votes per position are within allowed limits
      if (position.maxCandidates && count > position.maxCandidates) {
        throw new CastVoteValidationException(
          `Maximum votes allowed for position ${position.desc1} is ${position.maxCandidates}, but ${count} votes were cast.`,
        );
      }
    }
  }

  /**
   * Validates complete voting operation
   *
   * @param election - The active election
   * @param delegate - The delegate casting votes
   * @param ballot - The delegate's ballot
   * @param candidates - The list of candidates being voted for
   * @param positions - Map of positions by ID
   * @throws CastVoteValidationException - If any validation fails
   */
  validateVotingOperation(
    election: Election,
    delegate: Delegate,
    ballot: Ballot,
    candidates: Candidate[],
    positions: Map<number, Position>,
  ): void {
    // Validate election state
    this.validateElectionState(election);

    // Validate delegate eligibility
    this.validateDelegateEligibility(delegate);

    // Validate ballot
    this.validateBallot(ballot);

    // If no candidates selected, that's allowed - simply return
    if (candidates.length === 0) {
      return;
    }

    // Validate that candidates belong to the active election
    for (const candidate of candidates) {
      this.validateCandidate(candidate, election.id);
    }

    // Group candidates by position to check limits
    const candidatesPerPosition = new Map<number, number>();
    for (const candidate of candidates) {
      const count = candidatesPerPosition.get(candidate.positionId) || 0;
      candidatesPerPosition.set(candidate.positionId, count + 1);
    }

    // Validate position voting limits
    this.validatePositionLimits(candidatesPerPosition, positions);
  }
}
