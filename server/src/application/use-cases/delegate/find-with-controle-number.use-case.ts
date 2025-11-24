import { BadRequestException, Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import { TransactionPort } from '@domain/ports/transaction-port';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { SettingsRepository } from '@domains/repositories/setting.repository';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';

@Injectable()
export class FindWithControlNumberUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.DELEGATE)
    private readonly delegateRepository: DelegateRepository,
    @Inject(REPOSITORY_TOKENS.SETTING)
    private readonly settingsRepository: SettingsRepository,
  ) {}

  /**
   * Executes the use case for finding delegates with control number.
   * @param controlNumber The control number of the delegate.
   * @returns An object containing filtered delegates and total count.
   */
  async execute(controlNumber: string) {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.RETRIEVE_DELEGATES_BY_ACTIVE_ELECTION,
      async (manager) => {
        const activeElection =
          await this.settingsRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new BadRequestException('No Active election');
        }

        // Call the repository method to get filtered data
        const result =
          await this.delegateRepository.findByControlNumberWithElectionId(
            controlNumber,
            activeElection.electionId,
            manager,
          );

        if (!result) {
          throw new NotFoundException('Delegate not found');
        }

        return result;
      },
    );
  }
}
