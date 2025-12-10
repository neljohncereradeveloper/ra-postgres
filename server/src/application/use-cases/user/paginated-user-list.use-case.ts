import { Injectable } from '@nestjs/common';
import { User } from '@domain/models/user.model';
import { Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { UserRepository } from '@domains/repositories/user.repository';
import { BadRequestException } from '@domains/exceptions/index';

@Injectable()
export class PaginatedUserListUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Executes the use case for finding users with pagination.
   * @param term Search term for filtering by user description.
   * @param page The current page number for pagination.
   * @param limit The number of items per page.
   * @param isArchived Whether to retrieve archived or non-archived users.
   * @returns An object containing paginated users and total count.
   */
  async execute(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<{
    data: User[];
    meta: {
      page: number;
      limit: number;
      total_records: number;
      total_pages: number;
      next_page: number | null;
      previous_page: number | null;
    };
  }> {
    // Validate pagination parameters (Application Layer validation)
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (limit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    // retrieve the paginated list of users
    const users = await this.userRepository.findPaginatedList(
      term,
      page,
      limit,
      is_archived,
    );

    return users;
  }
}
