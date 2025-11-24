import { TransactionPort } from '@domain/ports/transaction-port';
import { PositionRepository } from '@domains/repositories/position.repository';
import { SettingsRepository } from '@domains/repositories/setting.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveComboboxPositionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.POSITION)
    private readonly positionRepository: PositionRepository,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.SETTING)
    private readonly settingsRepository: SettingsRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.RETRIEVE_POSITIONS_COMBOBOX,
      async (manager) => {
        const activeElection =
          await this.settingsRepository.retrieveActiveElection(manager);

        if (!activeElection) {
          throw new BadRequestException('No Active election');
        }

        const positions = await this.positionRepository.findAllWithElectionId(
          activeElection.electionId,
          manager,
        );

        return positions.map((val: { desc1: string }) => ({
          value: val.desc1,
          label:
            val.desc1.charAt(0).toUpperCase() +
            val.desc1.slice(1).toLowerCase(),
        }));
      },
    );
  }
}
