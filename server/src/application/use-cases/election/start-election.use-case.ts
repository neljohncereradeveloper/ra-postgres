import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { Election } from '@domain/models/election.model';
import { PositionRepository } from '@domains/repositories/position.repository';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { DistrictRepository } from '@domains/repositories/district.repository';

@Injectable()
export class StartElectionUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.DELEGATE)
    private readonly delegateRepository: DelegateRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.DISTRICT)
    private readonly districtRepository: DistrictRepository,
    @Inject(REPOSITORY_TOKENS.POSITION)
    private readonly positionRepository: PositionRepository,
    @Inject(REPOSITORY_TOKENS.CANDIDATE)
    private readonly candidateRepository: CandidateRepository,
  ) {}

  async execute(userId: number): Promise<Election> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.START_ELECTION,
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

        const delegatesCount = await this.delegateRepository.countByElectionId(
          activeElection.electionId,
          manager,
        );
        const districtCount = await this.districtRepository.countByElection(
          activeElection.electionId,
          manager,
        );
        const positionCount = await this.positionRepository.countByElection(
          activeElection.electionId,
          manager,
        );
        const candidateCount = await this.candidateRepository.countByElectionId(
          activeElection.electionId,
          manager,
        );

        election.startEvent(
          delegatesCount,
          districtCount,
          positionCount,
          candidateCount,
        );

        await this.electionRepository.update(
          activeElection.electionId,
          election,
          manager,
        );

        const activityLog = new ActivityLog(
          LOG_ACTION_CONSTANTS.START_ELECTION,
          DATABASE_CONSTANTS.MODELNAME_ELECTION,
          JSON.stringify({
            id: activeElection.electionId,
            explaination: `Election ${election.name} started`,
          }),
          new Date(),
          userId,
        );
        await this.activityLogRepository.create(activityLog, manager);

        return election;
      },
    );
  }
}
