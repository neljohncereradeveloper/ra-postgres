import { APPLICATION_ACCESS_ACTIONS } from '@domain/constants/application-access/application-access-actions.constants';
import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import { SomethinWentWrongException } from '@domains/exceptions/index';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RestoreApplicationAccessUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.APPLICATIONACCESS)
    private readonly applicationAccessRepository: ApplicationAccessRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(id: number, username: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      APPLICATION_ACCESS_ACTIONS.RESTORE,
      async (manager) => {
        // retrieve the application access
        const applicationAccess =
          await this.applicationAccessRepository.findById(id, manager);
        if (!applicationAccess) {
          throw new NotFoundException(
            `ApplicationAccess with ID ${id} not found.`,
          );
        }

        // use domain model method to restore (ensures deletedBy is cleared)
        applicationAccess.restore();

        // save the restored application access
        const success = await this.applicationAccessRepository.update(
          id,
          applicationAccess,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException(
            `ApplicationAccess restore failed.`,
          );
        }

        // Log the restore
        const log = ActivityLog.create({
          action: APPLICATION_ACCESS_ACTIONS.RESTORE,
          entity: DATABASE_CONSTANTS.MODELNAME_APPLICATIONACCESS,
          details: JSON.stringify({
            id,
            desc1: applicationAccess.desc1,
            explanation: `ApplicationAccess with ID : ${id} restored by USER : ${username}`,
            restoredBy: username,
            restoredAt: getPHDateTime(),
          }),
          username: username,
        });
        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
