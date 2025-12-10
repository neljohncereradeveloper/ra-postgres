import { USER_ACTIONS } from '@domain/constants/user/user-actions.constants';
import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import { SomethinWentWrongException } from '@domains/exceptions/index';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { UserRepository } from '@domains/repositories/user.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RestoreDeleteUserUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(id: number, user_name: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      USER_ACTIONS.RESTORE,
      async (manager) => {
        // Retrieve the user
        const user = await this.userRepository.findById(id, manager);
        if (!user) {
          throw new NotFoundException(`User with ID ${id} not found.`);
        }

        // Use domain model method to restore (encapsulates business logic and validation)
        user.restore();

        // Update the user in the database
        const success = await this.userRepository.update(id, user, manager);
        if (!success) {
          throw new SomethinWentWrongException('User restore failed');
        }

        // Log the restore
        const log = ActivityLog.create({
          action: USER_ACTIONS.RESTORE,
          entity: DATABASE_CONSTANTS.MODELNAME_USER,
          details: JSON.stringify({
            id,
            user_name: user.user_name,
            explanation: `User with ID : ${id} restored by USER : ${user_name}`,
            restored_by: user_name,
            restored_at: getPHDateTime(user.deleted_at || new Date()),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
