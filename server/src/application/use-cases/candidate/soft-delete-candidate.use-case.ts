import { ActivityLog } from '@domain/models/activitylog,model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { SettingsRepository } from '@domains/repositories/setting.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ElectionRepository } from '@domains/repositories/election.repository';

@Injectable()
export class SoftDeleteCandidateUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.CANDIDATE)
    private readonly candidateRepository: CandidateRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.SETTING)
    private readonly settingsRepository: SettingsRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(id: number, userId: number): Promise<void> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.SOFT_DELETE_CANDIDATE,
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
        // Can only soft delete candidate if election is scheduled
        election.validate();

        const success = await this.candidateRepository.softDelete(id, manager);
        if (!success) {
          // If the entity wasn't found, throw a 404 error
          throw new NotFoundException(
            `Candidate with ID ${id} not found or already deleted.`,
          );
        }

        // Log the creation
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.SOFT_DELETE_CANDIDATE,
          DATABASE_CONSTANTS.MODELNAME_CANDIDATE,
          JSON.stringify({
            id,
            explaination: `Candidate with ID ${id} deleted`,
          }),
          new Date(),
          userId,
        );
        // insert log
        await this.activityLogRepository.create(log, manager);
      },
    );
  }
}
