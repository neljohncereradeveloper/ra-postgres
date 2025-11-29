import { Module } from '@nestjs/common';
import { DistrictController } from './controller/district.controller';
import { CreateDistrictUseCase } from '@application/use-cases/district/create-district.use-case';
import { UpdateDistrictUseCase } from '@application/use-cases/district/update-district.use-case';
import { FindDistrictsWithFiltersUseCase } from '@application/use-cases/district/find-with-filters-district.use-case';
import { SoftDeleteDistrictUseCase } from '@application/use-cases/district/soft-delete-district.use-case';
import { RestoreDeleteDistrictUseCase } from '@application/use-cases/district/restore-delete-district.use-case';
import { RetrieveComboboxDistrictUseCase } from '@application/use-cases/district/retrieve-combobox-district.use-case';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { DistrictRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/district.repository.impl';
import { ActivityLogRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@infrastructure/database/typeorm-mysql/adapters/transaction-helper.adapter';
import { ActiveElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/active-election.repository.impl';
import { ElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/election.repository.impl';

@Module({
  imports: [MysqlDatabaseModule],
  controllers: [DistrictController],
  providers: [
    // Directly provide TransactionHelper here
    {
      provide: REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    { provide: REPOSITORY_TOKENS.DISTRICT, useClass: DistrictRepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.ACTIVE_ELECTION,
      useClass: ActiveElectionRepositoryImpl,
    },
    { provide: REPOSITORY_TOKENS.ELECTION, useClass: ElectionRepositoryImpl },

    {
      provide: REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    CreateDistrictUseCase,
    UpdateDistrictUseCase,
    FindDistrictsWithFiltersUseCase,
    SoftDeleteDistrictUseCase,
    RestoreDeleteDistrictUseCase,
    RetrieveComboboxDistrictUseCase,
  ],
  exports: [
    CreateDistrictUseCase,
    UpdateDistrictUseCase,
    FindDistrictsWithFiltersUseCase,
    SoftDeleteDistrictUseCase,
    RestoreDeleteDistrictUseCase,
    RetrieveComboboxDistrictUseCase,
  ],
})
export class DistrictModule {}
