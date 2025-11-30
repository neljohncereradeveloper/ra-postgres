import { TransactionPort } from '@domain/ports/transaction-port';
import { PositionRepository } from '@domains/repositories/position.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { NotFoundException } from '@domains/exceptions/index';
import { POSITION_ACTIONS } from '@domain/constants/position/position-actions.constants';

@Injectable()
export class ComboboxPositionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.POSITION)
    private readonly positionRepository: PositionRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    return this.transactionHelper.executeTransaction(
      POSITION_ACTIONS.COMBOBOX,
      async (manager) => {
        // retrieve the active election
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new NotFoundException('No Active election');
        }

        // retrieve the election
        const election = await this.electionRepository.findById(
          activeElection.electionId,
          manager,
        );
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${activeElection.electionId} not found.`,
          );
        }

        // retrieve the positions
        const positions = await this.positionRepository.combobox(
          election.id,
          manager,
        );

        // return the positions
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
