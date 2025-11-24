import { CreatePrecinctCommand } from '@application/commands/precinct/create-precinct.command';
import { ActivityLog } from '@domain/models/activitylog,model';
import { Precinct } from '@domain/models/precinct.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { PrecinctRepository } from '@domains/repositories/precinct.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class CreatePrecinctUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.PRECINCT)
    private readonly precinctRepository: PrecinctRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(dto: CreatePrecinctCommand, userId: number): Promise<Precinct> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.CREATE_PRECINCT,
      async (manager) => {
        const newPrecinct = new Precinct({
          desc1: dto.desc1,
        });
        const precinct = await this.precinctRepository.create(
          newPrecinct,
          manager,
        );

        const activityLog = new ActivityLog(
          LOG_ACTION_CONSTANTS.CREATE_PRECINCT,
          DATABASE_CONSTANTS.MODELNAME_PRECINCT,
          JSON.stringify({
            desc1: precinct.desc1,
          }),
          new Date(),
          userId,
        );
        await this.activityLogRepository.create(activityLog, manager);

        return precinct;
      },
    );
  }
}
