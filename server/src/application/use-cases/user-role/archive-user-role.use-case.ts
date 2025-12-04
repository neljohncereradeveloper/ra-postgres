import { USER_ROLE_ACTIONS } from '@domain/constants/user-role/user-role-actions.constants';
import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@domains/exceptions/index';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { UserRoleRepository } from '@domains/repositories/user-role.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class ArchiveUserRoleUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.USERROLE)
    private readonly userRoleRepository: UserRoleRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(id: number, username: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      USER_ROLE_ACTIONS.ARCHIVE,
      async (manager) => {
        // retrieve the application access
        const userRole = await this.userRoleRepository.findById(id, manager);
        if (!userRole) {
          throw new NotFoundException(`UserRole with ID ${id} not found.`);
        }

        // use domain model method to archive (ensures deletedBy is cleared)
        userRole.archive(username);

        const success = await this.userRoleRepository.update(
          id,
          userRole,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException(`UserRole archive failed`);
        }
        // Log the restore
        const log = ActivityLog.create({
          action: USER_ROLE_ACTIONS.ARCHIVE,
          entity: DATABASE_CONSTANTS.MODELNAME_USERROLE,
          details: JSON.stringify({
            id,
            desc1: userRole.desc1,
            explanation: `UserRole with ID : ${id} archived by USER : ${username}`,
            archivedBy: username,
            archivedAt: getPHDateTime(userRole.deletedAt),
          }),
          username: username,
        });
        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
