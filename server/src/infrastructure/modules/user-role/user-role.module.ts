import { Module } from '@nestjs/common';
import { UserRoleController } from './controller/user-role.controller';
import { CreateUserRoleUseCase } from '@application/use-cases/user-role/create-user-role.use-case';
import { UpdateUserRoleUseCase } from '@application/use-cases/user-role/update-user-role.use-case';
import { FindUserRolesWithFiltersUseCase } from '@application/use-cases/user-role/find-with-filters-user-role.use-case';
import { SoftDeleteUserRoleUseCase } from '@application/use-cases/user-role/soft-delete-user-role.use-case';
import { RestoreDeleteUserRoleUseCase } from '@application/use-cases/user-role/restore-delete-user-role.use-case';
import { RetrieveComboboxUserRoleUseCase } from '@application/use-cases/user-role/retrieve-combobox-user-role.use-case';
import { CheckExistUserRoleUseCase } from '@application/use-cases/user-role/check-exist-user-role.use-case';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionAdapter } from '@infrastructure/database/typeorm-mysql/adapters/transaction-helper.adapter';
import { UserRoleRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/user-role.repository.impl';
import { ActivityLogRepositoryImpl } from '@infrastructure/database/typeorm-mysql/repositories/activity-log.repository.impl';

@Module({
  imports: [MysqlDatabaseModule],
  controllers: [UserRoleController],
  providers: [
    // Directly provide TransactionHelper here
    {
      provide: REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    { provide: REPOSITORY_TOKENS.USERROLE, useClass: UserRoleRepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    CreateUserRoleUseCase,
    UpdateUserRoleUseCase,
    FindUserRolesWithFiltersUseCase,
    SoftDeleteUserRoleUseCase,
    RestoreDeleteUserRoleUseCase,
    RetrieveComboboxUserRoleUseCase,
    CheckExistUserRoleUseCase,
  ],
  exports: [
    CreateUserRoleUseCase,
    UpdateUserRoleUseCase,
    FindUserRolesWithFiltersUseCase,
    SoftDeleteUserRoleUseCase,
    RestoreDeleteUserRoleUseCase,
    RetrieveComboboxUserRoleUseCase,
    CheckExistUserRoleUseCase,
  ],
})
export class UserRoleModule {}
