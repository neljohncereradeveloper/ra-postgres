import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { UserRoleRepository } from '@domains/repositories/user-role.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class SoftDeleteUserRoleUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.USERROLE)
    private readonly userRoleRepository: UserRoleRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(id: number, userId: number): Promise<void> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.SOFT_DELETE_USERROLE,
      async (manager) => {
        const success = await this.userRoleRepository.softDeleteWithManager(
          id,
          manager,
        );
        if (!success) {
          // If the entity wasn't found, throw a 404 error
          throw new NotFoundException(
            `UserRole with ID ${id} not found or already deleted.`,
          );
        }

        // Log the creation
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.SOFT_DELETE_USERROLE,
          DATABASE_CONSTANTS.MODELNAME_USERROLE,
          JSON.stringify({
            id,
            explaination: `UserRole with ID ${id} deleted`,
          }),
          new Date(),
          userId,
        );
        // insert log
        await this.activityLogRepository.create(log, manager);
      },
    );
  }
}
