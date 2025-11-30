import { Module } from '@nestjs/common';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { DistrictRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/district.repository.impl';
import { TransactionAdapter } from '@infrastructure/database/typeorm-mysql/adapters/transaction-helper.adapter';
import { ActivityLogRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/activity-log.repository.impl';
import { DelegateRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/delegate.repository.impl';
import { ActiveElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/active-election.repository.impl';
import { ElectionController } from './controller/election.controller';
import { ElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/election.repository.impl';
import { CreateElectionUseCase } from '@application/use-cases/election/create-election.use-case';
import { PaginatedElectionListUseCase } from '@application/use-cases/election/paginated-election-list.use-case';
import { ComboboxElectionUseCase } from '@application/use-cases/election/combobox-election.use-case';
import { UpdateElectionUseCase } from '@application/use-cases/election/update-election.use-case';
import { CloseElectionUseCase } from '@application/use-cases/election/close-election.use-case';
import { ArchiveElectionUseCase } from '@application/use-cases/election/archive-election.use-case';
import { CancelElectionUseCase } from '@application/use-cases/election/cancel-election.use-case';
import { StartElectionUseCase } from '@application/use-cases/election/start-election.use-case';
import { RestoreElectionUseCase } from '@application/use-cases/election/restore-election.use-case';
import { ComboboxScheduledElectionUseCase } from '@application/use-cases/election/combobox-scheduled-election.use-case';
import { PositionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/position.repository.impl';
import { CandidateRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/candidate.repository.impl';
import { BallotRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/ballot.repository.impl';

@Module({
  imports: [MysqlDatabaseModule],
  controllers: [ElectionController],
  providers: [
    // Directly provide TransactionHelper here
    {
      provide: REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    { provide: REPOSITORY_TOKENS.DISTRICT, useClass: DistrictRepositoryImpl },
    { provide: REPOSITORY_TOKENS.DELEGATE, useClass: DelegateRepositoryImpl },
    { provide: REPOSITORY_TOKENS.ELECTION, useClass: ElectionRepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.ACTIVE_ELECTION,
      useClass: ActiveElectionRepositoryImpl,
    },
    { provide: REPOSITORY_TOKENS.POSITION, useClass: PositionRepositoryImpl },
    { provide: REPOSITORY_TOKENS.CANDIDATE, useClass: CandidateRepositoryImpl },
    { provide: REPOSITORY_TOKENS.BALLOT, useClass: BallotRepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    CreateElectionUseCase,
    UpdateElectionUseCase,
    PaginatedElectionListUseCase,
    ArchiveElectionUseCase,
    RestoreElectionUseCase,
    ComboboxElectionUseCase,
    CloseElectionUseCase,
    StartElectionUseCase,
    CancelElectionUseCase,
    ComboboxScheduledElectionUseCase,
  ],
  exports: [
    CreateElectionUseCase,
    UpdateElectionUseCase,
    PaginatedElectionListUseCase,
    ArchiveElectionUseCase,
    RestoreElectionUseCase,
    ComboboxElectionUseCase,
    CloseElectionUseCase,
    StartElectionUseCase,
    CancelElectionUseCase,
    ComboboxScheduledElectionUseCase,
  ],
})
export class ElectionModule {}
