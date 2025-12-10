import { UpdatePositionCommand } from '@application/commands/position/update-position.command';
import { ActivityLog } from '@domain/models/activitylog.model';
import { Position } from '@domain/models/position.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@domains/exceptions/shared/something-wentwrong.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { PositionRepository } from '@domains/repositories/position.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { POSITION_ACTIONS } from '@domain/constants/position/position-actions.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class UpdatePositionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.POSITION)
    private readonly positionRepository: PositionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdatePositionCommand,
    user_name: string,
  ): Promise<Position> {
    return this.transactionHelper.executeTransaction(
      POSITION_ACTIONS.UPDATE,
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
        // use domain model method to validate if election is scheduled
        election.validateForUpdate();

        // retrieve the position
        const position = await this.positionRepository.findById(id, manager);
        if (!position) {
          throw new NotFoundException('Position not found');
        }

        // use domain model method to update (encapsulates business logic and validation)
        position.update({
          desc1: dto.desc1,
          max_candidates: dto.max_candidates,
          term_limit: dto.term_limit,
          updated_by: user_name,
        });

        // update the position in the database
        const updateSuccessfull = await this.positionRepository.update(
          id,
          position,
          manager,
        );
        if (!updateSuccessfull) {
          throw new SomethinWentWrongException('Position update failed');
        }

        // retrieve the updated position
        const update_result = await this.positionRepository.findById(
          id,
          manager,
        );

        // Log the update
        const log = ActivityLog.create({
          action: POSITION_ACTIONS.UPDATE,
          entity: DATABASE_CONSTANTS.MODELNAME_POSITION,
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
