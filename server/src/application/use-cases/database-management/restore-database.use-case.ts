import { DatabaseManagementRepository } from '@domains/repositories/database-management.repository';
import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RestoreDatabaseUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.DATABASEMANAGEMENT)
    private readonly databaseManagementRepository: DatabaseManagementRepository,
  ) {}

  async execute(
    file_path: string,
    user_name: string,
    req: any,
  ): Promise<{ message: string; statusCode: number }> {
    // Perform additional business logic if needed.
    return await this.databaseManagementRepository.performRestore(
      file_path,
      user_name,
      req,
    );
  }
}
