import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { PositionRepository } from '@domains/repositories/position.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { SomethinWentWrongException } from '@domains/exceptions/index';
import { POSITION_ACTIONS } from '@domain/constants/position/position-actions.constants';

@Injectable()
export class RestorePositionUseCase {
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

  async execute(id: number, userName: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      POSITION_ACTIONS.RESTORE,
      async (manager) => {
        // retrieve the active election
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new BadRequestException('No active election');
        }

        // retrieve the election
        const election = await this.electionRepository.findById(
          activeElection.electionId,
          manager,
        );
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${activeElection.electionId} not found.`,
          );
        }
        // Can only restore position if election is scheduled
        election.validateForUpdate();

        // retrieve the position
        const position = await this.positionRepository.findById(id, manager);
        if (!position) {
          throw new NotFoundException(`Position with ID ${id} not found.`);
        }
        // use domain model method to restore (encapsulates business logic and validation)
        position.restore();

        // update the position in the database
        const success = await this.positionRepository.update(
          id,
          position,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException('Position restore failed');
        }

        // Log the archive
        const log = ActivityLog.create({
          action: POSITION_ACTIONS.RESTORE,
          entity: DATABASE_CONSTANTS.MODELNAME_POSITION,
          details: JSON.stringify({
            id,
            desc1: position.desc1,
            explanation: `Position with ID : ${id} restored by USER : ${userName}`,
            restoredBy: userName,
            restoredAt: new Date(),
          }),
          username: userName,
        });

        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
