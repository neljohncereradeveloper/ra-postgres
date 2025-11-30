import { UpdatePositionCommand } from '@application/commands/position/update-position.command';
import { ActivityLog } from '@domain/models/activitylog.model';
import { Position } from '@domain/models/position.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@domains/exceptions/shared/something-wentwrong.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { PositionRepository } from '@domains/repositories/position.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';

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
    userId: number,
  ): Promise<Position> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.UPDATE_POSITION,
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
        // Can only update position if election is scheduled
        election.validateForUpdate();

        // validate position existence
        const positionResult = await this.positionRepository.findById(
          id,
          manager,
        );
        if (!positionResult) {
          throw new NotFoundException('Position not found');
        }

        // Update the district
        const position = new Position({
          electionId: activeElection.electionId,
          desc1: dto.desc1,
          maxCandidates: dto.maxCandidates,
          termLimit: dto.termLimit,
        });
        const updateSuccessfull = await this.positionRepository.update(
          id,
          position,
          manager,
        );

        if (!updateSuccessfull) {
          throw new SomethinWentWrongException('Position update failed');
        }

        const updateResult = await this.positionRepository.findById(
          id,
          manager,
        );
        // Log the creation
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.UPDATE_POSITION,
          DATABASE_CONSTANTS.MODELNAME_POSITION,
          JSON.stringify({
            id: updateResult.id,
            election: election.name,
            desc1: updateResult.desc1,
            maxCandidates: updateResult.maxCandidates,
            termLimit: updateResult.termLimit,
          }),
          new Date(),
          userId,
        );
        // insert log
        await this.activityLogRepository.create(log, manager);

        return updateResult;
      },
    );
  }
}
