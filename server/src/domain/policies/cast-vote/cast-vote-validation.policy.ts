// domain/policies/election/cast-vote.policy.ts

import { Election } from '@domain/models/election.model';
import { Delegate } from '@domain/models/delegate.model';
import { Ballot } from '@domain/models/ballot.model';
import { Candidate } from '@domain/models/candidate.model';
import { Position } from '@domain/models/position.model';
import { CastVoteBusinessException } from '@domains/exceptions/cast-vote/cast-vote-business.exception';
import { ElectionStatus } from '@domain/enums/index';
import { BALLOT_STATUS_CONSTANTS } from '@domain/constants/ballot/ballot-actions.constants';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

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
      throw new CastVoteBusinessException(
        'Election not found',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Validate if the election is not closed
    if (election.election_status === ElectionStatus.CLOSED) {
      throw new CastVoteBusinessException(
        'Election has already been closed.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the election is not cancelled
    if (election.election_status === ElectionStatus.CANCELLED) {
      throw new CastVoteBusinessException(
        'Election has been cancelled.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the election has started
    if (election.election_status === ElectionStatus.SCHEDULED) {
      throw new CastVoteBusinessException(
        'Cannot cast votes. Election has not started.',
        HTTP_STATUS.BAD_REQUEST,
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
      throw new CastVoteBusinessException(
        'Delegate not found',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Validate if the delegate has not already voted
    if (delegate.has_voted) {
      throw new CastVoteBusinessException(
        'Delegate has already voted in this election.',
        HTTP_STATUS.BAD_REQUEST,
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
      throw new CastVoteBusinessException(
        'Ballot not found',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Validate if the ballot is in issued status
    if (ballot.ballot_status !== BALLOT_STATUS_CONSTANTS.ISSUED) {
      throw new CastVoteBusinessException(
        `Ballot is in invalid state: ${ballot.ballot_status}. Expected: ${BALLOT_STATUS_CONSTANTS.ISSUED}`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }

  /**
   * Validates a candidate
   *
   * @param candidate - The candidate to validate
   * @param election_id - The ID of the election
   * @throws CastVoteValidationException - If candidate is invalid
   */
  validateCandidate(candidate: Candidate, election_id: number): void {
    if (!candidate) {
      throw new CastVoteBusinessException(
        'Candidate not found',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Validate if the candidate belongs to the active election
    if (candidate.election_id !== election_id) {
      throw new CastVoteBusinessException(
        `Candidate ${candidate.display_name} does not belong to the active election.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the candidate has not been removed
    if (candidate.deleted_at) {
      throw new CastVoteBusinessException(
        'Candidate has been removed.',
        HTTP_STATUS.BAD_REQUEST,
      );
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
    candidates_per_position: Map<number, number>,
    positions: Map<number, Position>,
  ): void {
    for (const [position_id, count] of candidates_per_position.entries()) {
      const position = positions.get(position_id);

      // Validate if the position exists
      if (!position) {
        throw new CastVoteBusinessException(
          `Position with ID ${position_id} not found.`,
          HTTP_STATUS.NOT_FOUND,
        );
      }

      // Validate if votes per position are within allowed limits
      if (position.max_candidates && count > position.max_candidates) {
        throw new CastVoteBusinessException(
          `Maximum votes allowed for position ${position.desc1} is ${position.max_candidates}, but ${count} votes were cast.`,
          HTTP_STATUS.BAD_REQUEST,
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
    const candidates_per_position = new Map<number, number>();
    for (const candidate of candidates) {
      const count = candidates_per_position.get(candidate.position_id) || 0;
      candidates_per_position.set(candidate.position_id, count + 1);
    }

    // Validate position voting limits
    this.validatePositionLimits(candidates_per_position, positions);
  }
}
