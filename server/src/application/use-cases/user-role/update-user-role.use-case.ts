import { UpdateUserRoleCommand } from '@application/commands/user-role/update-user-role.command';
import { USER_ROLE_ACTIONS } from '@domain/constants/user-role/user-role-actions.constants';
import { ActivityLog } from '@domain/models/activitylog.model';
import { UserRole } from '@domain/models/user-role.model';
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
export class UpdateUserRoleUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.USERROLE)
    private readonly userRoleRepository: UserRoleRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateUserRoleCommand,
    username: string,
  ): Promise<UserRole> {
    return this.transactionHelper.executeTransaction(
      USER_ROLE_ACTIONS.UPDATE,
      async (manager) => {
        // validate applicationAccess existence
        const userRole = await this.userRoleRepository.findById(id, manager);
        if (!userRole) {
          throw new NotFoundException(`UserRole with ID ${id} not found.`);
        }

        // Update the userRole
        userRole.update({ desc1: dto.desc1, updatedby: username });

        // save the updated user role
        const success = await this.userRoleRepository.update(
          id,
          userRole,
          manager,
        );

        if (!success) {
          throw new SomethinWentWrongException(`UserRole update failed`);
        }

        const updateResult = await this.userRoleRepository.findById(
          id,
          manager,
        );

        // Log the update
        const log = ActivityLog.create({
          action: USER_ROLE_ACTIONS.UPDATE,
          entity: DATABASE_CONSTANTS.MODELNAME_USERROLE,
          details: JSON.stringify({
            id: updateResult.id,
            desc1: updateResult.desc1,
            updatedBy: username,
            updatedAt: getPHDateTime(updateResult.updatedat),
          }),
          username: username,
        });
        await this.activityLogRepository.create(log, manager);

        return updateResult;
      },
    );
  }
}
