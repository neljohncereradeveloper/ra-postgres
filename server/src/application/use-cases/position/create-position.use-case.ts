import { CreatePositionCommand } from '@application/commands/position/create-position.command';
import { ActivityLog } from '@domain/models/activitylog.model';
import { Position } from '@domain/models/position.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { PositionRepository } from '@domains/repositories/position.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { POSITION_ACTIONS } from '@domain/constants/position/position-actions.constants';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@domains/exceptions/index';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class CreatePositionUseCase {
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
    dto: CreatePositionCommand,
    user_name: string,
  ): Promise<Position> {
    return this.transactionHelper.executeTransaction(
      POSITION_ACTIONS.CREATE,
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

        // use domain model method to create (encapsulates business logic and validation)
        const new_position = Position.create({
          election_id: election.id,
          desc1: dto.desc1,
          max_candidates: dto.max_candidates || 1,
          term_limit: dto.term_limit || '1',
          created_by: user_name,
        });
        // create the position in the database
        const created_position = await this.positionRepository.create(
          new_position,
          manager,
        );

        if (!created_position) {
          throw new SomethinWentWrongException('Position creation failed');
        }

        // Log the creation
        const log = ActivityLog.create({
          action: POSITION_ACTIONS.CREATE,
          entity: DATABASE_CONSTANTS.MODELNAME_POSITION,
          details: JSON.stringify({
            id: created_position.id,
            desc1: created_position.desc1,
            created_by: user_name,
            created_at: getPHDateTime(created_position.created_at),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        return created_position;
      },
    );
  }
}
