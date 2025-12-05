import { CreateDistrictCommand } from '@application/commands/district/create-district.command';
import { ActivityLog } from '@domain/models/activitylog.model';
import { District } from '@domain/models/district.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { DISTRICT_ACTIONS } from '@domain/constants/district/district-actions.constants';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@domains/exceptions/index';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class CreateDistrictUseCase {
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
    dto: CreateDistrictCommand,
    username: string,
  ): Promise<District> {
    return this.transactionHelper.executeTransaction(
      DISTRICT_ACTIONS.CREATE,
      async (manager) => {
        // retrieve the active election
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new NotFoundException('No active election');
        }

        // retrieve the election
        const election = await this.electionRepository.findById(
          activeElection.electionId,
          manager,
        );
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${activeElection.electionId} not found.`,
          );
        }
        // use domain model method to validate if election is scheduled
        election.validateForUpdate();

        // use domain model method to create (encapsulates business logic and validation)
        const newDistrict = District.create({
          electionId: election.id,
          desc1: dto.desc1,
          createdBy: username,
        });
        // create the district in the database
        const createdDistrict = await this.districtRepository.create(
          newDistrict,
          manager,
        );

        if (!createdDistrict) {
          throw new SomethinWentWrongException('District creation failed');
        }

        // Log the creation
        const log = ActivityLog.create({
          action: DISTRICT_ACTIONS.CREATE,
          entity: DATABASE_CONSTANTS.MODELNAME_DISTRICT,
          details: JSON.stringify({
            id: createdDistrict.id,
            desc1: createdDistrict.desc1,
            createdBy: username,
            createdAt: getPHDateTime(createdDistrict.createdAt),
          }),
          username: username,
        });
        await this.activityLogRepository.create(log, manager);

        // log the creation
        return createdDistrict;
      },
    );
  }
}
