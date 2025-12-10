import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { BallotRepository } from '@domains/repositories/ballot.repository';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { CastVoteRepository } from '@domains/repositories/cast-vote.repository';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { PositionRepository } from '@domains/repositories/position.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { Election } from '@domain/models/election.model';
import { CAST_VOTE_ACTIONS } from '@domain/constants/cast-vote/cast-vote-actions.constants';
import {
  BadRequestException,
  NotFoundException,
} from '@domains/exceptions/index';
import { ActivityLog } from '@domain/models/activitylog.model';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class ReprintCastVoteUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.CAST_VOTE)
    private readonly castVoteRepository: CastVoteRepository,
    @Inject(REPOSITORY_TOKENS.DELEGATE)
    private readonly delegateRepository: DelegateRepository,
    @Inject(REPOSITORY_TOKENS.BALLOT)
    private readonly ballotRepository: BallotRepository,
    @Inject(REPOSITORY_TOKENS.CANDIDATE)
    private readonly candidateRepository: CandidateRepository,
    @Inject(REPOSITORY_TOKENS.POSITION)
    private readonly positionRepository: PositionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(
    control_number: string,
    user_name: string,
  ): Promise<{
    ballot_id: string;
    precinct: string;
    election: Election;
    group_candidates: any;
  }> {
    return this.transactionHelper.executeTransaction(
      CAST_VOTE_ACTIONS.REPRINT_CAST_VOTE,
      async (manager) => {
        // Get active election
        const active_election =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!active_election) {
          throw new NotFoundException('No Active election');
        }

        // Retrieve election
        const election = await this.electionRepository.findById(
          active_election.election_id,
          manager,
        );
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${active_election.election_id} not found.`,
          );
        }

        const delegate =
          await this.delegateRepository.findByControlNumberAndElectionId(
            control_number,
            active_election.election_id,
            manager,
          );

        if (!delegate) {
          throw new NotFoundException('Delegate not found');
        }
        if (!delegate.has_voted) {
          throw new BadRequestException('Delegate has not yet voted');
        }

        const ballot = delegate
          ? await this.ballotRepository.retrieveDelegateBallot(
              delegate.id,
              manager,
            )
          : null;

        const cast_votes = await this.castVoteRepository.reprintCastVote(
          election.id,
          ballot.ballot_number,
          manager,
        );

        // Ensure castVotes is always an array
        const cast_votes_array = Array.isArray(cast_votes)
          ? cast_votes
          : cast_votes
            ? [cast_votes]
            : [];

        // Group by position_name and precinct, then collect candidates
        const candidates_map = new Map();
        for (const vote of cast_votes_array) {
          const position = vote.position_name || 'Unknown Position';
          const key = `${position}`;
          if (!candidates_map.has(key)) {
            candidates_map.set(key, {
              position,
              candidates: [],
            });
          }
          candidates_map.get(key).candidates.push({
            id: vote.id,
            name: vote.candidate_name,
          });
        }
        const group_candidates = Array.from(candidates_map.values());

        // Log the cast vote
        const log = ActivityLog.create({
          action: CAST_VOTE_ACTIONS.REPRINT_CAST_VOTE,
          entity: DATABASE_CONSTANTS.MODELNAME_CAST_VOTE,
          details: JSON.stringify({
            id: cast_votes.id,
            election: election.name,
            ballot_number: ballot.ballot_number,
            delegate: delegate.account_name,
            date_time_reprint: getPHDateTime(),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        return {
          ballot_id: ballot?.ballot_number,
          precinct:
            cast_votes_array.length > 0 ? cast_votes_array[0].precinct : null,
          election: election,
          group_candidates,
        };
      },
    );
  }
}
