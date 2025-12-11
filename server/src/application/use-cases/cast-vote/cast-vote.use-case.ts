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
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import { Election } from '@domain/models/election.model';
import { GatewayGateway } from '@infrastructure/modules/gateway/gateway.gateway';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@domains/exceptions/index';
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
    user_name: string,
    precinct: string,
  ): Promise<{ ballot_id: string; precinct: string; election: Election }> {
    return this.transactionHelper.executeTransaction(
      CAST_VOTE_ACTIONS.CAST_VOTE,
      async (manager) => {
        // Get active election
        const active_election =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!active_election) {
          throw new NotFoundException('No Active election');
        }

        // retrieve the election
        const election = await this.electionRepository.findById(
          active_election.election_id,
          manager,
        );

        if (!election) {
          throw new NotFoundException(
            `Election with ID ${active_election.election_id} not found.`,
          );
        }

        // retrieve the delegate
        const delegate =
          await this.delegateRepository.findByControlNumberAndElectionId(
            dto.control_number,
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
        const candidates = [];
        const positions_map = new Map();

        // Collect all positions for validation
        const positions = await this.positionRepository.findByElection(
          election.id,
          manager,
        );

        positions.forEach((position) => {
          positions_map.set(position.id, position);
        });

        let current_datetime: Date | null;

        // Collect all candidates for validation if provided
        if (dto.candidates && dto.candidates.length > 0) {
          for (const candidateDto of dto.candidates) {
            const candidate = await this.candidateRepository.findById(
              candidateDto.id,
              manager,
            );
            if (candidate) {
              candidates.push(candidate);
            }
          }
        }

        // console.log('candidateEntities', candidateEntities);
        // console.log('election', election);

        // Use the policy for comprehensive validation
        this.castVotePolicy.validateVotingOperation(
          election,
          delegate,
          ballot,
          candidates,
          positions_map,
        );

        // Log if no candidates were selected (empty ballot submission)
        if (candidates.length === 0) {
          // Log the update
          const log = ActivityLog.create({
            action: CAST_VOTE_ACTIONS.CAST_VOTE,
            entity: DATABASE_CONSTANTS.MODELNAME_CAST_VOTE,
            details: JSON.stringify({
              ballot_number: ballot.ballot_number,
              election_name: election.name,
              note: 'Empty ballot submitted (no candidates selected)',
              date_submitted: current_datetime,
            }),
            user_name: user_name,
          });
          await this.activityLogRepository.create(log, manager);
        } else {
          // Process the votes for each selected candidate
          for (const candidate of candidates) {
            // Cast the vote
            const newCastVote = new CastVote({
              election_id: active_election.election_id,
              ballot_number: ballot.ballot_number,
              precinct: precinct,
              candidate_id: candidate.id,
              position_id: candidate.position_id,
              district_id: candidate.district_id,
              datetime_cast: getPHDateTime(),
            });
            const castVote = await this.castVoteRepository.castVote(
              newCastVote,
              manager,
            );

            if (!castVote) {
              throw new SomethinWentWrongException('Cast vote creation failed');
            }

            console.log('castVote => ', castVote);

            current_datetime = castVote.datetime_cast;

            // Log the cast vote
            const log = ActivityLog.create({
              action: CAST_VOTE_ACTIONS.CAST_VOTE,
              entity: DATABASE_CONSTANTS.MODELNAME_CAST_VOTE,
              details: JSON.stringify({
                id: castVote.id,
                election: election.name,
                ballot_number: castVote.ballot_number,
                candidate: candidate.candidate_name,
                datetime_cast: getPHDateTime(castVote.datetime_cast),
                precinct: precinct,
              }),
              user_name: user_name,
            });
            await this.activityLogRepository.create(log, manager);
          }
        }

        // Mark delegate as voted
        await this.delegateRepository.markAsVoted(delegate.id, manager);

        // Submit ballot
        await this.ballotRepository.submitBallot(ballot.ballot_number, manager);

        // Broadcast real-time update
        await GatewayGateway.broadcastLatestCastVotes();

        return {
          ballot_id: ballot.ballot_number,
          precinct: precinct,
          datetime_cast: current_datetime,
          candidates: candidates.map((candidate) => ({
            id: candidate.id,
            position: candidate.position,
            district: candidate.district,
            name: candidate.candidate_name,
          })),
          election: election,
        };
      },
    );
  }
}
