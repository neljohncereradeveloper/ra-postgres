import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { SomethinWentWrongException } from '@domains/exceptions/shared/something-wentwrong.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class ResetActiveElectionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(userId: number) {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.RESETELECTION_SETTING,
      async (manager) => {
        // Reset the active election
        const updateSuccessfull =
          await this.activeElectionRepository.reset(manager);

        if (!updateSuccessfull) {
          throw new SomethinWentWrongException('Active election reset failed');
        }

        const updateResult =
          await this.activeElectionRepository.retrieveActiveElection(manager);

        // Log the reset
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.RESETELECTION_SETTING,
          DATABASE_CONSTANTS.MODELNAME_ACTIVE_ELECTION,
          JSON.stringify({ ...updateResult }),
          new Date(),
          userId,
        );
        // insert log
        await this.activityLogRepository.create(log, manager);

        return {
          message: 'Active election reset successfully',
          success: true,
          data: updateResult,
        };
      },
    );
  }
}
