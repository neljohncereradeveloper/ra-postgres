import { CastVoteCommand } from '@application/commands/cast-vote/cast-vote.comman';
import { ActivityLog } from '@domain/models/activitylog.model';
import { CastVote } from '@domain/models/cast-vote.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { CastVoteValidationPolicy } from '@domain/policies/cast-vote/cast-vote-validation.policy';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { BallotRepository } from '@domains/repositories/ballot.repository';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { CastVoteRepository } from '@domains/repositories/cast-vote.repository';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { PositionRepository } from '@domains/repositories/position.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { getPHDateTime } from '@shared/utils/format-ph-time';
import { Election } from '@domain/models/election.model';
import { User } from '@domain/models/user.model';
import { GatewayGateway } from '@infrastructure/modules/gateway/gateway.gateway';
import { NotFoundException } from '@domains/exceptions/index';
import { CAST_VOTE_ACTIONS } from '@domain/constants/cast-vote/cast-vote-actions.constants';

@Injectable()
export class CastVoteUseCase {
  private readonly castVotePolicy: CastVoteValidationPolicy;

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
  ) {
    this.castVotePolicy = new CastVoteValidationPolicy();
  }

  async execute(
    dto: CastVoteCommand,
    username: string,
    precinct: string,
  ): Promise<{ ballotId: string; precinct: string; election: Election }> {
    return this.transactionHelper.executeTransaction(
      CAST_VOTE_ACTIONS.CAST_VOTE,
      async (manager) => {
        // Get active election
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new NotFoundException('No Active election');
        }

        // retrieve the election
        const election = await this.electionRepository.findById(
          activeElection.electionId,
          manager,
        );
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${activeElection.electionId} not found.`,
          );
        }

        // retrieve the delegate
        const delegate =
          await this.delegateRepository.findByControlNumberAndElectionId(
            dto.controlNumber,
            election.id,
            manager,
          );

        // retrieve the ballot
        const ballot = delegate
          ? await this.ballotRepository.retrieveDelegateBallot(
              delegate.id,
              manager,
            )
          : null;

        // Retrieve candidates and positions
        const candidateEntities = [];
        const positionsMap = new Map();

        // Collect all positions for validation
        const positions = await this.positionRepository.findByElection(
          election.id,
          manager,
        );

        positions.forEach((position) => {
          positionsMap.set(position.id, position);
        });

        // Collect all candidates for validation if provided
        if (dto.candidates && dto.candidates.length > 0) {
          for (const candidateDto of dto.candidates) {
            const candidate = await this.candidateRepository.findById(
              candidateDto.id,
              manager,
            );
            if (candidate) {
              candidateEntities.push(candidate);
            }
          }
        }

        // Use the policy for comprehensive validation
        this.castVotePolicy.validateVotingOperation(
          election,
          delegate,
          ballot,
          candidateEntities,
          positionsMap,
        );

        // Log if no candidates were selected (empty ballot submission)
        if (candidateEntities.length === 0) {
          // Log the update
          const log = ActivityLog.create({
            action: CAST_VOTE_ACTIONS.CAST_VOTE,
            entity: DATABASE_CONSTANTS.MODELNAME_CAST_VOTE,
            details: JSON.stringify({
              ballotNumber: ballot.ballotNumber,
              election: election.name,
              note: 'Empty ballot submitted (no candidates selected)',
              dateSubmitted: getPHDateTime(),
            }),
            username: username,
          });
          await this.activityLogRepository.create(log, manager);
        } else {
          // Process the votes for each selected candidate
          for (const candidate of candidateEntities) {
            // Cast the vote
            const newCastVote = new CastVote({
              electionId: activeElection.electionId,
              ballotNumber: ballot.ballotNumber,
              precinct: precinct,
              candidateId: candidate.id,
              positionId: candidate.positionId,
              districtId: candidate.districtId,
              dateTimeCast: getPHDateTime(),
            });
            const castVote = await this.castVoteRepository.castVote(
              newCastVote,
              manager,
            );

            // Log the cast vote
            const log = ActivityLog.create({
              action: CAST_VOTE_ACTIONS.CAST_VOTE,
              entity: DATABASE_CONSTANTS.MODELNAME_CAST_VOTE,
              details: JSON.stringify({
                id: castVote.id,
                election: election.name,
                ballotNumber: castVote.ballotNumber,
                candidate: candidate.displayName,
                dateTimeCast: castVote.dateTimeCast,
              }),
              username: username,
            });
            await this.activityLogRepository.create(log, manager);
          }
        }

        // Mark delegate as voted
        await this.delegateRepository.markAsVoted(delegate.id, manager);

        // Submit ballot
        await this.ballotRepository.submitBallot(ballot.ballotNumber, manager);

        // Broadcast real-time update
        await GatewayGateway.broadcastLatestCastVotes();

        return {
          ballotId: ballot.ballotNumber,
          precinct: precinct,
          election: election,
        };
      },
    );
  }
}
