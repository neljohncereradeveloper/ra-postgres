import { ElectionRepository } from '@domains/repositories/election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveComboboxElectionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const elections = await this.electionRepository.findAll();

    return elections.map((val: { name: string }) => ({
      value: val.name,
      label: val.name.charAt(0).toUpperCase() + val.name.slice(1).toLowerCase(),
    }));
  }
}
