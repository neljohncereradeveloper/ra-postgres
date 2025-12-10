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
export class ArchiveElectionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(id: number, user_name: string) {
    return this.transactionHelper.executeTransaction(
      ELECTION_ACTIONS.ARCHIVE,
      async (manager) => {
        // retrieve the election
        const election = await this.electionRepository.findById(id, manager);
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${id} not found or already deleted.`,
          );
        }

        // Use domain method to archive (soft delete)
        election.archive(user_name);

        console.log('election: ', election);

        // update the election in the database
        const success = await this.electionRepository.update(
          id,
          election,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException(
            `Failed to delete election with ID ${id}.`,
          );
        }

        // Log the archive
        const log = ActivityLog.create({
          action: ELECTION_ACTIONS.ARCHIVE,
          entity: DATABASE_CONSTANTS.MODELNAME_ELECTION,
          details: JSON.stringify({
            id,
            name: election.name,
            desc1: election.desc1,
            address: election.address,
            date: getPHDateTime(election.date),
            explanation: `Election with ID : ${id} archived by USER : ${user_name}`,
            archived_by: user_name,
            archived_at: getPHDateTime(election.deleted_at),
          }),
          user_name: user_name,
        });

        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
