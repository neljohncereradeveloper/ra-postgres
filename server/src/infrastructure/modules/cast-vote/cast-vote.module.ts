import { Module } from '@nestjs/common';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActivityLogRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@infrastructure/database/typeorm-mysql/adapters/transaction-helper.adapter';
import { ActiveElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/active-election.repository.impl';
import { CastVoteController } from './controller/cast-vote.controller';
import { CastVoteUseCase } from '@application/use-cases/cast-vote/cast-vote.use-case';
import { CastVoteRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/cast-vote.repository.impl';
import { DelegateRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/delegate.repository.impl';
import { CandidateRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/candidate.repository.impl';
import { BallotRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/ballot.repository.impl';
import { ElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/election.repository.impl';
import { PositionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/position.repository.impl';
import { ReprintCastVoteUseCase } from '@application/use-cases/cast-vote/reprint-case-vote.use-case';

@Module({
  imports: [MysqlDatabaseModule],
  controllers: [CastVoteController],
  providers: [
    // Directly provide TransactionHelper here
    {
      provide: REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    { provide: REPOSITORY_TOKENS.CAST_VOTE, useClass: CastVoteRepositoryImpl },
    { provide: REPOSITORY_TOKENS.DELEGATE, useClass: DelegateRepositoryImpl },
    { provide: REPOSITORY_TOKENS.BALLOT, useClass: BallotRepositoryImpl },
    { provide: REPOSITORY_TOKENS.CANDIDATE, useClass: CandidateRepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.ACTIVE_ELECTION,
      useClass: ActiveElectionRepositoryImpl,
    },
    { provide: REPOSITORY_TOKENS.ELECTION, useClass: ElectionRepositoryImpl },
    { provide: REPOSITORY_TOKENS.POSITION, useClass: PositionRepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    CastVoteUseCase,
    ReprintCastVoteUseCase,
  ],
  exports: [CastVoteUseCase, ReprintCastVoteUseCase],
})
export class CastVoteModule {}
