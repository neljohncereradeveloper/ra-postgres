import { Module } from '@nestjs/common';
import { ApplicationAccessController } from './controller/application-access.controller';
import { CreateApplicationAccessUseCase } from '@application/use-cases/application-access/create-application-access.use-case';
import { UpdateApplicationAccessUseCase } from '@application/use-cases/application-access/update-application-access.use-case';
import { PaginatedApplicationAccessListUseCase } from '@application/use-cases/application-access/paginated-application-access-list.use-case';
import { ArchiveApplicationAccessUseCase } from '@application/use-cases/application-access/archive-application-access.use-case';
import { RestoreApplicationAccessUseCase } from '@application/use-cases/application-access/restore-application-access.use-case';
import { ComboboxApplicationAccessUseCase } from '@application/use-cases/application-access/combobox-application-access.use-case';
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
    PaginatedApplicationAccessListUseCase,
    ArchiveApplicationAccessUseCase,
    RestoreApplicationAccessUseCase,
    ComboboxApplicationAccessUseCase,
  ],
  exports: [
    CreateApplicationAccessUseCase,
    UpdateApplicationAccessUseCase,
    PaginatedApplicationAccessListUseCase,
    ArchiveApplicationAccessUseCase,
    RestoreApplicationAccessUseCase,
    ComboboxApplicationAccessUseCase,
  ],
})
export class ApplicationAccessModule {}
