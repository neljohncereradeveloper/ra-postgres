import { BadRequestException, Injectable } from '@nestjs/common';
import { Delegate } from '@domain/models/delegate.model';
import { Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { NotFoundException } from '@domains/exceptions/index';
import { DELEGATE_ACTIONS } from '@domain/constants/delegate/delegate-actions.constants';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

@Injectable()
export class PaginatedDelegateListUseCase {
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
   * Executes the use case for finding delegates with filters.
   * @param term Search term for filtering by delegate description.
   * @param page The current page number for pagination.
   * @param limit The number of items per page.
   * @param isArchived Whether to retrieve archived or non-archived delegates.
   * @returns An object containing filtered delegates and total count.
   */
  async execute(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<PaginatedResult<Delegate>> {
    return this.transactionHelper.executeTransaction(
      DELEGATE_ACTIONS.FIND_WITH_PAGINATION,
      async (manager) => {
        // Validate input parameters (optional but recommended)
        if (page < 1) {
          throw new BadRequestException('Page number must be greater than 0');
        }
        if (limit < 1) {
          throw new BadRequestException('Limit must be greater than 0');
        }

        // retrieve the active election
        const active_election =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!active_election) {
          throw new BadRequestException('No Active election');
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

        // Call the repository method to get filtered data
        const delegates = await this.delegateRepository.findPaginatedList(
          term,
          page,
          limit,
          is_archived,
          election.id,
          manager,
        );

        return delegates;
      },
    );
  }
}
