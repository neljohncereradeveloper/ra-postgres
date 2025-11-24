import { BadRequestException, Injectable } from '@nestjs/common';
import { District } from '@domain/models/district.model';
import { Inject } from '@nestjs/common';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { SettingsRepository } from '@domains/repositories/setting.repository';
import { TransactionPort } from '@domain/ports/transaction-port';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';

@Injectable()
export class FindDistrictsWithFiltersUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.DISTRICT)
    private readonly districtRepository: DistrictRepository,
    @Inject(REPOSITORY_TOKENS.SETTING)
    private readonly settingsRepository: SettingsRepository,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) {}

  /**
   * Executes the use case for finding districts with filters.
   * @param term Search term for filtering by district description.
   * @param page The current page number for pagination.
   * @param limit The number of items per page.
   * @param isDeleted Whether to retrieve deleted or non-deleted districts.
   * @returns An object containing filtered districts and total count.
   */
  async execute(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
  ): Promise<{
    data: District[];
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
      LOG_ACTION_CONSTANTS.RETRIEVE_DISTRICTS_BY_ELECTION_ID,
      async (manager) => {
        // Validate input parameters (optional but recommended)
        if (page < 1) {
          throw new Error('Page number must be greater than 0');
        }
        if (limit < 1) {
          throw new Error('Limit must be greater than 0');
        }

        const activeElection =
          await this.settingsRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new BadRequestException('No Active election');
        }

        // Call the repository method to get filtered data
        const result =
          await this.districtRepository.findPaginatedListWithElectionId(
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
