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
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { Election } from '@domain/models/election.model';
import { User } from '@domain/models/user.model';
import { CAST_VOTE_ACTIONS } from '@domain/constants/cast-vote/cast-vote-actions.constants';
import {
  BadRequestException,
  NotFoundException,
} from '@domains/exceptions/index';
import { ActivityLog } from '@domain/models/activitylog.model';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { getPHDateTime } from '@shared/utils/format-ph-time';

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
    controlNumber: string,
    username: string,
  ): Promise<{
    ballotId: string;
    precinct: string;
    election: Election;
    groupCandidates: any;
  }> {
    return this.transactionHelper.executeTransaction(
      CAST_VOTE_ACTIONS.REPRINT_CAST_VOTE,
      async (manager) => {
        // Get active election
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new NotFoundException('No Active election');
        }

        // Retrieve election
        const election = await this.electionRepository.findById(
          activeElection.electionId,
          manager,
        );
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${election.id} not found.`,
          );
        }

        const delegate =
          await this.delegateRepository.findByControlNumberAndElectionId(
            controlNumber,
            activeElection.electionId,
            manager,
          );

        if (!delegate) {
          throw new NotFoundException('Delegate not found');
        }
        if (!delegate.hasVoted) {
          throw new BadRequestException('Delegate has not yet voted');
        }

        const ballot = delegate
          ? await this.ballotRepository.retrieveDelegateBallot(
              delegate.id,
              manager,
            )
          : null;

        const castVotes = await this.castVoteRepository.reprintCastVote(
          election.id,
          ballot.ballotNumber,
          manager,
        );

        // Ensure castVotes is always an array
        const castVotesArray = Array.isArray(castVotes)
          ? castVotes
          : castVotes
            ? [castVotes]
            : [];

        // Group by position_name and precinct, then collect candidates
        const candidatesMap = new Map();
        for (const vote of castVotesArray) {
          const position = vote.positionName || 'Unknown Position';
          const key = `${position}`;
          if (!candidatesMap.has(key)) {
            candidatesMap.set(key, {
              position,
              candidates: [],
            });
          }
          candidatesMap.get(key).candidates.push({
            id: vote.id,
            name: vote.candidateName,
          });
        }
        const groupCandidates = Array.from(candidatesMap.values());

        // Log the cast vote
        const log = ActivityLog.create({
          action: CAST_VOTE_ACTIONS.REPRINT_CAST_VOTE,
          entity: DATABASE_CONSTANTS.MODELNAME_CAST_VOTE,
          details: JSON.stringify({
            id: castVotes.id,
            election: election.name,
            ballotNumber: ballot.ballotNumber,
            delegate: delegate.accountName,
            dateTimeReprint: getPHDateTime(),
          }),
          username: username,
        });
        await this.activityLogRepository.create(log, manager);

        return {
          ballotId: ballot?.ballotNumber,
          precinct:
            castVotesArray.length > 0 ? castVotesArray[0].precinct : null,
          election: election,
          groupCandidates,
        };
      },
    );
  }
}
