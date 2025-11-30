import { CreateApplicationAccessCommand } from '@application/commands/application-access/create-application-access.command';
import { ActivityLog } from '@domain/models/activitylog.model';
import { ApplicationAccess } from '@domain/models/application-access.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

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
    userId: number,
  ): Promise<ApplicationAccess> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.CREATE_APPLICATIONACCESS,
      async (manager) => {
        // Create the applicationAccess
        const applicationAccess = new ApplicationAccess({ desc1: dto.desc1 });
        const createdApplicationAccess =
          await this.applicationAccessRepository.createWithManager(
            applicationAccess,
            manager,
          );

        // Log the creation
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.CREATE_APPLICATIONACCESS,
          DATABASE_CONSTANTS.MODELNAME_APPLICATIONACCESS,
          JSON.stringify({
            id: createdApplicationAccess.id,
            desc1: createdApplicationAccess.desc1,
          }),
          new Date(),
          userId, // USERI
        );

        await this.activityLogRepository.create(log, manager);

        return createdApplicationAccess;
      },
    );
  }
}
