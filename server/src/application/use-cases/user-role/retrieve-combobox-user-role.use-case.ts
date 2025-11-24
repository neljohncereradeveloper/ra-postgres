import { UserRoleRepository } from '@domains/repositories/user-role.repository';
import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveComboboxUserRoleUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.USERROLE)
    private readonly userRoleRepository: UserRoleRepository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const userRoles = await this.userRoleRepository.findAll();

    return userRoles.map((val: { desc1: string }) => ({
      value: val.desc1,
      label:
        val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase(),
    }));
  }
}
