import { TransactionPort } from '@domain/ports/transaction-port';
import { PrecinctRepository } from '@domains/repositories/precinct.repository';
import { Inject, Injectable } from '@nestjs/common';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveComboboxPrecinctUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.PRECINCT)
    private readonly precinctRepository: PrecinctRepository,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.RETRIEVE_PRECINCTS_COMBOBOX,
      async (manager) => {
        const precincts = await this.precinctRepository.findAll(manager);

        return precincts.map((val: { desc1: string }) => ({
          value: val.desc1,
          label:
            val.desc1.charAt(0).toUpperCase() +
            val.desc1.slice(1).toLowerCase(),
        }));
      },
    );
  }
}
