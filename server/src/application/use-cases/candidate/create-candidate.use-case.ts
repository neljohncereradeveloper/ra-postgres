import { CreateCandidateCommand } from '@application/commands/candidate/create-candidate.command';
import { ActivityLog } from '@domain/models/activitylog.model';
import { Candidate } from '@domain/models/candidate.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { PositionRepository } from '@domains/repositories/position.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class CreateCandidateUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.CANDIDATE)
    private readonly candidateRepository: CandidateRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.POSITION)
    private readonly positionRepository: PositionRepository,
    @Inject(REPOSITORY_TOKENS.DISTRICT)
    private readonly districtRepository: DistrictRepository,
    @Inject(REPOSITORY_TOKENS.DELEGATE)
    private readonly delegateRepository: DelegateRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(
    dto: CreateCandidateCommand,
    userId: number,
  ): Promise<Candidate> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.CREATE_CANDIDATE,
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
        // Can only add candidate if election is scheduled
        election.validateForUpdate();

        const delegate = await this.delegateRepository.findById(
          dto.delegateId,
          manager,
        );
        if (!delegate) {
          throw new BadRequestException('Candidate is not a delegate member.');
        }

        if (activeElection.electionId !== delegate.electionId) {
          throw new BadRequestException(
            'Delegate is not part of this election',
          );
        }

        const position = await this.positionRepository.findByDescription(
          dto.position,
          activeElection.electionId,
          manager,
        );
        if (!position) {
          throw new BadRequestException('Position not found');
        }

        const district = await this.districtRepository.findByDescription(
          dto.district,
          activeElection.electionId,
          manager,
        );
        if (!district) {
          throw new BadRequestException('District not found');
        }

        const newCandidate = new Candidate({
          electionId: activeElection.electionId,
          districtId: district.id,
          positionId: position.id,
          delegateId: delegate.id,
          displayName: dto.displayName,
        });
        const candidate = await this.candidateRepository.create(
          newCandidate,
          manager,
        );

        const activityLog = new ActivityLog(
          LOG_ACTION_CONSTANTS.CREATE_CANDIDATE,
          DATABASE_CONSTANTS.MODELNAME_CANDIDATE,
          JSON.stringify({
            id: candidate.id,
            election: election.name,
            district: district.desc1,
            delegate: delegate.accountName,
            position: position.desc1,
            displayName: candidate.displayName,
          }),
          new Date(),
          userId,
        );
        await this.activityLogRepository.create(activityLog, manager);

        return candidate;
      },
    );
  }
}
