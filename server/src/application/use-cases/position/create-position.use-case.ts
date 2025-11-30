import { CreatePositionCommand } from '@application/commands/position/create-position.command';
import { ActivityLog } from '@domain/models/activitylog.model';
import { Position } from '@domain/models/position.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { PositionRepository } from '@domains/repositories/position.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ElectionRepository } from '@domains/repositories/election.repository';

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

  async execute(dto: CreatePositionCommand, userId: number): Promise<Position> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.CREATE_POSITION,
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
        // Can only add position if election is scheduled
        election.validateForUpdate();

        const newPosition = new Position({
          electionId: activeElection.electionId,
          desc1: dto.desc1,
          maxCandidates: dto.maxCandidates,
          termLimit: dto.termLimit,
        });
        const position = await this.positionRepository.create(
          newPosition,
          manager,
        );

        const activityLog = new ActivityLog(
          LOG_ACTION_CONSTANTS.CREATE_POSITION,
          DATABASE_CONSTANTS.MODELNAME_POSITION,
          JSON.stringify({
            id: position.id,
            election: election.name,
            desc1: position.desc1,
            maxCandidates: position.maxCandidates,
            termLimit: position.termLimit,
          }),
          new Date(),
          userId,
        );
        await this.activityLogRepository.create(activityLog, manager);

        return position;
      },
    );
  }
}
