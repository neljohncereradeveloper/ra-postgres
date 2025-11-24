import { Injectable } from '@nestjs/common';
import { User } from '@domain/models/user.model';
import { Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { UserRepository } from '@domains/repositories/user.repository';

@Injectable()
export class FindUsersWithFiltersUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Executes the use case for finding users with filters.
   * @param term Search term for filtering by user description.
   * @param page The current page number for pagination.
   * @param limit The number of items per page.
   * @param isDeleted Whether to retrieve deleted or non-deleted users.
   * @returns An object containing filtered users and total count.
   */
  async execute(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
  ): Promise<{
    data: User[];
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
    const result = await this.userRepository.findWithFilters(
      term,
      page,
      limit,
      isDeleted,
    );

    return result;
  }
}
