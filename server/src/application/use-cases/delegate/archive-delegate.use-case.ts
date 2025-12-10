import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { SomethinWentWrongException } from '@domains/exceptions/index';
import { DELEGATE_ACTIONS } from '@domain/constants/delegate/delegate-actions.constants';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class ArchiveDelegateUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.DELEGATE)
    private readonly delegateRepository: DelegateRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(id: number, userName: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      DELEGATE_ACTIONS.ARCHIVE,
      async (manager) => {
        // retrieve the active election
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new NotFoundException('No Active election');
        }

        // retrieve the election
        const election = await this.electionRepository.findById(
          activeElection.electionid,
          manager,
        );
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${activeElection.electionid} not found.`,
          );
        }
        // Use domain model method to validate if election is scheduled
        election.validateForUpdate();

        // Retrieve the delegate
        const delegate = await this.delegateRepository.findById(id, manager);
        if (!delegate) {
          throw new NotFoundException(`Delegate with ID ${id} not found.`);
        }

        // Use domain method to archive (soft delete)
        delegate.archive(userName);

        // Save the updated delegate
        const success = await this.delegateRepository.update(
          id,
          delegate,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException(`Delegate archive failed`);
        }

        // Log the archive
        const log = ActivityLog.create({
          action: DELEGATE_ACTIONS.ARCHIVE,
          entity: DATABASE_CONSTANTS.MODELNAME_DELEGATE,
          details: JSON.stringify({
            id,
            controlNumber: delegate.controlnumber,
            explanation: `Delegate with ID : ${id} archived by USER : ${userName}`,
            archivedBy: userName,
            archivedAt: getPHDateTime(delegate.deletedat),
          }),
          username: userName,
        });
        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
