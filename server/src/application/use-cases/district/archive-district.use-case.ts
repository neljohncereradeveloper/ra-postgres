import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { SomethinWentWrongException } from '@domains/exceptions/index';
import { DISTRICT_ACTIONS } from '@domain/constants/district/district-actions.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class ArchiveDistrictUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.DISTRICT)
    private readonly districtRepository: DistrictRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(id: number, user_name: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      DISTRICT_ACTIONS.ARCHIVE,
      async (manager) => {
        // retrieve the active election
        const active_election =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!active_election) {
          throw new NotFoundException('No Active election');
        }

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

        // Retrieve the district
        const district = await this.districtRepository.findById(id, manager);
        if (!district) {
          throw new NotFoundException(`District with ID ${id} not found.`);
        }

        // Use domain method to archive (soft delete)
        district.archive(user_name);

        // Save the updated district
        const success = await this.districtRepository.update(
          id,
          district,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException(`District archive failed`);
        }

        // Log the archive
        const log = ActivityLog.create({
          action: DISTRICT_ACTIONS.ARCHIVE,
          entity: DATABASE_CONSTANTS.MODELNAME_PRECINCT,
          details: JSON.stringify({
            id,
            desc1: district.desc1,
            explanation: `District with ID : ${id} archived by USER : ${user_name}`,
            archived_by: user_name,
            archived_at: getPHDateTime(district.deleted_at),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
