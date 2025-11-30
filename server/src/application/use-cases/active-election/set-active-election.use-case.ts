import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@domains/exceptions/shared/something-wentwrong.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class SetActiveElectionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(electionName: string, userId: number) {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.UPDATE_SETTING,
      async (manager) => {
        // validate existence
        const election = await this.electionRepository.findByName(
          electionName,
          manager,
        );
        if (!election) {
          throw new NotFoundException('Election does not exist');
        }

        // Update the active election
        const updateSuccessfull =
          await this.activeElectionRepository.setActiveElection(
            election.id,
            manager,
          );

        if (!updateSuccessfull) {
          throw new SomethinWentWrongException('Active election update failed');
        }

        const updateResult =
          await this.activeElectionRepository.retrieveActiveElection(manager);

        // Log the update
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.UPDATE_SETTING,
          DATABASE_CONSTANTS.MODELNAME_ACTIVE_ELECTION,
          JSON.stringify({ ...updateResult }),
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
