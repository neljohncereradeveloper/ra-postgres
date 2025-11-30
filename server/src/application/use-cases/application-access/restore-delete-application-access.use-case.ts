import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
@Injectable()
export class RestoreDeleteApplicationAccessUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.APPLICATIONACCESS)
    private readonly applicationAccessRepository: ApplicationAccessRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(id: number, userId: number): Promise<void> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.RESTORE_DELETE_APPLICATIONACCESS,
      async (manager) => {
        const success =
          await this.applicationAccessRepository.restoreWithManager(
            id,
            manager,
          );
        if (!success) {
          throw new NotFoundException(
            `ApplicationAccess with ID ${id} not found or already restored.`,
          );
        }

        // Log the creation
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.RESTORE_DELETE_APPLICATIONACCESS,
          DATABASE_CONSTANTS.MODELNAME_APPLICATIONACCESS,
          JSON.stringify({
            id,
            explaination: `ApplicationAccess with ID ${id} restored`,
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
