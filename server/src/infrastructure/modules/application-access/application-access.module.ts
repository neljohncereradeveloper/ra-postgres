import { Module } from '@nestjs/common';
import { ApplicationAccessController } from './controller/application-access.controller';
import { CreateApplicationAccessUseCase } from '@application/use-cases/application-access/create-application-access.use-case';
import { UpdateApplicationAccessUseCase } from '@application/use-cases/application-access/update-application-access.use-case';
import { FindApplicationAccesssWithFiltersUseCase } from '@application/use-cases/application-access/find-with-filters-application-access.use-case';
import { SoftDeleteApplicationAccessUseCase } from '@application/use-cases/application-access/soft-delete-application-access.use-case';
import { RestoreDeleteApplicationAccessUseCase } from '@application/use-cases/application-access/restore-delete-application-access.use-case';
import { RetrieveComboboxApplicationAccessUseCase } from '@application/use-cases/application-access/retrieve-combobox-application-access.use-case';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionAdapter } from '@infrastructure/database/typeorm-mysql/adapters/transaction-helper.adapter';
import { ApplicationAccessRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/application-access.repository.impl';
import { ActivityLogRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/activity-log.repository.impl';

@Module({
  imports: [MysqlDatabaseModule],
  controllers: [ApplicationAccessController],
  providers: [
    // Directly provide TransactionHelper here
    {
      provide: REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: REPOSITORY_TOKENS.APPLICATIONACCESS,
      useClass: ApplicationAccessRepositoryImpl,
    },
    {
      provide: REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    CreateApplicationAccessUseCase,
    UpdateApplicationAccessUseCase,
    FindApplicationAccesssWithFiltersUseCase,
    SoftDeleteApplicationAccessUseCase,
    RestoreDeleteApplicationAccessUseCase,
    RetrieveComboboxApplicationAccessUseCase,
  ],
  exports: [
    CreateApplicationAccessUseCase,
    UpdateApplicationAccessUseCase,
    FindApplicationAccesssWithFiltersUseCase,
    SoftDeleteApplicationAccessUseCase,
    RestoreDeleteApplicationAccessUseCase,
    RetrieveComboboxApplicationAccessUseCase,
  ],
})
export class ApplicationAccessModule {}
