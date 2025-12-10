import { UpdateApplicationAccessCommand } from '@application/commands/application-access/update-application-access.command';
import { APPLICATION_ACCESS_ACTIONS } from '@domain/constants/application-access/application-access-actions.constants';
import { ActivityLog } from '@domain/models/activitylog.model';
import { ApplicationAccess } from '@domain/models/application-access.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@domains/exceptions/index';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class UpdateApplicationAccessUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.APPLICATIONACCESS)
    private readonly applicationAccessRepository: ApplicationAccessRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateApplicationAccessCommand,
    username: string,
  ): Promise<ApplicationAccess> {
    return this.transactionHelper.executeTransaction(
      APPLICATION_ACCESS_ACTIONS.UPDATE,
      async (manager) => {
        // validate applicationAccess existence
        const applicationAccess =
          await this.applicationAccessRepository.findById(id, manager);
        if (!applicationAccess) {
          throw new NotFoundException('ApplicationAccess not found');
        }

        // Update the applicationAccess
        applicationAccess.update({ desc1: dto.desc1, updatedby: username });

        // save the updated application access
        const success = await this.applicationAccessRepository.update(
          id,
          applicationAccess,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException(
            `ApplicationAccess update failed`,
          );
        }

        const updateResult = await this.applicationAccessRepository.findById(
          id,
          manager,
        );

        // Log the update
        const log = ActivityLog.create({
          action: APPLICATION_ACCESS_ACTIONS.UPDATE,
          entity: DATABASE_CONSTANTS.MODELNAME_APPLICATIONACCESS,
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
