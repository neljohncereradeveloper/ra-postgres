import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { PositionRepository } from '@domains/repositories/position.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { POSITION_ACTIONS } from '@domain/constants/position/position-actions.constants';
import { SomethinWentWrongException } from '@domains/exceptions/shared/something-wentwrong.exception';

@Injectable()
export class ArchivePositionUseCase {
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
      POSITION_ACTIONS.ARCHIVE,
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
            `Election with ID ${activeElection.electionId} not found.`,
          );
        }
        // Can only archive position if election is scheduled
        election.validateForUpdate();

        // retrieve the position
        const position = await this.positionRepository.findById(id, manager);
        if (!position) {
          throw new NotFoundException(`Position with ID ${id} not found.`);
        }

        // use domain model method to archive (encapsulates business logic and validation)
        position.archive(userName);

        // update the position in the database
        const success = await this.positionRepository.update(
          id,
          position,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException('Position archive failed');
        }

        // Log the archive
        const log = ActivityLog.create({
          action: POSITION_ACTIONS.ARCHIVE,
          entity: DATABASE_CONSTANTS.MODELNAME_POSITION,
          details: JSON.stringify({
            id,
            desc1: position.desc1,
            explanation: `Position with ID : ${id} archived by USER : ${userName}`,
            archivedBy: userName,
            archivedAt: position.deletedAt,
          }),
          username: userName,
        });

        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
