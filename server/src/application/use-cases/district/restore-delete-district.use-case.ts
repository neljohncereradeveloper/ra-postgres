import { ActivityLog } from '@domain/models/activitylog.model';
import { District } from '@domain/models/district.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ElectionRepository } from '@domains/repositories/election.repository';

@Injectable()
export class RestoreDeleteDistrictUseCase {
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

  async execute(id: number, userId: number): Promise<void> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.RESTORE_DELETE_DISTRICT,
      async (manager) => {
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new BadRequestException('No Active election');
        }

        const election = await this.electionRepository.findById(
          activeElection.electionId,
          manager,
        );
        // Can only restore deleted district if election is scheduled
        election.validateForUpdate();

        // First try to restore using repository method to find deleted district
        // Then load and use domain method
        const restoreSuccess = await this.districtRepository.restoreDeleted(
          id,
          manager,
        );
        if (!restoreSuccess) {
          throw new NotFoundException(
            `District with ID ${id} not found or already restored.`,
          );
        }

        // Load the restored district and use domain method to ensure consistency
        const district = await this.districtRepository.findById(id, manager);
        if (!district) {
          // If still not found after restore, something went wrong
          throw new NotFoundException(
            `District with ID ${id} could not be restored.`,
          );
        }

        // Use domain method to restore (ensures deletedBy is cleared)
        district.restore();

        // Save the restored district
        await this.districtRepository.update(id, district, manager);

        // Log the creation
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.RESTORE_DELETE_DISTRICT,
          DATABASE_CONSTANTS.MODELNAME_DISTRICT,
          JSON.stringify({
            id,
            explaination: `District with ID ${id} restored`,
          }),
          new Date(),
          userId,
        );
        // insert log
        await this.activityLogRepository.create(log, manager);
      },
    );
  }
}
