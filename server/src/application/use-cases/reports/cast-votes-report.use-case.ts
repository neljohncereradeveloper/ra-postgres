import { BadRequestException, Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { TransactionPort } from '@domain/ports/transaction-port';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { ReportsRepository } from '@domains/repositories/reports.repository';
import { ActivityLog } from '@domain/models/activitylog,model';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';

@Injectable()
export class CastVoteReportUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.REPORTS)
    private readonly reportsRepository: ReportsRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  /**
   * Executes the use case for finding districts with filters.
   * @param userId The user ID.
   * @returns An object containing filtered districts and total count.
   */
  async execute(userId: number): Promise<any> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.GENERATE_CAST_VOTE_REPORT,
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

        // Call the repository method to get filtered data
        const result: any[] =
          await this.reportsRepository.electionCastVoteReport(
            activeElection.electionId,
            manager,
          );

        // Transform the result to the required format
        const groupedResult = [];
        const positionMap = new Map();
        for (const row of result) {
          if (!positionMap.has(row.position)) {
            positionMap.set(row.position, {
              position: row.position,
              candidates: [],
            });
          }
          positionMap.get(row.position).candidates.push({
            name: row.candidate,
            voteCount: Number(row.voteCount),
          });
        }
        for (const value of positionMap.values()) {
          groupedResult.push(value);
        }

        const activityLog = new ActivityLog(
          LOG_ACTION_CONSTANTS.GENERATE_CAST_VOTE_REPORT,
          DATABASE_CONSTANTS.MODELNAME_CAST_VOTE,
          JSON.stringify(result),
          new Date(),
          userId,
        );
        await this.activityLogRepository.create(activityLog, manager);

        return {
          data: groupedResult,
          election: election,
        };
      },
    );
  }
}
