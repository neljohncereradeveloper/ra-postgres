import { UpdateElectionCommand } from '@application/commands/election/update-election.command';
import { ELECTION_ACTIONS } from '@domain/constants/index';
import { ActivityLog } from '@domain/models/activitylog.model';
import { Election } from '@domain/models/election.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@domains/exceptions/index';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
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
    userName: string,
  ): Promise<Election> {
    return this.transactionHelper.executeTransaction(
      ELECTION_ACTIONS.UPDATE,
      async (manager) => {
        const election = await this.electionRepository.findById(id, manager);
        if (!election) throw new NotFoundException('Election not found');

        // use domain model method to validate if election can be updated (not locked)
        election.validateForUpdate();

        // use domain model method to update the election
        election.update({
          name: dto.name,
          desc1: dto.desc1,
          address: dto.address,
          date: dto.date,
          maxAttendees: dto.maxAttendees,
          startTime: dto.startTime,
          endTime: dto.endTime,
          updatedBy: userName,
        });

        // update the election in the database
        const success = await this.electionRepository.update(
          id,
          election,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException(
            `Election with ID ${id} update failed.`,
          );
        }

        // retrieve the updated election
        const updateResult = await this.electionRepository.findById(
          id,
          manager,
        );

        // Log the update
        const log = ActivityLog.create({
          action: ELECTION_ACTIONS.UPDATE,
          entity: DATABASE_CONSTANTS.MODELNAME_ELECTION,
          details: JSON.stringify({
            id: election.id,
            name: election.name,
            desc1: election.desc1,
            address: election.address,
            date: election.date,
            maxAttendees: election.maxAttendees,
            startTime: election.startTime,
            endTime: election.endTime,
            updatedBy: userName,
            updatedAt: election.updatedAt,
          }),
          username: userName,
        });
        await this.activityLogRepository.create(log, manager);

        return updateResult;
      },
    );
  }
}
