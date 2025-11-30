import { Module } from '@nestjs/common';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActivityLogRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@infrastructure/database/typeorm-mysql/adapters/transaction-helper.adapter';
import { PrecinctController } from './controller/precinct.controller';
import { PrecinctRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/precinct.repository.impl';
import { PaginatedPrecinctListUseCase } from '@application/use-cases/precinct/paginated-precinct-list.use-case';
import { CreatePrecinctUseCase } from '@application/use-cases/precinct/create-precinct.use-case';
import { ArchivePrecinctUseCase } from '@application/use-cases/precinct/archive-precinct.use-case';
import { UpdatePrecinctUseCase } from '@application/use-cases/precinct/update-precinct.use-case';
import { RestorePrecinctUseCase } from '@application/use-cases/precinct/restore-precinct.use-case';
import { ComboboxPrecinctUseCase } from '@application/use-cases/precinct/combobox-precinct.use-case';

@Module({
  imports: [MysqlDatabaseModule],
  controllers: [PrecinctController],
  providers: [
    // Directly provide TransactionHelper here
    {
      provide: REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    { provide: REPOSITORY_TOKENS.PRECINCT, useClass: PrecinctRepositoryImpl },

    {
      provide: REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    CreatePrecinctUseCase,
    UpdatePrecinctUseCase,
    PaginatedPrecinctListUseCase,
    ArchivePrecinctUseCase,
    RestorePrecinctUseCase,
    ComboboxPrecinctUseCase,
  ],
  exports: [
    CreatePrecinctUseCase,
    UpdatePrecinctUseCase,
    PaginatedPrecinctListUseCase,
    ArchivePrecinctUseCase,
    RestorePrecinctUseCase,
    ComboboxPrecinctUseCase,
  ],
})
export class PrecinctModule {}
