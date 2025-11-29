import { Module } from '@nestjs/common';
import { ActiveElectionController } from './controller/active-election.controller';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActivityLogRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@infrastructure/database/typeorm-mysql/adapters/transaction-helper.adapter';
import { ActiveElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/active-election.repository.impl';
import { ElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/election.repository.impl';
import { SetActiveElectionUseCase } from '@application/use-cases/active-election/set-active-election.use-case';
import { RetrieveActiveElectionUseCase } from '@application/use-cases/active-election/retrieve-active-election.use-case';
import { ResetActiveElectionUseCase } from '@application/use-cases/active-election/reset-active-election.use-case';

@Module({
  imports: [MysqlDatabaseModule],
  controllers: [ActiveElectionController],
  providers: [
    {
      provide: REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    { provide: REPOSITORY_TOKENS.ELECTION, useClass: ElectionRepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.ACTIVE_ELECTION,
      useClass: ActiveElectionRepositoryImpl,
    },
    {
      provide: REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    },
    SetActiveElectionUseCase,
    RetrieveActiveElectionUseCase,
    ResetActiveElectionUseCase,
  ],
  exports: [
    SetActiveElectionUseCase,
    RetrieveActiveElectionUseCase,
    ResetActiveElectionUseCase,
  ],
})
export class ActiveElectionModule {}

