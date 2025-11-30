import { ActivityLog } from '@domain/models/activitylog.model';
import { Election } from '@domain/models/election.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ELECTION_ACTIONS } from '@domain/constants/index';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@domains/exceptions/index';

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

  async execute(userName: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      ELECTION_ACTIONS.CANCEL,
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

        // use domain model method to cancel the election
        election.cancelEvent(`Election ${election.name} cancelled`);

        // update the election in the database
        const success = await this.electionRepository.update(
          activeElection.electionId,
          election,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException('Election cancel failed');
        }

        // reset the active election
        await this.activeElectionRepository.reset(manager);

        // Log the cancel election
        const log = ActivityLog.create({
          action: ELECTION_ACTIONS.CANCEL,
          entity: DATABASE_CONSTANTS.MODELNAME_ELECTION,
          details: JSON.stringify({
            id: election.id,
            name: election.name,
            address: election.address,
            date: election.date,
            desc1: election.desc1,
            explanation: `Election ${election.name} cancelled by USER : ${userName}`,
            cancelledBy: userName,
            cancelledAt: new Date(),
          }),
          username: userName,
        });
        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
