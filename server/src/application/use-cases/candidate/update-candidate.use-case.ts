import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@domains/exceptions/shared/something-wentwrong.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { PositionRepository } from '@domains/repositories/position.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { UpdateCandidateCommand } from '@application/commands/candidate/update-candidate.command';
import { Candidate } from '@domain/models/candidate.model';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { CANDIDATE_ACTIONS } from '@domain/constants/candidate/candidate-actions.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class UpdateCandidateUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.CANDIDATE)
    private readonly candidateRepository: CandidateRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.POSITION)
    private readonly positionRepository: PositionRepository,
    @Inject(REPOSITORY_TOKENS.DISTRICT)
    private readonly districtRepository: DistrictRepository,
    @Inject(REPOSITORY_TOKENS.DELEGATE)
    private readonly delegateRepository: DelegateRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateCandidateCommand,
    user_name: string,
  ): Promise<Candidate> {
    return this.transactionHelper.executeTransaction(
      CANDIDATE_ACTIONS.UPDATE,
      async (manager) => {
        // retrieve the active election
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
        // Can only update candidate if election is scheduled
        election.validateForUpdate();

        const delegate = await this.delegateRepository.findById(
          dto.delegate_id,
          manager,
        );
        if (!delegate) {
          throw new NotFoundException('Delegate not found');
        }

        const position = await this.positionRepository.findByDescription(
          dto.position,
          election.id,
          manager,
        );
        if (!position) {
          throw new NotFoundException('Position not found');
        }

        const district = await this.districtRepository.findByDescription(
          dto.district,
          election.id,
          manager,
        );
        if (!district) {
          throw new NotFoundException('District not found');
        }

        // retrieve the candidate
        const candidate = await this.candidateRepository.findById(id, manager);
        if (!candidate) {
          throw new NotFoundException('Candidate not found');
        }

        candidate.update({
          display_name: dto.display_name,
          updated_by: user_name,
          position_id: position.id,
          district_id: district.id,
        });

        // update the candidate in the database
        const update_successfull = await this.candidateRepository.update(
          id,
          candidate,
          manager,
        );

        if (!update_successfull) {
          throw new SomethinWentWrongException('Candidate update failed');
        }

        const update_result = await this.candidateRepository.findById(
          id,
          manager,
        );

        // Log the update
        const log = ActivityLog.create({
          action: CANDIDATE_ACTIONS.UPDATE,
          entity: DATABASE_CONSTANTS.MODELNAME_CANDIDATE,
          details: JSON.stringify({
            id: update_result.id,
            display_name: update_result.display_name,
            position: position.desc1,
            district: district.desc1,
            delegate: delegate.account_name,
            updated_by: user_name,
            updated_at: getPHDateTime(update_result.updated_at),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        return update_result;
      },
    );
  }
}
