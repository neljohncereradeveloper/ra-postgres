import { CreateUserRoleCommand } from '@application/commands/user-role/create-user-role.command';
import { ActivityLog } from '@domain/models/activitylog,model';
import { UserRole } from '@domain/models/user-role.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { UserRoleRepository } from '@domains/repositories/user-role.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class CreateUserRoleUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.USERROLE)
    private readonly userRoleRepository: UserRoleRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(dto: CreateUserRoleCommand, userId: number): Promise<UserRole> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.CREATE_USERROLE,
      async (manager) => {
        // Create the userRole
        const userRole = new UserRole({ desc1: dto.desc1 });
        const createdUserRole = await this.userRoleRepository.createWithManager(
          userRole,
          manager,
        );

        // Log the creation
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.CREATE_USERROLE,
          DATABASE_CONSTANTS.MODELNAME_USERROLE,
          JSON.stringify({
            id: createdUserRole.id,
            desc1: createdUserRole.desc1,
          }),
          new Date(),
          userId, // USERI
        );

        await this.activityLogRepository.create(log, manager);

        return createdUserRole;
      },
    );
  }
}
