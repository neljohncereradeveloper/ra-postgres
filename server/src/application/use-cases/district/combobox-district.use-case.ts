import { TransactionPort } from '@domain/ports/transaction-port';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { DISTRICT_ACTIONS } from '@domain/constants/district/district-actions.constants';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { NotFoundException } from '@domains/exceptions/index';

@Injectable()
export class ComboboxDistrictUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.DISTRICT)
    private readonly districtRepository: DistrictRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    return this.transactionHelper.executeTransaction(
      DISTRICT_ACTIONS.COMBOBOX,
      async (manager) => {
        // retrieve the active election
        const active_election =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!active_election) {
          throw new NotFoundException('No active election');
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

        const districts = await this.districtRepository.combobox(
          election.id,
          manager,
        );

        return districts.map((val: { desc1: string }) => ({
          value: val.desc1,
          label:
            val.desc1.charAt(0).toUpperCase() +
            val.desc1.slice(1).toLowerCase(),
        }));
      },
    );
  }
}
