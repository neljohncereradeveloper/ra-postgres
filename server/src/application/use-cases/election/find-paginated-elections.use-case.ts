import { Injectable, Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ElectionRepository } from '@domains/repositories/election.repository';

@Injectable()
export class FindPaginatedElectionsUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(term: string, page: number, limit: number, isDeleted: boolean) {
    const elections = await this.electionRepository.findPaginatedList(
      term,
      page,
      limit,
      isDeleted,
    );

    return elections;
  }
}
