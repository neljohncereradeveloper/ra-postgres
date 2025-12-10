import { Injectable } from '@nestjs/common';
import { Candidate } from '@domain/models/candidate.model';
import { Inject } from '@nestjs/common';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { TransactionPort } from '@domain/ports/transaction-port';
import { CANDIDATE_ACTIONS } from '@domain/constants/candidate/candidate-actions.constants';
import {
  BadRequestException,
  NotFoundException,
} from '@domains/exceptions/index';
import { ElectionRepository } from '@domains/repositories/election.repository';

@Injectable()
export class PaginatedCandidateListUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.CANDIDATE)
    private readonly candidateRepository: CandidateRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  /**
   * Executes the use case for finding candidates with filters.
   * @param term Search term for filtering by position description.
   * @param page The current page number for pagination.
   * @param limit The number of items per page.
   * @param isArchived Whether to retrieve archived or non-archived positions.
   * @returns An object containing filtered candidates and total count.
   */
  async execute(
    term: string,
    page: number,
    limit: number,
    isArchived: boolean,
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
    return this.transactionHelper.executeTransaction(
      CANDIDATE_ACTIONS.FIND_WITH_PAGINATION,
      async (manager) => {
        // Validate input parameters (optional but recommended)
        if (page < 1) {
          throw new BadRequestException('Page number must be greater than 0');
        }
        if (limit < 1) {
          throw new BadRequestException('Limit must be greater than 0');
        }

        // retrieve the active election
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new NotFoundException('No Active election');
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

        // Call the repository method to get filtered data
        const result = await this.candidateRepository.findPaginatedList(
          term,
          page,
          limit,
          isArchived,
          election.id,
          manager,
        );

        return result;
      },
    );
  }
}
