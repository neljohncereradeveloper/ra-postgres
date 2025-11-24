import { Injectable } from '@nestjs/common';
import { ApplicationAccess } from '@domain/models/application-access.model';
import { Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';

@Injectable()
export class FindApplicationAccesssWithFiltersUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.APPLICATIONACCESS)
    private readonly applicationAccessRepository: ApplicationAccessRepository,
  ) {}

  /**
   * Executes the use case for finding applicationAccesss with filters.
   * @param term Search term for filtering by applicationAccess description.
   * @param page The current page number for pagination.
   * @param limit The number of items per page.
   * @param isDeleted Whether to retrieve deleted or non-deleted applicationAccesss.
   * @returns An object containing filtered applicationAccesss and total count.
   */
  async execute(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
  ): Promise<{
    data: ApplicationAccess[];
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

    // Call the repository method to get filtered data
    const result = await this.applicationAccessRepository.findWithFilters(
      term,
      page,
      limit,
      isDeleted,
    );

    return result;
  }
}
