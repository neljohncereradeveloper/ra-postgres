import { UpdateDistrictCommand } from '@application/commands/district/update-district.command';
import { ActivityLog } from '@domain/models/activitylog.model';
import { District } from '@domain/models/district.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@domains/exceptions/shared/something-wentwrong.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ElectionRepository } from '@domains/repositories/election.repository';

@Injectable()
export class UpdateDistrictUseCase {
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

  async execute(
    id: number,
    dto: UpdateDistrictCommand,
    userId: number,
  ): Promise<District> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.UPDATE_DISTRICT,
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
        // Can only update district if election is scheduled
        election.validateForUpdate();

        // validate district existence
        const districtResult = await this.districtRepository.findById(
          id,
          manager,
        );
        if (!districtResult) {
          throw new NotFoundException('District not found');
        }

        // Update the district
        const district = new District({
          electionId: activeElection.electionId,
          desc1: dto.desc1,
        });
        const updateSuccessfull = await this.districtRepository.update(
          id,
          district,
          manager,
        );

        if (!updateSuccessfull) {
          throw new SomethinWentWrongException('District update failed');
        }

        const updateResult = await this.districtRepository.findById(
          id,
          manager,
        );
        // Log the creation
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.UPDATE_DISTRICT,
          DATABASE_CONSTANTS.MODELNAME_DISTRICT,
          JSON.stringify({
            id: updateResult.id,
            election: election.name,
            desc1: updateResult.desc1,
          }),
          new Date(),
          userId,
        );
        // insert log
        await this.activityLogRepository.create(log, manager);

        return updateResult;
      },
    );
  }
}
