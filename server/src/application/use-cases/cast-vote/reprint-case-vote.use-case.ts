import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { BallotRepository } from '@domains/repositories/ballot.repository';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { CastVoteRepository } from '@domains/repositories/cast-vote.repository';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { PositionRepository } from '@domains/repositories/position.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { Election } from '@domain/models/election.model';
import { User } from '@domain/models/user.model';

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
    user: User,
  ): Promise<{
    ballotId: string;
    precinct: string;
    election: Election;
    groupCandidates: any;
  }> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.CAST_VOTE,
      async (manager) => {
        // Get active election
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new BadRequestException('No Active election');
        }

        // Retrieve related entities
        const election = await this.electionRepository.findById(
          activeElection.electionId,
          manager,
        );
        const delegate =
          await this.delegateRepository.findByControlNumberAndElectionId(
            controlNumber,
            activeElection.electionId,
            manager,
          );

        if (!delegate) {
          throw new BadRequestException('Delegate not found');
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

        const castVotes =
          await this.castVoteRepository.reprintCastVoteWithElectionId(
            activeElection.electionId,
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
