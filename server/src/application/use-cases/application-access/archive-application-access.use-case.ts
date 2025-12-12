import { APPLICATION_ACCESS_ACTIONS } from '@domain/constants/application-access/application-access-actions.constants';
import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { SomethinWentWrongException } from '@domains/exceptions/index';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';

@Injectable()
export class ArchiveApplicationAccessUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.APPLICATIONACCESS)
    private readonly applicationAccessRepository: ApplicationAccessRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(id: number, user_name: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      APPLICATION_ACCESS_ACTIONS.ARCHIVE,
      async (manager) => {
        // Get active election
        const active_election =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!active_election) {
          throw new NotFoundException('No Active election');
        }

        // retrieve the election
        const election = await this.electionRepository.findById(
          active_election.election_id,
          manager,
        );

        if (!election) {
          throw new NotFoundException(
            `Election with ID ${active_election.election_id} not found.`,
          );
        }
        // Use domain model method to validate if election is scheduled
        election.validateForUpdate();

        // retrieve the application access
        const application_access =
          await this.applicationAccessRepository.findById(id, manager);
        if (!application_access) {
          throw new NotFoundException(
            `ApplicationAccess with ID ${id} not found.`,
          );
        }

        // use domain model method to archive (ensures deletedBy is cleared)
        application_access.archive(user_name);

        // save the archived application access
        const success = await this.applicationAccessRepository.update(
          id,
          application_access,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException(
            `ApplicationAccess archive failed`,
          );
        }

        // Log the restore
        const log = ActivityLog.create({
          action: APPLICATION_ACCESS_ACTIONS.ARCHIVE,
          entity: DATABASE_CONSTANTS.MODELNAME_APPLICATIONACCESS,
          details: JSON.stringify({
            id,
            desc1: application_access.desc1,
            explanation: `ApplicationAccess with ID : ${id} archived by USER : ${user_name}`,
            archived_by: user_name,
            archived_at: getPHDateTime(application_access.deleted_at),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
