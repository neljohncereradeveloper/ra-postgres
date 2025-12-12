import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@domains/exceptions/shared/something-wentwrong.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PrecinctRepository } from '@domains/repositories/precinct.repository';
import { UpdatePrecinctCommand } from '@application/commands/precinct/update-precinct.command';
import { Precinct } from '@domain/models/precinct.model';
import { PRECINCT_ACTIONS } from '@domain/constants/index';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';

@Injectable()
export class UpdatePrecinctUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.PRECINCT)
    private readonly precinctRepository: PrecinctRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdatePrecinctCommand,
    user_name: string,
  ): Promise<Precinct> {
    return this.transactionHelper.executeTransaction(
      PRECINCT_ACTIONS.UPDATE,
      async (manager) => {
        // retrieve the active election
        const active_election =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!active_election) {
          throw new NotFoundException('No Active election');
        }

        // retrieve the election
        const election = await this.electionRepository.findById(
          active_election.election_id,
          manager,
        );
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${active_election.election_id} not found.`,
          );
        }
        // Use domain model method to validate if election is scheduled
        election.validateForUpdate();

        // validate precinct existence
        const precinct = await this.precinctRepository.findById(id, manager);
        if (!precinct) {
          throw new NotFoundException('Precinct not found');
        }

        // use domain model method to update (encapsulates business logic and validation)
        precinct.update({ desc1: dto.desc1, updated_by: user_name });

        // Update the precinct in the database
        const updateSuccessfull = await this.precinctRepository.update(
          id,
          precinct,
          manager,
        );
        if (!updateSuccessfull) {
          throw new SomethinWentWrongException('Precinct update failed.');
        }

        // retrieve the updated precinct
        const update_result = await this.precinctRepository.findById(
          id,
          manager,
        );

        // Log the update
        const log = ActivityLog.create({
          action: PRECINCT_ACTIONS.UPDATE,
          entity: DATABASE_CONSTANTS.MODELNAME_PRECINCT,
          details: JSON.stringify({
            id: update_result.id,
            desc1: update_result.desc1,
            updated_by: user_name,
            updated_at: getPHDateTime(update_result.updated_at),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        return update_result;
      },
    );
  }
}
