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
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { DISTRICT_ACTIONS } from '@domain/constants/district/district-actions.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';

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
    userName: string,
  ): Promise<District> {
    return this.transactionHelper.executeTransaction(
      DISTRICT_ACTIONS.UPDATE,
      async (manager) => {
        // retrieve the active election
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new BadRequestException('No Active election');
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
        // use domain model method to validate if election is scheduled
        election.validateForUpdate();

        // retrieve the district
        const district = await this.districtRepository.findById(id, manager);
        if (!district) {
          throw new NotFoundException('District not found');
        }

        // use domain model method to update (encapsulates business logic and validation)
        district.update({
          desc1: dto.desc1,
          updatedby: userName,
        });

        // update the district in the database
        const updateSuccessfull = await this.districtRepository.update(
          id,
          district,
          manager,
        );
        if (!updateSuccessfull) {
          throw new SomethinWentWrongException('District update failed');
        }

        // retrieve the updated district
        const updateResult = await this.districtRepository.findById(
          id,
          manager,
        );

        // Log the update
        const log = ActivityLog.create({
          action: DISTRICT_ACTIONS.UPDATE,
          entity: DATABASE_CONSTANTS.MODELNAME_DISTRICT,
          details: JSON.stringify({
            id: updateResult.id,
            desc1: updateResult.desc1,
            updatedBy: userName,
            updatedAt: getPHDateTime(updateResult.updatedat),
          }),
          username: userName,
        });
        await this.activityLogRepository.create(log, manager);

        return updateResult;
      },
    );
  }
}
