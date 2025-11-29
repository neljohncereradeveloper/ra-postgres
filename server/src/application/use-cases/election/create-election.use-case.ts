import { ActivityLog } from '@domain/models/activitylog,model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { ELECTION_STATUS_CONSTANTS } from '@shared/constants/election.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CreateElectionCommand } from '@application/commands/election/create-election.command';
import { Election } from '@domain/models/election.model';

@Injectable()
export class CreateElectionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(dto: CreateElectionCommand, userId: number): Promise<Election> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.CREATE_ELECTION,
      async (manager) => {
        // Create and validate election using domain method
        const election = Election.create({
          name: dto.name,
          desc1: dto.desc1,
          address: dto.address,
          date: dto.date,
          createdBy: userId.toString(),
        });

        const savedElection = await this.electionRepository.create(
          election,
          manager,
        );

        const activityLog = new ActivityLog(
          LOG_ACTION_CONSTANTS.CREATE_ELECTION,
          DATABASE_CONSTANTS.MODELNAME_ELECTION,
          JSON.stringify({
            id: savedElection.id,
            name: dto.name,
            desc1: dto.desc1,
            address: dto.address,
            status: ELECTION_STATUS_CONSTANTS.SCHEDULED,
            date: dto.date,
          }),
          new Date(),
          userId,
        );
        await this.activityLogRepository.create(activityLog, manager);

        return savedElection;
      },
    );
  }
}
