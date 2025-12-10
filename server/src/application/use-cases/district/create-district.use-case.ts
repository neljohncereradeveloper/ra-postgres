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
    user_name: string,
  ): Promise<District> {
    return this.transactionHelper.executeTransaction(
      DISTRICT_ACTIONS.CREATE,
      async (manager) => {
        // retrieve the active election
        const active_election =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!active_election) {
          throw new NotFoundException('No active election');
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
        // use domain model method to validate if election is scheduled
        election.validateForUpdate();

        // use domain model method to create (encapsulates business logic and validation)
        const new_district = District.create({
          election_id: election.id,
          desc1: dto.desc1,
          created_by: user_name,
        });
        // create the district in the database
        const created_district = await this.districtRepository.create(
          new_district,
          manager,
        );

        if (!created_district) {
          throw new SomethinWentWrongException('District creation failed');
        }

        // Log the creation
        const log = ActivityLog.create({
          action: DISTRICT_ACTIONS.CREATE,
          entity: DATABASE_CONSTANTS.MODELNAME_DISTRICT,
          details: JSON.stringify({
            id: created_district.id,
            desc1: created_district.desc1,
            created_by: user_name,
            created_at: getPHDateTime(created_district.created_at),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        // log the creation
        return created_district;
      },
    );
  }
}
