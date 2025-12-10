import { Injectable } from '@nestjs/common';
import { District } from '@domain/models/district.model';
import { Inject } from '@nestjs/common';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { TransactionPort } from '@domain/ports/transaction-port';
import { DISTRICT_ACTIONS } from '@domain/constants/district/district-actions.constants';
import {
  BadRequestException,
  NotFoundException,
} from '@domains/exceptions/index';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

@Injectable()
export class PaginatedDistrictsListUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.DISTRICT)
    private readonly districtRepository: DistrictRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  /**
   * Executes the use case for retrieving a paginated list of districts.
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
    is_deleted: boolean,
  ): Promise<PaginatedResult<District>> {
    return this.transactionHelper.executeTransaction(
      DISTRICT_ACTIONS.FIND_WITH_FILTERS,
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
          throw new NotFoundException('No active election');
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

        // retrieve the paginated list of districts
        const districts = await this.districtRepository.findPaginatedList(
          term,
          page,
          limit,
          is_deleted,
          election.id,
          manager,
        );

        return districts;
      },
    );
  }
}
