import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PrecinctRepository } from '@domains/repositories/index';
import { Precinct } from '@domain/models/index';
import { BadRequestException } from '@domains/exceptions/index';

@Injectable()
export class PaginatedPrecinctListUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.PRECINCT)
    private readonly precinctRepository: PrecinctRepository,
  ) {}

  /**
   * Executes the use case for finding precincts with filters.
   * @param term Search term for filtering by precinct description.
   * @param page The current page number for pagination.
   * @param limit The number of items per page.
   * @param isArchived Whether to retrieve archived or non-archived precincts.
   * @returns An object containing filtered precincts and total count.
   */
  async execute(
    term: string,
    page: number,
    limit: number,
    isArchived: boolean,
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
    // Validate pagination parameters (Application Layer validation)
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (limit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    // Call the repository method to get filtered data
    const result = await this.precinctRepository.findPaginatedList(
      term,
      page,
      limit,
      isArchived,
    );

    return result;
  }
}
