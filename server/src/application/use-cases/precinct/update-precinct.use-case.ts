import { ActivityLog } from '@domain/models/activitylog,model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@domains/exceptions/shared/something-wentwrong.exception copy';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PrecinctRepository } from '@domains/repositories/precinct.repository';
import { UpdatePrecinctCommand } from '@application/commands/precinct/update-precinct.command';
import { Precinct } from '@domain/models/precinct.model';

@Injectable()
export class UpdatePrecinctUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.PRECINCT)
    private readonly precinctRepository: PrecinctRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdatePrecinctCommand,
    userId: number,
  ): Promise<Precinct> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.UPDATE_PRECINCT,
      async (manager) => {
        // validate precinct existence
        const precinctResult = await this.precinctRepository.findById(
          id,
          manager,
        );
        if (!precinctResult) {
          throw new NotFoundException('Precinct not found');
        }

        // Update the precinct
        const precinct = new Precinct({
          desc1: dto.desc1,
        });
        const updateSuccessfull = await this.precinctRepository.update(
          id,
          precinct,
          manager,
        );

        if (!updateSuccessfull) {
          throw new SomethinWentWrongException('Precinct update failed');
        }

        const updateResult = await this.precinctRepository.findById(
          id,
          manager,
        );
        // Log the creation
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.UPDATE_PRECINCT,
          DATABASE_CONSTANTS.MODELNAME_PRECINCT,
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
