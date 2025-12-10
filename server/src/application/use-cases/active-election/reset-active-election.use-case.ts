import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { SomethinWentWrongException } from '@domains/exceptions/shared/something-wentwrong.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ACTIVE_ELECTION_ACTIONS } from '@domain/constants/active-election/active-election-actions.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class ResetActiveElectionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(user_name: string) {
    return this.transactionHelper.executeTransaction(
      ACTIVE_ELECTION_ACTIONS.RESET_ACTIVE_ELECTION,
      async (manager) => {
        // Reset the active election
        const success = await this.activeElectionRepository.reset(manager);
        if (!success) {
          throw new SomethinWentWrongException('Active election reset failed');
        }

        // Log the set active election
        const log = ActivityLog.create({
          action: ACTIVE_ELECTION_ACTIONS.RESET_ACTIVE_ELECTION,
          entity: DATABASE_CONSTANTS.MODELNAME_ACTIVE_ELECTION,
          details: JSON.stringify({
            explanation: `Active election reset by USER : ${user_name}`,
            reset_by: user_name,
            reset_at: getPHDateTime(),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
