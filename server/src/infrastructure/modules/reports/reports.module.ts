import { Module } from '@nestjs/common';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActivityLogRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@infrastructure/database/typeorm-mysql/adapters/transaction-helper.adapter';
import { SettingsRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/setting.repository.impl';
import { ReportsController } from './controller/reports.controller';
import { ReportsRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/reports.repository.impl';
import { CastVoteReportUseCase } from '@application/use-cases/reports/cast-votes-report.use-case';
import { CandidatesReportUseCase } from '@application/use-cases/reports/candidates-report.use-case';
import { ElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/election.repository.impl';

@Module({
  imports: [MysqlDatabaseModule],
  controllers: [ReportsController],
  providers: [
    // Directly provide TransactionHelper here
    {
      provide: REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    { provide: REPOSITORY_TOKENS.REPORTS, useClass: ReportsRepositoryImpl },
    { provide: REPOSITORY_TOKENS.SETTING, useClass: SettingsRepositoryImpl },
    { provide: REPOSITORY_TOKENS.ELECTION, useClass: ElectionRepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    CastVoteReportUseCase,
    CandidatesReportUseCase,
  ],
  exports: [CastVoteReportUseCase, CandidatesReportUseCase],
})
export class ReportsModule {}
