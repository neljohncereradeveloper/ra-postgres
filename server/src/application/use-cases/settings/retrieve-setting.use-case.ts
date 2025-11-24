import { TransactionPort } from '@domain/ports/transaction-port';
import { SettingsRepository } from '@domains/repositories/setting.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveSettingUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.SETTING)
    private readonly settingsRepository: SettingsRepository,
  ) {}

  async execute() {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.RETRIEVE_SETTING,
      async (manager) => {
        // Update the setting

        const setting =
          await this.settingsRepository.retrieveActiveElection(manager);

        if (!setting) {
          throw new BadRequestException('No active election.');
        }

        return setting;
      },
    );
  }
}
