import { Injectable } from '@nestjs/common';
import { UserRole } from '@domain/models/user-role.model';
import { Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { UserRoleRepository } from '@domains/repositories/user-role.repository';
import { BadRequestException } from '@domains/exceptions/index';

@Injectable()
export class PaginatedUserRoleListUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.USERROLE)
    private readonly userRoleRepository: UserRoleRepository,
  ) {}

  /**
   * Executes the use case for finding userRoles with filters.
   * @param term Search term for filtering by userRole description.
   * @param page The current page number for pagination.
   * @param limit The number of items per page.
   * @param isArchived Whether to retrieve archived or non-archived userRoles.
   * @returns An object containing filtered userRoles and total count.
   */
  async execute(
    term: string,
    page: number,
    limit: number,
    isArchived: boolean,
  ): Promise<{
    data: UserRole[];
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
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (limit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    // retrieve the paginated list of user roles
    const userRoles = await this.userRoleRepository.findPaginatedList(
      term,
      page,
      limit,
      isArchived,
    );

    return userRoles;
  }
}
