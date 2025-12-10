import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { CreateUserUseCase } from '@application/use-cases/user/create-user.use-case';
import { UpdateUserUseCase } from '@application/use-cases/user/update-user.use-case';
import { PaginatedUserListUseCase } from '@application/use-cases/user/paginated-user-list.use-case';
import { ArchiveUserUseCase } from '@application/use-cases/user/archive-user.use-case';
import { RestoreUserUseCase } from '@application/use-cases/user/restore-user.use-case';
import { BcryptPasswordEncryptionAdapter } from '@infrastructure/modules/user/adapters/password-encryption.adapter';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionAdapter } from '@infrastructure/database/typeorm-mysql/adapters/transaction-helper.adapter';
import { UserRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/user.repository.impl';
import { UserRoleRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/user-role.repository.impl';
import { ApplicationAccessRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/application-access.repository.impl';
import { ActivityLogRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/activity-log.repository.impl';
import { PrecinctRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/precinct.repository.impl';
import { ElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/election.repository.impl';
import { ActiveElectionRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/active-election.repository.impl';

@Module({
  imports: [MysqlDatabaseModule],
  controllers: [UserController],
  providers: [
    // Directly provide TransactionHelper here
    {
      provide: REPOSITORY_TOKENS.PASSWORDENCRYPTIONPORT,
      useClass: BcryptPasswordEncryptionAdapter,
    },
    {
      provide: REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    { provide: REPOSITORY_TOKENS.USER, useClass: UserRepositoryImpl },
    { provide: REPOSITORY_TOKENS.USERROLE, useClass: UserRoleRepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.APPLICATIONACCESS,
      useClass: ApplicationAccessRepositoryImpl,
    },
    {
      provide: REPOSITORY_TOKENS.ELECTION,
      useClass: ElectionRepositoryImpl,
    },
    {
      provide: REPOSITORY_TOKENS.ACTIVE_ELECTION,
      useClass: ActiveElectionRepositoryImpl,
    },
    {
      provide: REPOSITORY_TOKENS.PRECINCT,
      useClass: PrecinctRepositoryImpl,
    },
    {
      provide: REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    CreateUserUseCase,
    UpdateUserUseCase,
    PaginatedUserListUseCase,
    ArchiveUserUseCase,
    RestoreUserUseCase,
  ],
  exports: [
    CreateUserUseCase,
    UpdateUserUseCase,
    PaginatedUserListUseCase,
    ArchiveUserUseCase,
    RestoreUserUseCase,
  ],
})
export class UserModule {}
