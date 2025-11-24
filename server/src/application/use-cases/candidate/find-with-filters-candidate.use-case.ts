import { Injectable } from '@nestjs/common';
import { Candidate } from '@domain/models/candidate.model';
import { Inject } from '@nestjs/common';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { SettingsRepository } from '@domains/repositories/setting.repository';
import { TransactionPort } from '@domain/ports/transaction-port';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class FindCandidatesWithFiltersUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.CANDIDATE)
    private readonly candidateRepository: CandidateRepository,
    @Inject(REPOSITORY_TOKENS.SETTING)
    private readonly settingsRepository: SettingsRepository,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
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
    data: Candidate[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    // Validate input parameters (optional but recommended)
    if (page < 1) {
      throw new Error('Page number must be greater than 0');
    }
    if (limit < 1) {
      throw new Error('Limit must be greater than 0');
    }

    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.RETRIEVE_CANDIDATES_BY_ACTIVE_ELECTION,
      async (manager) => {
        const activeElection =
          await this.settingsRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new BadRequestException('No Active election');
        }

        // Call the repository method to get filtered data
        const result =
          await this.candidateRepository.findPaginatedListWithElectionId(
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
