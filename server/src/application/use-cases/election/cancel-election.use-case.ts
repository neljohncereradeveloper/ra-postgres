import { ActivityLog } from '@domain/models/activitylog,model';
import { Election } from '@domain/models/election.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class CancelElectionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
  ) {}

  async execute(userId: number): Promise<Election> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.CANCEL_ELECTION,
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

        // Apply business logic to cancel the event (state modification)
        election.cancelEvent(`Election ${election.name} cancelled`);

        await this.electionRepository.update(
          activeElection.electionId,
          election,
          manager,
        );
        // reset the active election
        await this.activeElectionRepository.resetElection(manager);

        const activityLog = new ActivityLog(
          LOG_ACTION_CONSTANTS.CANCEL_ELECTION,
          DATABASE_CONSTANTS.MODELNAME_ELECTION,
          JSON.stringify({
            id: activeElection.electionId,
            explaination: `Election ${election.name} cancelled.`,
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
