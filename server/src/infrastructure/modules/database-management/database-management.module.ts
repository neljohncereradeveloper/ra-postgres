import { Module } from '@nestjs/common';
import { DatabaseManagementController } from './controller/database-management.controller';
import { RestoreDatabaseUseCase } from '@application/use-cases/database-management/restore-database.use-case';
import { BackupDatabaseUseCase } from '@application/use-cases/database-management/backup-database.use-case';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { DatabaseManagementRepositoryTypeormImpl } from '@infrastructure/database/typeorm-mysql/repositories/database-management.repository';

@Module({
  controllers: [DatabaseManagementController],
  providers: [
    {
      provide: REPOSITORY_TOKENS.DATABASEMANAGEMENT,
      useClass: DatabaseManagementRepositoryTypeormImpl,
    },
    RestoreDatabaseUseCase,
    BackupDatabaseUseCase,
  ],
  exports: [RestoreDatabaseUseCase, BackupDatabaseUseCase],
})
export class DatabaseManagementModule {}
