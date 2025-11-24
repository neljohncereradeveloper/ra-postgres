import { UserRoleRepository } from '@domains/repositories/user-role.repository';
import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class CheckExistUserRoleUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.USERROLE)
    private readonly userRoleRepository: UserRoleRepository,
  ) {}

  async execute(rolesArray: string[]): Promise<void> {
    // maps role array
    const promises = rolesArray.map(async (role) => {
      // validate role
      await this.userRoleRepository.findByDesc(role);
    });

    // Execute all promises concurrently using Promise.all.
    await Promise.all(promises);
  }
}
