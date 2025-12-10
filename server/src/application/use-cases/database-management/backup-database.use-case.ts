import { DatabaseManagementRepository } from '@domains/repositories/database-management.repository';
import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class BackupDatabaseUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.DATABASEMANAGEMENT)
    private readonly databaseManagementRepository: DatabaseManagementRepository,
  ) {}

  async execute(req: any, user_id: number): Promise<string> {
    // Perform additional business logic if needed.
    return await this.databaseManagementRepository.performBackup(req, user_id);
  }
}
