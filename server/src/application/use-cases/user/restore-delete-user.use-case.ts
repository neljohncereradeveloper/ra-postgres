import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { UserRepository } from '@domains/repositories/user.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
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

  async execute(id: number, userId: number): Promise<void> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.RESTORE_DELETE_USER,
      async (manager) => {
        const success = await this.userRepository.restoreWithManager(
          id,
          manager,
        );
        if (!success) {
          throw new NotFoundException(
            `User with ID ${id} not found or already restored.`,
          );
        }

        // Log the creation
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.RESTORE_DELETE_USER,
          DATABASE_CONSTANTS.MODELNAME_USER,
          JSON.stringify({
            id,
            explaination: `User with ID ${id} restored`,
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
