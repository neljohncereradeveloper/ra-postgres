import { USER_ROLE_ACTIONS } from '@domain/constants/user-role/user-role-actions.constants';
import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import { SomethinWentWrongException } from '@domains/exceptions/index';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { UserRoleRepository } from '@domains/repositories/user-role.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RestoreDeleteUserRoleUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.USERROLE)
    private readonly userRoleRepository: UserRoleRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(id: number, user_name: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      USER_ROLE_ACTIONS.RESTORE,
      async (manager) => {
        // retrieve the application access
        const user_role = await this.userRoleRepository.findById(id, manager);
        if (!user_role) {
          throw new NotFoundException(`UserRole with ID ${id} not found.`);
        }

        // use domain model method to restore (ensures deletedBy is cleared)
        user_role.restore();

        const success = await this.userRoleRepository.update(
          id,
          user_role,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException(`UserRole restore failed`);
        }

        // Log the restore
        const log = ActivityLog.create({
          action: USER_ROLE_ACTIONS.RESTORE,
          entity: DATABASE_CONSTANTS.MODELNAME_USERROLE,
          details: JSON.stringify({
            id,
            desc1: user_role.desc1,
            explanation: `UserRole with ID : ${id} restored by USER : ${user_name}`,
            restored_by: user_name,
            restored_at: getPHDateTime(user_role.deleted_at || new Date()),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
