import { ActivityLog } from '@domain/models/index';
import { TransactionPort } from '@domain/ports/index';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@domains/exceptions/index';
import {
  ActivityLogRepository,
  PrecinctRepository,
} from '@domains/repositories/index';
import { PRECINCT_ACTIONS } from '@domain/constants/index';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RestorePrecinctUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.PRECINCT)
    private readonly precinctRepository: PrecinctRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(id: number, userName: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      PRECINCT_ACTIONS.RESTORE,
      async (manager) => {
        // Find the precinct (including archived)
        const precinct = await this.precinctRepository.findById(id, manager);
        if (!precinct) {
          throw new NotFoundException(`Precinct with ID ${id} not found.`);
        }

        // Use domain model method to restore (encapsulates business logic)
        precinct.restore();

        // Update the precinct in the database
        const success = await this.precinctRepository.update(
          id,
          precinct,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException('Precinct restore failed');
        }

        // Log the restore
        const log = ActivityLog.create({
          action: PRECINCT_ACTIONS.RESTORE,
          entity: DATABASE_CONSTANTS.MODELNAME_PRECINCT,
          details: JSON.stringify({
            id,
            desc1: precinct.desc1,
            explanation: `Precinct with ID : ${id} restored by USER : ${userName}`,
            restoredBy: userName,
            restoredAt: new Date(),
          }),
          username: userName,
        });
        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
