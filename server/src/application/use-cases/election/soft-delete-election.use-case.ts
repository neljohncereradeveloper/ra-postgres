import { ActivityLog } from '@domain/models/activitylog.model';
import { Election } from '@domain/models/election.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class SoftDeleteElectionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(id: number, userId: number) {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.SOFT_DELETE_ELECTION,
      async (manager) => {
        // Load election and use domain method to archive
        const election = await this.electionRepository.findById(id, manager);
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${id} not found or already deleted.`,
          );
        }

        // Use domain method to archive (soft delete)
        election.archive(userId.toString());

        // Save the updated election
        const success = await this.electionRepository.update(
          id,
          election,
          manager,
        );
        if (!success) {
          throw new NotFoundException(
            `Failed to delete election with ID ${id}.`,
          );
        }

        const activityLog = new ActivityLog(
          LOG_ACTION_CONSTANTS.SOFT_DELETE_ELECTION,
          DATABASE_CONSTANTS.MODELNAME_ELECTION,
          JSON.stringify({
            id,
            explaination: `Election with ID ${id} deleted`,
          }),
          new Date(),
          userId,
        );
        await this.activityLogRepository.create(activityLog, manager);

        return {
          success: true,
          message: `Election with ID ${id} deleted successfully.`,
        };
      },
    );
  }
}
