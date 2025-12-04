import { Module } from '@nestjs/common';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActivityLogRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@infrastructure/database/typeorm-mysql/adapters/transaction-helper.adapter';
import { PositionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/position.repository.impl';
import { ActiveElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/active-election.repository.impl';
import { CandidateController } from './controller/candidate.controller';
import { CandidateRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/candidate.repository.impl';
import { CreateCandidateUseCase } from '@application/use-cases/candidate/create-candidate.use-case';
import { UpdateCandidateUseCase } from '@application/use-cases/candidate/update-candidate.use-case';
import { PaginatedCandidateListUseCase } from '@application/use-cases/candidate/paginated-candidate-list.use-case';
import { ArchiveCandidateUseCase } from '@application/use-cases/candidate/archive-candidate.use-case';
import { RestoreCandidateUseCase } from '@application/use-cases/candidate/restore-candidate.use-case';
import { DistrictRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/district.repository.impl';
import { DelegateRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/delegate.repository.impl';
import { ElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/election.repository.impl';
import { GetElectionCandidatesUseCase } from '@application/use-cases/candidate/get-election-candidates';

@Module({
  imports: [MysqlDatabaseModule],
  controllers: [CandidateController],
  providers: [
    // Directly provide TransactionHelper here
    {
      provide: REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    { provide: REPOSITORY_TOKENS.POSITION, useClass: PositionRepositoryImpl },
    { provide: REPOSITORY_TOKENS.CANDIDATE, useClass: CandidateRepositoryImpl },
    { provide: REPOSITORY_TOKENS.DISTRICT, useClass: DistrictRepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.ACTIVE_ELECTION,
      useClass: ActiveElectionRepositoryImpl,
    },
    { provide: REPOSITORY_TOKENS.DELEGATE, useClass: DelegateRepositoryImpl },
    { provide: REPOSITORY_TOKENS.ELECTION, useClass: ElectionRepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    CreateCandidateUseCase,
    UpdateCandidateUseCase,
    PaginatedCandidateListUseCase,
    ArchiveCandidateUseCase,
    RestoreCandidateUseCase,
    GetElectionCandidatesUseCase,
  ],
  exports: [
    CreateCandidateUseCase,
    UpdateCandidateUseCase,
    PaginatedCandidateListUseCase,
    ArchiveCandidateUseCase,
    RestoreCandidateUseCase,
    GetElectionCandidatesUseCase,
  ],
})
export class CandidateModule {}
