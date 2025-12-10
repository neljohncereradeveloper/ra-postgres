import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';
import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class ComboboxApplicationAccessUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.APPLICATIONACCESS)
    private readonly applicationAccessRepository: ApplicationAccessRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const application_accesss =
      await this.applicationAccessRepository.combobox();

    return application_accesss.map((val: { desc1: string }) => ({
      value: val.desc1,
      label:
        val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase(),
    }));
  }
}
