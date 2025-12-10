import { ACTIVE_ELECTION_ACTIONS } from '@domain/constants/active-election/active-election-actions.constants';
import { ActiveElection } from '@domain/models/active-election.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveActiveElectionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
  ) {}

  async execute() {
    return this.transactionHelper.executeTransaction(
      ACTIVE_ELECTION_ACTIONS.RETRIEVE_ACTIVE_ELECTION,
      async (manager) => {
        const active_election =
          await this.activeElectionRepository.retrieveActiveElection(manager);

        if (!active_election) {
          throw new BadRequestException('No active election.');
        }

        return active_election;
      },
    );
  }
}
