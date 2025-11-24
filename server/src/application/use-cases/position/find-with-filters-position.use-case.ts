import { BadRequestException, Injectable } from '@nestjs/common';
import { Position } from '@domain/models/position.model';
import { Inject } from '@nestjs/common';
import { PositionRepository } from '@domains/repositories/position.repository';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { TransactionPort } from '@domain/ports/transaction-port';
import { SettingsRepository } from '@domains/repositories/setting.repository';

@Injectable()
export class FindPositionsWithFiltersUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.POSITION)
    private readonly positionRepository: PositionRepository,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.SETTING)
    private readonly settingsRepository: SettingsRepository,
  ) {}

  /**
   * Executes the use case for finding positions with filters.
   * @param term Search term for filtering by position description.
   * @param page The current page number for pagination.
   * @param limit The number of items per page.
   * @param isDeleted Whether to retrieve deleted or non-deleted positions.
   * @returns An object containing filtered positions and total count.
   */
  async execute(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
  ): Promise<{
    data: Position[];
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
      LOG_ACTION_CONSTANTS.RETRIEVE_POSITIONS_BY_ELECTION_ID,
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
          await this.positionRepository.findPaginatedListWithElectionId(
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
