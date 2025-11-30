import { Module } from '@nestjs/common';
import { PositionController } from './controller/position.controller';
import { CreatePositionUseCase } from '@application/use-cases/position/create-position.use-case';
import { UpdatePositionUseCase } from '@application/use-cases/position/update-position.use-case';
import { PaginatedPositionsListUseCase } from '@application/use-cases/position/paginated-position-list.use-case';
import { RestorePositionUseCase } from '@application/use-cases/position/restore-position.use-case';
import { ComboboxPositionUseCase } from '@application/use-cases/position/combobox-position.use-case';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActivityLogRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@infrastructure/database/typeorm-mysql/adapters/transaction-helper.adapter';
import { PositionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/position.repository.impl';
import { ArchivePositionUseCase } from '@application/use-cases/position/archive-position.use-case';
import { ActiveElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/active-election.repository.impl';
import { ElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/election.repository.impl';

@Module({
  imports: [MysqlDatabaseModule],
  controllers: [PositionController],
  providers: [
    // Directly provide TransactionHelper here
    {
      provide: REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    { provide: REPOSITORY_TOKENS.POSITION, useClass: PositionRepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.ACTIVE_ELECTION,
      useClass: ActiveElectionRepositoryImpl,
    },
    { provide: REPOSITORY_TOKENS.ELECTION, useClass: ElectionRepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    CreatePositionUseCase,
    UpdatePositionUseCase,
    PaginatedPositionsListUseCase,
    ArchivePositionUseCase,
    RestorePositionUseCase,
    ComboboxPositionUseCase,
  ],
  exports: [
    CreatePositionUseCase,
    UpdatePositionUseCase,
    PaginatedPositionsListUseCase,
    ArchivePositionUseCase,
    RestorePositionUseCase,
    ComboboxPositionUseCase,
  ],
})
export class PositionModule {}
