import { UpdateApplicationAccessCommand } from '@application/commands/application-access/update-application-access.command';
import { ActivityLog } from '@domain/models/activitylog.model';
import { ApplicationAccess } from '@domain/models/application-access.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';
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
    userId: number,
  ): Promise<ApplicationAccess> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.UPDATE_APPLICATIONACCESS,
      async (manager) => {
        // validate applicationAccess existence
        const applicationAccessResult =
          await this.applicationAccessRepository.findByIdWithManager(
            id,
            manager,
          );
        if (!applicationAccessResult) {
          throw new NotFoundException('ApplicationAccess not found');
        }

        // Update the applicationAccess
        const applicationAccess = new ApplicationAccess({ desc1: dto.desc1 });
        const updateSuccessfull =
          await this.applicationAccessRepository.updateWithManager(
            id,
            applicationAccess,
            manager,
          );

        if (!updateSuccessfull) {
          throw new InternalServerErrorException(
            'ApplicationAccess update failed',
          );
        }

        const updateResult =
          await this.applicationAccessRepository.findByIdWithManager(
            id,
            manager,
          );
        // Log the creation
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.UPDATE_APPLICATIONACCESS,
          DATABASE_CONSTANTS.MODELNAME_APPLICATIONACCESS,
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
