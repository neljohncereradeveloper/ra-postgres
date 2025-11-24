import { ActivityLog } from '@domain/models/activitylog,model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { SomethinWentWrongException } from '@domains/exceptions/shared/something-wentwrong.exception copy';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { SettingsRepository } from '@domains/repositories/setting.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class ResetElectionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.SETTING)
    private readonly settingsRepository: SettingsRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(userId: number) {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.RESETELECTION_SETTING,
      async (manager) => {
        // Update the setting
        const updateSuccessfull =
          await this.settingsRepository.resetElection(manager);

        if (!updateSuccessfull) {
          throw new SomethinWentWrongException('Setting update failed');
        }

        const updateResult =
          await this.settingsRepository.retrieveActiveElection(manager);

        // Log the creation
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.RESETELECTION_SETTING,
          DATABASE_CONSTANTS.MODELNAME_SETTING,
          JSON.stringify({ ...updateResult }),
          new Date(),
          userId,
        );
        // insert log
        await this.activityLogRepository.create(log, manager);

        return {
          message: 'Election reset successfully',
          success: true,
          data: updateResult,
        };
      },
    );
  }
}
