import { BadRequestException, Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@domain/ports/transaction-port';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { PrecinctRepository } from '@domains/repositories/precinct.repository';
import { Precinct } from '@domain/models/precinct.model';
@Injectable()
export class FindPrecinctsWithFiltersUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.PRECINCT)
    private readonly precinctRepository: PrecinctRepository,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) {}

  /**
   * Executes the use case for finding precincts with filters.
   * @param term Search term for filtering by precinct description.
   * @param page The current page number for pagination.
   * @param limit The number of items per page.
   * @param isDeleted Whether to retrieve deleted or non-deleted precincts.
   * @returns An object containing filtered precincts and total count.
   */
  async execute(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
  ): Promise<{
    data: Precinct[];
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
      LOG_ACTION_CONSTANTS.RETRIEVE_PRECINCTS_BY_ELECTION_ID,
      async (manager) => {
        // Validate input parameters (optional but recommended)
        if (page < 1) {
          throw new Error('Page number must be greater than 0');
        }
        if (limit < 1) {
          throw new Error('Limit must be greater than 0');
        }

        // Call the repository method to get filtered data
        const result = await this.precinctRepository.findPaginatedList(
          term,
          page,
          limit,
          isDeleted,
          manager,
        );

        return result;
      },
    );
  }
}
