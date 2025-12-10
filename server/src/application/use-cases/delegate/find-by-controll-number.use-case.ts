import { BadRequestException, Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { DELEGATE_ACTIONS } from '@domain/constants/delegate/delegate-actions.constants';
import { ElectionRepository } from '@domains/repositories/election.repository';

@Injectable()
export class FindByControllNumberUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.DELEGATE)
    private readonly delegateRepository: DelegateRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  /**
   * Executes the use case for finding a delegate by control number.
   * @param controlNumber The control number of the delegate.
   * @returns The delegate.
   */
  async execute(controlNumber: string) {
    return this.transactionHelper.executeTransaction(
      DELEGATE_ACTIONS.FIND_BY_CONTROL_NUMBER,
      async (manager) => {
        // retrieve the active election
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new BadRequestException('No Active election');
        }

        // retrieve the election
        const election = await this.electionRepository.findById(
          activeElection.electionid,
          manager,
        );
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${activeElection.electionid} not found.`,
          );
        }

        // Call the repository method to get the delegate
        const delegate =
          await this.delegateRepository.findByControlNumberAndElectionId(
            controlNumber,
            election.id,
            manager,
          );

        if (!delegate) {
          throw new NotFoundException('Delegate not found');
        }

        return delegate;
      },
    );
  }
}
