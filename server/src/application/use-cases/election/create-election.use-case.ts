import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CreateElectionCommand } from '@application/commands/election/create-election.command';
import { Election } from '@domain/models/election.model';
import { ELECTION_ACTIONS } from '@domain/constants/index';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import { SomethinWentWrongException } from '@domains/exceptions/index';

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

  async execute(
    dto: CreateElectionCommand,
    userName: string,
  ): Promise<Election> {
    return this.transactionHelper.executeTransaction(
      ELECTION_ACTIONS.CREATE,
      async (manager) => {
        // Create and validate election using domain method
        const election = Election.create({
          name: dto.name,
          desc1: dto.desc1,
          address: dto.address,
          date: getPHDateTime(dto.date),
          createdBy: userName,
        });

        // create the election in the database
        const createdElection = await this.electionRepository.create(
          election,
          manager,
        );

        if (!createdElection) {
          throw new SomethinWentWrongException('Election creation failed');
        }

        // Log the creation
        const log = ActivityLog.create({
          action: ELECTION_ACTIONS.CREATE,
          entity: DATABASE_CONSTANTS.MODELNAME_ELECTION,
          details: JSON.stringify({
            id: createdElection.id,
            name: createdElection.name,
            desc1: createdElection.desc1,
            address: createdElection.address,
            date: getPHDateTime(createdElection.date),
            createdBy: userName,
            createdAt: getPHDateTime(createdElection.createdAt),
          }),
          username: userName,
        });
        await this.activityLogRepository.create(log, manager);

        // Return the created election
        return createdElection;
      },
    );
  }
}
