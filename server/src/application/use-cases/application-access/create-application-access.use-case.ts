import { CreateApplicationAccessCommand } from '@application/commands/application-access/create-application-access.command';
import { APPLICATION_ACCESS_ACTIONS } from '@domain/constants/application-access/application-access-actions.constants';
import { ActivityLog } from '@domain/models/activitylog.model';
import { ApplicationAccess } from '@domain/models/application-access.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { SomethinWentWrongException } from '@domains/exceptions/index';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class CreateApplicationAccessUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.APPLICATIONACCESS)
    private readonly applicationAccessRepository: ApplicationAccessRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(
    dto: CreateApplicationAccessCommand,
    username: string,
  ): Promise<ApplicationAccess> {
    return this.transactionHelper.executeTransaction(
      APPLICATION_ACCESS_ACTIONS.CREATE,
      async (manager) => {
        // Create the applicationAccess
        const applicationAccess = ApplicationAccess.create({
          desc1: dto.desc1,
          createdby: username,
        });
        const createdApplicationAccess =
          await this.applicationAccessRepository.create(
            applicationAccess,
            manager,
          );

        if (!createdApplicationAccess) {
          throw new SomethinWentWrongException(
            'Application access creation failed',
          );
        }

        // Log the creation
        const log = ActivityLog.create({
          action: APPLICATION_ACCESS_ACTIONS.CREATE,
          entity: DATABASE_CONSTANTS.MODELNAME_APPLICATIONACCESS,
          details: JSON.stringify({
            id: createdApplicationAccess.id,
            desc1: createdApplicationAccess.desc1,
            createdBy: username,
            createdAt: getPHDateTime(createdApplicationAccess.createdat),
          }),
          username: username,
        });
        await this.activityLogRepository.create(log, manager);

        return createdApplicationAccess;
      },
    );
  }
}
