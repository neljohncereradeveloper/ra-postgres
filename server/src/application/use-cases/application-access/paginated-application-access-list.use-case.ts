import { Injectable } from '@nestjs/common';
import { ApplicationAccess } from '@domain/models/application-access.model';
import { Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';
import { BadRequestException } from '@domains/exceptions/index';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

@Injectable()
export class PaginatedApplicationAccessListUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.APPLICATIONACCESS)
    private readonly applicationAccessRepository: ApplicationAccessRepository,
  ) {}

  /**
   * Executes the use case for finding applicationAccesss with filters.
   * @param term Search term for filtering by applicationAccess description.
   * @param page The current page number for pagination.
   * @param limit The number of items per page.
   * @param isArchived Whether to retrieve archived or non-archived applicationAccesss.
   * @returns An object containing filtered applicationAccesss and total count.
   */
  async execute(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<PaginatedResult<ApplicationAccess>> {
    // Validate input parameters (optional but recommended)
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (limit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    // retrieve the paginated list of application accesses
    const application_accesses =
      await this.applicationAccessRepository.findPaginatedList(
        term,
        page,
        limit,
        is_archived,
      );

    return application_accesses;
  }
}
