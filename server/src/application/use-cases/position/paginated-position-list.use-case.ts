import { Injectable } from '@nestjs/common';
import { Position } from '@domain/models/position.model';
import { Inject } from '@nestjs/common';
import { PositionRepository } from '@domains/repositories/position.repository';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import {
  BadRequestException,
  NotFoundException,
} from '@domains/exceptions/index';
import { POSITION_ACTIONS } from '@domain/constants/position/position-actions.constants';

@Injectable()
export class PaginatedPositionsListUseCase {
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

  /**
   * Executes the use case for finding positions with filters.
   * @param term Search term for filtering by position description.
   * @param page The current page number for pagination.
   * @param limit The number of items per page.
   * @param isArchived Whether to retrieve archived or non-archived positions.
   * @returns An object containing filtered positions and total count.
   */
  async execute(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<{
    data: Position[];
    meta: {
      page: number;
      limit: number;
      total_records: number;
      total_pages: number;
      next_page: number | null;
      previous_page: number | null;
    };
  }> {
    return this.transactionHelper.executeTransaction(
      POSITION_ACTIONS.FIND_WITH_FILTERS,
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

        // retrieve the paginated list of positions
        const positions = await this.positionRepository.findPaginatedList(
          term,
          page,
          limit,
          election.id,
          is_archived,
          manager,
        );

        return positions;
      },
    );
  }
}
