import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { ELECTION_ACTIONS } from '@domain/constants/index';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@domains/exceptions/index';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class CloseElectionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    // @Inject(REPOSITORY_TOKENS.BALLOT)
    // private readonly ballotRepository: BallotRepository,
  ) {}

  async execute(userName: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      ELECTION_ACTIONS.CLOSE,
      async (manager) => {
        // retrieve the active election
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new NotFoundException('No Active election');
        }

        // retrieve the election
        const election = await this.electionRepository.findById(
          activeElection.electionId,
          manager,
        );
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${activeElection.electionId} not found`,
          );
        }

        // use domain model method to close the election
        election.closeEvent();

        // update the election in the database
        const success = await this.electionRepository.update(
          activeElection.electionId,
          election,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException('Election close failed');
        }

        // reset the active event
        await this.activeElectionRepository.reset(manager);

        // Remove all delegate links in the ballot
        // await this.ballotRepository.unlinkBallot(
        //   activeElection.electionId,
        //   manager,
        // );

        // Log the cancel election
        const log = ActivityLog.create({
          action: ELECTION_ACTIONS.CLOSE,
          entity: DATABASE_CONSTANTS.MODELNAME_ELECTION,
          details: JSON.stringify({
            id: election.id,
            name: election.name,
            address: election.address,
            date: getPHDateTime(election.date),
            desc1: election.desc1,
            explanation: `Election ${election.name} closed by USER : ${userName}`,
            closedBy: userName,
            closedAt: getPHDateTime(),
          }),
          username: userName,
        });
        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
