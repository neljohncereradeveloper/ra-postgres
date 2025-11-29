import { UpdateElectionCommand } from '@application/commands/election/update-election.command';
import { ActivityLog } from '@domain/models/activitylog,model';
import { Election } from '@domain/models/election.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ElectionNotFoundException } from '@domains/exceptions/election/eelction-not-found.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class UpdateElectionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateElectionCommand,
    userId: number,
  ): Promise<Election> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.UPDATE_ELECTION,
      async (manager) => {
        const election = await this.electionRepository.findById(id, manager);
        if (!election) throw new ElectionNotFoundException();

        election.validate();
        election.updateDetails(dto);

        await this.electionRepository.update(id, election, manager);

        const activityLog = new ActivityLog(
          LOG_ACTION_CONSTANTS.UPDATE_ELECTION,
          DATABASE_CONSTANTS.MODELNAME_ELECTION,
          JSON.stringify({
            id: election.id,
            name: dto.name,
            desc1: dto.desc1,
            address: dto.address,
          }),
          new Date(),
          userId,
        );
        await this.activityLogRepository.create(activityLog, manager);

        return election;
      },
    );
  }
}
