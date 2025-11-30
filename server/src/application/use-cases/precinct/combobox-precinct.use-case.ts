import { PrecinctRepository } from '@domains/repositories/index';
import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class ComboboxPrecinctUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.PRECINCT)
    private readonly precinctRepository: PrecinctRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const precincts = await this.precinctRepository.combobox();

    return precincts.map((val: { desc1: string }) => ({
      value: val.desc1,
      label:
        val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase(),
    }));
  }
}
