import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@domains/exceptions/shared/something-wentwrong.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ACTIVE_ELECTION_ACTIONS } from '@domain/constants/active-election/active-election-actions.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class SetActiveElectionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(electionName: string, username: string) {
    return this.transactionHelper.executeTransaction(
      ACTIVE_ELECTION_ACTIONS.SET_ACTIVE_ELECTION,
      async (manager) => {
        // validate existence
        const election = await this.electionRepository.findByName(
          electionName,
          manager,
        );
        if (!election) {
          throw new NotFoundException('Election does not exist');
        }

        // Update the active election
        const updateSuccessfull =
          await this.activeElectionRepository.setActiveElection(
            election.id,
            manager,
          );

        if (!updateSuccessfull) {
          throw new SomethinWentWrongException('Active election update failed');
        }
        const updateResult =
          await this.activeElectionRepository.retrieveActiveElection(manager);

        // Log the set active election
        const log = ActivityLog.create({
          action: ACTIVE_ELECTION_ACTIONS.SET_ACTIVE_ELECTION,
          entity: DATABASE_CONSTANTS.MODELNAME_ACTIVE_ELECTION,
          details: JSON.stringify({
            electionId: election.id,
            election: election.name,
            explanation: `Active election set by USER : ${username}`,
            setBy: username,
            setAt: getPHDateTime(),
          }),
          username: username,
        });
        await this.activityLogRepository.create(log, manager);

        return updateResult;
      },
    );
  }
}
