import { ActivityLog } from '@domain/models/activitylog,model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@domains/exceptions/shared/something-wentwrong.exception copy';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { PositionRepository } from '@domains/repositories/position.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { SettingsRepository } from '@domains/repositories/setting.repository';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { UpdateCandidateCommand } from '@application/commands/candidate/update-candidate.command';
import { Candidate } from '@domain/models/candidate.model';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';

@Injectable()
export class UpdateCandidateUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.CANDIDATE)
    private readonly candidateRepository: CandidateRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.SETTING)
    private readonly settingsRepository: SettingsRepository,
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
    userId: number,
  ): Promise<Candidate> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.UPDATE_CANDIDATE,
      async (manager) => {
        const activeElection =
          await this.settingsRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new BadRequestException('No Active election');
        }

        const election = await this.electionRepository.findById(
          activeElection.electionId,
          manager,
        );
        // Can only update candidate if election is scheduled
        election.validateForUpdate();

        const delegate = await this.delegateRepository.findById(
          dto.delegateId,
          manager,
        );
        if (!delegate) {
          throw new BadRequestException('Delegate not found');
        }

        const position =
          await this.positionRepository.findByDescriptionWithElectionId(
            dto.position,
            activeElection.electionId,
            manager,
          );
        if (!position) {
          throw new NotFoundException('Position not found');
        }

        const district =
          await this.districtRepository.findByDescriptionWithElectionId(
            dto.district,
            activeElection.electionId,
            manager,
          );
        if (!district) {
          throw new NotFoundException('District not found');
        }

        // validate position existence
        const candidateResult = await this.candidateRepository.findById(
          id,
          manager,
        );
        if (!candidateResult) {
          throw new NotFoundException('Candidate not found');
        }

        // Update the district
        const candidate = new Candidate({
          electionId: activeElection.electionId,
          districtId: district.id,
          delegateId: delegate.id,
          positionId: position.id,
          displayName: dto.displayName,
        });
        const updateSuccessfull = await this.candidateRepository.update(
          id,
          candidate,
          manager,
        );

        if (!updateSuccessfull) {
          throw new SomethinWentWrongException('Candidate update failed');
        }

        const updateResult = await this.candidateRepository.findById(
          id,
          manager,
        );
        // Log the creation
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.UPDATE_CANDIDATE,
          DATABASE_CONSTANTS.MODELNAME_CANDIDATE,
          JSON.stringify({
            id: updateResult.id,
            election: election.name,
            delegate: delegate.accountName,
            position: position.desc1,
            district: district.desc1,
            displayName: updateResult.displayName,
          }),
          new Date(),
          userId,
        );
        // insert log
        await this.activityLogRepository.create(log, manager);

        return updateResult;
      },
    );
  }
}
