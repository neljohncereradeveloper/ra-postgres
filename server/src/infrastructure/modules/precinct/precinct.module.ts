import { Module } from '@nestjs/common';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActivityLogRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@infrastructure/database/typeorm-mysql/adapters/transaction-helper.adapter';
import { PrecinctController } from './controller/precinct.controller';
import { PrecinctRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/precinct.repository.impl';
import { FindPrecinctsWithFiltersUseCase } from '@application/use-cases/precinct/find-with-filters-precinct.use-case';
import { CreatePrecinctUseCase } from '@application/use-cases/precinct/create-precinct.use-case';
import { SoftDeletePrecinctUseCase } from '@application/use-cases/precinct/soft-delete-precinct.use-case';
import { UpdatePrecinctUseCase } from '@application/use-cases/precinct/update-precinct.use-case';
import { RestoreDeletePrecinctUseCase } from '@application/use-cases/precinct/restore-delete-precinct.use-case';
import { RetrieveComboboxPrecinctUseCase } from '@application/use-cases/precinct/retrieve-combobox-precinct.use-case';

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
    FindPrecinctsWithFiltersUseCase,
    SoftDeletePrecinctUseCase,
    RestoreDeletePrecinctUseCase,
    RetrieveComboboxPrecinctUseCase,
  ],
  exports: [
    CreatePrecinctUseCase,
    UpdatePrecinctUseCase,
    FindPrecinctsWithFiltersUseCase,
    SoftDeletePrecinctUseCase,
    RestoreDeletePrecinctUseCase,
    RetrieveComboboxPrecinctUseCase,
  ],
})
export class PrecinctModule {}
