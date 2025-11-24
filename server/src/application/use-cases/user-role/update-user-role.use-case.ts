import { UpdateUserRoleCommand } from '@application/commands/user-role/update-user-role.command';
import { ActivityLog } from '@domain/models/activitylog,model';
import { UserRole } from '@domain/models/user-role.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { UserRoleRepository } from '@domains/repositories/user-role.repository';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
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
    userId: number,
  ): Promise<UserRole> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.UPDATE_USERROLE,
      async (manager) => {
        // validate userRole existence
        const userRoleResult =
          await this.userRoleRepository.findByIdWithManager(id, manager);
        if (!userRoleResult) {
          throw new NotFoundException('UserRole not found');
        }

        // Update the userRole
        const userRole = new UserRole({ desc1: dto.desc1 });
        const updateSuccessfull =
          await this.userRoleRepository.updateWithManager(
            id,
            userRole,
            manager,
          );

        if (!updateSuccessfull) {
          throw new InternalServerErrorException('UserRole update failed');
        }

        const updateResult = await this.userRoleRepository.findByIdWithManager(
          id,
          manager,
        );
        // Log the creation
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.UPDATE_USERROLE,
          DATABASE_CONSTANTS.MODELNAME_USERROLE,
          JSON.stringify({
            id: updateResult.id,
            desc1: updateResult.desc1,
          }),
          new Date(),
          userId,
        );
        // insert log
        await this.activityLogRepository.create(log, manager);

        return updateResult;
      },
    );
  }
}
