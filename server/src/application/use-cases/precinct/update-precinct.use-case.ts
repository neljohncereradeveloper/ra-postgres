import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@domains/exceptions/shared/something-wentwrong.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PrecinctRepository } from '@domains/repositories/precinct.repository';
import { UpdatePrecinctCommand } from '@application/commands/precinct/update-precinct.command';
import { Precinct } from '@domain/models/precinct.model';
import { PRECINCT_ACTIONS } from '@domain/constants/index';

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
    userName: string,
  ): Promise<Precinct> {
    return this.transactionHelper.executeTransaction(
      PRECINCT_ACTIONS.UPDATE,
      async (manager) => {
        // validate precinct existence
        const precinct = await this.precinctRepository.findById(id, manager);
        if (!precinct) {
          throw new NotFoundException('Precinct not found');
        }

        // use domain model method to update (encapsulates business logic and validation)
        precinct.update({ desc1: dto.desc1, updatedBy: userName });

        // Update the precinct in the database
        const updateSuccessfull = await this.precinctRepository.update(
          id,
          precinct,
          manager,
        );
        if (!updateSuccessfull) {
          throw new SomethinWentWrongException('Precinct update failed.');
        }

        // retrieve the updated precinct
        const updateResult = await this.precinctRepository.findById(
          id,
          manager,
        );

        // Log the update
        const log = ActivityLog.create({
          action: PRECINCT_ACTIONS.UPDATE,
          entity: DATABASE_CONSTANTS.MODELNAME_PRECINCT,
          details: JSON.stringify({
            id: updateResult.id,
            desc1: updateResult.desc1,
            updatedBy: userName,
            updatedAt: updateResult.updatedAt,
          }),
          username: userName,
        });
        await this.activityLogRepository.create(log, manager);

        return updateResult;
      },
    );
  }
}
