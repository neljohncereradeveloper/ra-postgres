import { Module } from '@nestjs/common';
import { SettingController } from './controller/setting.controller';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActivityLogRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@infrastructure/database/typeorm-mysql/adapters/transaction-helper.adapter';
import { SettingsRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/setting.repository.impl';
import { ElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/election.repository.impl';
import { UpdateSettingUseCase } from '@application/use-cases/settings/update-setting.use-case';
import { RetrieveSettingUseCase } from '@application/use-cases/settings/retrieve-setting.use-case';
import { ResetElectionUseCase } from '@application/use-cases/settings/reset-election.use-case';

@Module({
  imports: [MysqlDatabaseModule],
  controllers: [SettingController],
  providers: [
    // Directly provide TransactionHelper here
    {
      provide: REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    { provide: REPOSITORY_TOKENS.ELECTION, useClass: ElectionRepositoryImpl },
    { provide: REPOSITORY_TOKENS.SETTING, useClass: SettingsRepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    UpdateSettingUseCase,
    RetrieveSettingUseCase,
    ResetElectionUseCase,
  ],
  exports: [UpdateSettingUseCase, RetrieveSettingUseCase, ResetElectionUseCase],
})
export class SettingModule {}
