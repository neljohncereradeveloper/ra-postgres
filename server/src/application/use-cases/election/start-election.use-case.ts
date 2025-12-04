import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { PositionRepository } from '@domains/repositories/position.repository';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { ELECTION_ACTIONS } from '@domain/constants/index';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@domains/exceptions/index';
import { getPHDateTime } from '@domain/utils/format-ph-time';

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

  async execute(userName: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      ELECTION_ACTIONS.START,
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

        const delegatesCount = await this.delegateRepository.countByElection(
          election.id,
          manager,
        );
        const districtCount = await this.districtRepository.countByElection(
          election.id,
          manager,
        );
        const positionCount = await this.positionRepository.countByElection(
          election.id,
          manager,
        );
        const candidateCount = await this.candidateRepository.countByElection(
          election.id,
          manager,
        );

        // use domain model method to start the election and validate the election
        election.startEvent(
          delegatesCount,
          districtCount,
          positionCount,
          candidateCount,
        );

        // update the election in the database
        const success = await this.electionRepository.update(
          election.id,
          election,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException('Election start failed');
        }

        // Log the archive
        const log = ActivityLog.create({
          action: ELECTION_ACTIONS.START,
          entity: DATABASE_CONSTANTS.MODELNAME_ELECTION,
          details: JSON.stringify({
            id: election.id,
            name: election.name,
            desc1: election.desc1,
            address: election.address,
            date: getPHDateTime(election.date),
            explanation: `Election with ID : ${election.id} started by USER : ${userName}`,
            startedBy: userName,
            startedAt: getPHDateTime(election.startTime),
          }),
          username: userName,
        });

        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
