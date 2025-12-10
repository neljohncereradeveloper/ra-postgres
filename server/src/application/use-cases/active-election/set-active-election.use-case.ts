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
import { ACTIVE_ELECTION_ID } from '@domain/constants/active-election/active-election-actions.constants';

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

  async execute(election_name: string, user_name: string) {
    return this.transactionHelper.executeTransaction(
      ACTIVE_ELECTION_ACTIONS.SET_ACTIVE_ELECTION,
      async (manager) => {
        // validate existence
        const election = await this.electionRepository.findByName(
          election_name,
          manager,
        );
        if (!election) {
          throw new NotFoundException('Election does not exist');
        }

        const active_election = await this.activeElectionRepository.findById(
          ACTIVE_ELECTION_ID,
          manager,
        );
        if (!active_election) {
          throw new NotFoundException('Active election not found');
        }
        // Update the active election
        const update_successfull =
          await this.activeElectionRepository.setActiveElection(
            election.id,
            manager,
          );

        if (!update_successfull) {
          throw new SomethinWentWrongException('Active election update failed');
        }
        const update_result =
          await this.activeElectionRepository.retrieveActiveElection(manager);

        // Log the set active election
        const log = ActivityLog.create({
          action: ACTIVE_ELECTION_ACTIONS.SET_ACTIVE_ELECTION,
          entity: DATABASE_CONSTANTS.MODELNAME_ACTIVE_ELECTION,
          details: JSON.stringify({
            id: active_election.id,
            election_id: election.id,
            election_name: election.name,
            explanation: `Active election set by USER : ${user_name}`,
            set_by: user_name,
            set_at: getPHDateTime(),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        return update_result;
      },
    );
  }
}
