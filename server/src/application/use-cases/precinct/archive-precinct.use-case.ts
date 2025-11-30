import { Inject, Injectable } from '@nestjs/common';
import { PRECINCT_ACTIONS } from '@domain/constants/index';
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
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class ArchivePrecinctUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.PRECINCT)
    private readonly precinctRepository: PrecinctRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(id: number, userName: string): Promise<void> {
    return this.transactionHelper.executeTransaction(
      PRECINCT_ACTIONS.ARCHIVE,
      async (manager) => {
        // Retrieve the precinct
        const precinct = await this.precinctRepository.findById(id, manager);
        if (!precinct) {
          throw new NotFoundException(`Precinct with ID ${id} not found.`);
        }

        // Use domain model method to archive (encapsulates business logic and validation)
        precinct.archive(userName);

        // Update the precinct in the database
        const success = await this.precinctRepository.update(
          id,
          precinct,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException('Precinct archive failed');
        }

        // Log the archive
        const log = ActivityLog.create({
          action: PRECINCT_ACTIONS.ARCHIVE,
          entity: DATABASE_CONSTANTS.MODELNAME_PRECINCT,
          details: JSON.stringify({
            id,
            desc1: precinct.desc1,
            explanation: `Precinct with ID : ${id} archived by USER : ${userName}`,
            archivedBy: userName,
            archivedAt: precinct.deletedAt,
          }),
          username: userName,
        });
        await this.activityLogRepository.create(log, manager);
      },
    );
  }
}
