import { BadRequestException, Injectable } from '@nestjs/common';
import { Delegate } from '@domain/models/delegate.model';
import { Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import { TransactionPort } from '@domain/ports/transaction-port';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';

@Injectable()
export class FindWithPaginationUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.DELEGATE)
    private readonly delegateRepository: DelegateRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
  ) {}

  /**
   * Executes the use case for finding delegates with filters.
   * @param term Search term for filtering by delegate description.
   * @param page The current page number for pagination.
   * @param limit The number of items per page.
   * @param isDeleted Whether to retrieve deleted or non-deleted delegates.
   * @returns An object containing filtered delegates and total count.
   */
  async execute(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
  ): Promise<{
    data: Delegate[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.RETRIEVE_DELEGATES_BY_ACTIVE_ELECTION,
      async (manager) => {
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new BadRequestException('No Active election');
        }

        // Validate input parameters (optional but recommended)
        if (page < 1) {
          throw new Error('Page number must be greater than 0');
        }
        if (limit < 1) {
          throw new Error('Limit must be greater than 0');
        }

        // Call the repository method to get filtered data
        const result =
          await this.delegateRepository.findPaginatedWithElectionIdList(
            term,
            page,
            limit,
            isDeleted,
            activeElection.electionId,
            manager,
          );

        return result;
      },
    );
  }
}
