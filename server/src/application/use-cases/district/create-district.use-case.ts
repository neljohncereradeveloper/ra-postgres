import { CreateDistrictCommand } from '@application/commands/district/create-district.command';
import { ActivityLog } from '@domain/models/activitylog,model';
import { District } from '@domain/models/district.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

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
      LOG_ACTION_CONSTANTS.CREATE_DISTRICT,
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
        // Can only add district if election is scheduled
        election.validateForUpdate();

        const newDistrict = District.create({
          electionId: activeElection.electionId,
          desc1: dto.desc1,
          createdBy: username,
        });
        const district = await this.districtRepository.create(
          newDistrict,
          manager,
        );

        const activityLog = new ActivityLog(
          LOG_ACTION_CONSTANTS.CREATE_DISTRICT,
          DATABASE_CONSTANTS.MODELNAME_DISTRICT,
          JSON.stringify({
            id: district.id,
            election: election.name,
            desc1: district.desc1,
          }),
          new Date(),
          username,
        );
        await this.activityLogRepository.create(activityLog, manager);

        return district;
      },
    );
  }
}
