import { ELECTION_ACTIONS } from '@domain/constants/index';
import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import { SomethinWentWrongException } from '@domains/exceptions/index';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RestoreElectionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(id: number, userName: string) {
    return this.transactionHelper.executeTransaction(
      ELECTION_ACTIONS.RESTORE,
      async (manager) => {
        // Load the restored election and use domain method to ensure consistency
        const election = await this.electionRepository.findById(id, manager);
        if (!election) {
          throw new NotFoundException(`Election with ID ${id} not found.`);
        }

        // Use domain method to restore (ensures deletedBy is cleared)
        election.restore();

        // Save the restored election
        const success = await this.electionRepository.update(
          id,
          election,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException(
            `Election with ID ${id} restore failed.`,
          );
        }

        // Log the restore
        const log = ActivityLog.create({
          action: ELECTION_ACTIONS.RESTORE,
          entity: DATABASE_CONSTANTS.MODELNAME_ELECTION,
          details: JSON.stringify({
            id,
            name: election.name,
            desc1: election.desc1,
            address: election.address,
            date: getPHDateTime(election.date),
            explanation: `Election with ID : ${id} restored by USER : ${userName}`,
            restoredBy: userName,
            restoredAt: getPHDateTime(),
          }),
          username: userName,
        });

        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
