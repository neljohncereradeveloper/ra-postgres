import { Injectable, Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { BadRequestException } from '@domains/exceptions/index';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';
import { Election } from '@domain/models/election.model';

@Injectable()
export class PaginatedElectionListUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<PaginatedResult<Election>> {
    // Validate input parameters (optional but recommended)
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (limit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    const elections = await this.electionRepository.findPaginatedList(
      term,
      page,
      limit,
      is_archived,
    );

    return elections;
  }
}
