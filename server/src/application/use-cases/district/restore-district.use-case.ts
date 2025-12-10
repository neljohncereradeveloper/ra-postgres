import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { DISTRICT_ACTIONS } from '@domain/constants/district/district-actions.constants';
import { SomethinWentWrongException } from '@domains/exceptions/index';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class RestoreDistrictUseCase {
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

  async execute(id: number, userName: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      DISTRICT_ACTIONS.RESTORE,
      async (manager) => {
        // retrieve the active election
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new NotFoundException('No active election');
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

        // Retrieve the district
        const district = await this.districtRepository.findById(id, manager);
        if (!district) {
          throw new NotFoundException(`District with ID ${id} not found.`);
        }

        // Use domain method to restore (ensures deletedBy is cleared)
        district.restore();

        // Save the restored district
        const success = await this.districtRepository.update(
          id,
          district,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException(`District restore failed`);
        }

        // Log the restore
        const log = ActivityLog.create({
          action: DISTRICT_ACTIONS.RESTORE,
          entity: DATABASE_CONSTANTS.MODELNAME_DISTRICT,
          details: JSON.stringify({
            id,
            desc1: district.desc1,
            explanation: `District with ID : ${id} restored by USER : ${userName}`,
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
