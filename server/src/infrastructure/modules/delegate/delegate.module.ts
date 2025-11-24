import { Module } from '@nestjs/common';
import { DelegateController } from './controller/delegate.controller';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionAdapter } from '@infrastructure/database/typeorm-mysql/adapters/transaction-helper.adapter';
import { DelegateRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/delegate.repository.impl';
import { ActivityLogRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/activity-log.repository.impl';
import { UploadDelegatesFileUseCase } from '@application/use-cases/delegate/upload-delegates-file.use-case';
import { ExcelParserAdapter } from './adapters/excel-parser.adapter';
import { SettingsRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/setting.repository.impl';
import { ElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/election.repository.impl';
import { ElectionLockPolicy } from '@domain/policies/election/election-lock.policy';
import { FindWithPaginationUseCase } from '@application/use-cases/delegate/find-with-pagination.use-case';
import { FindWithControlNumberUseCase } from '@application/use-cases/delegate/find-with-controle-number.use-case';
import { UUIDGeneratorAdapter } from 'src/infrastructure/adapters/uuid-generator';
import { BallotRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/ballot.repository.impl';

@Module({
  imports: [MysqlDatabaseModule],
  controllers: [DelegateController],
  providers: [
    // Directly provide TransactionHelper here
    {
      provide: REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: REPOSITORY_TOKENS.EXCELPARSEPORT,
      useClass: ExcelParserAdapter,
    },
    { provide: REPOSITORY_TOKENS.DELEGATE, useClass: DelegateRepositoryImpl },
    { provide: REPOSITORY_TOKENS.ELECTION, useClass: ElectionRepositoryImpl },
    { provide: REPOSITORY_TOKENS.SETTING, useClass: SettingsRepositoryImpl },
    { provide: REPOSITORY_TOKENS.BALLOT, useClass: BallotRepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.UUIDGENERATORPORT,
      useClass: UUIDGeneratorAdapter,
    },
    {
      provide: REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    UploadDelegatesFileUseCase,
    ElectionLockPolicy,
    FindWithPaginationUseCase,
    FindWithControlNumberUseCase,
  ],
  exports: [
    UploadDelegatesFileUseCase,
    FindWithPaginationUseCase,
    FindWithControlNumberUseCase,
    ElectionLockPolicy,
  ],
})
export class DelegateModule {}
