import { CreateUserRoleCommand } from '@application/commands/user-role/create-user-role.command';
import { USER_ROLE_ACTIONS } from '@domain/constants/user-role/user-role-actions.constants';
import { ActivityLog } from '@domain/models/activitylog.model';
import { UserRole } from '@domain/models/user-role.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { UserRoleRepository } from '@domains/repositories/user-role.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { SomethinWentWrongException } from '@domains/exceptions/index';

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

  async execute(
    dto: CreateUserRoleCommand,
    user_name: string,
  ): Promise<UserRole> {
    return this.transactionHelper.executeTransaction(
      USER_ROLE_ACTIONS.CREATE,
      async (manager) => {
        // Create the userRole
        const user_role = UserRole.create({
          desc1: dto.desc1,
          created_by: user_name,
        });
        const created_user_role = await this.userRoleRepository.create(
          user_role,
          manager,
        );

        if (!created_user_role) {
          throw new SomethinWentWrongException('User role creation failed');
        }

        // Log the creation
        const log = ActivityLog.create({
          action: USER_ROLE_ACTIONS.CREATE,
          entity: DATABASE_CONSTANTS.MODELNAME_USERROLE,
          details: JSON.stringify({
            id: created_user_role.id,
            desc1: created_user_role.desc1,
            created_by: user_name,
            created_at: getPHDateTime(created_user_role.created_at),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        return created_user_role;
      },
    );
  }
}
