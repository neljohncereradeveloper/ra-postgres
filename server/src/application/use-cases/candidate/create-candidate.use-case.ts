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
import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CANDIDATE_ACTIONS } from '@domain/constants/candidate/candidate-actions.constants';
import {
  BadRequestException,
  NotFoundException,
  SomethinWentWrongException,
} from '@domains/exceptions/index';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';

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
    username: string,
  ): Promise<Candidate> {
    return this.transactionHelper.executeTransaction(
      CANDIDATE_ACTIONS.CREATE,
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
          throw new NotFoundException('Election not found');
        }
        // use domain model method to validate if election is scheduled
        election.validateForUpdate();

        // retrieve the delegate
        const delegate = await this.delegateRepository.findById(
          dto.delegateId,
          manager,
        );
        if (!delegate) {
          throw new NotFoundException('Delegate not found');
        }

        if (election.id !== delegate.electionId) {
          throw new BadRequestException(
            'Delegate is not part of this election',
          );
        }

        const position = await this.positionRepository.findByDescription(
          dto.position,
          election.id,
          manager,
        );
        if (!position) {
          throw new NotFoundException('Position not found');
        }

        const district = await this.districtRepository.findByDescription(
          dto.district,
          election.id,
          manager,
        );
        if (!district) {
          throw new NotFoundException('District not found');
        }

        // use domain model method to create (encapsulates business logic and validation)
        const newCandidate = Candidate.create({
          electionId: election.id,
          districtId: district.id,
          positionId: position.id,
          delegateId: delegate.id,
          displayName: dto.displayName,
          createdBy: username,
        });
        // create the candidate in the database
        const candidate = await this.candidateRepository.create(
          newCandidate,
          manager,
        );

        if (!candidate) {
          throw new SomethinWentWrongException('Candidate creation failed');
        }

        // Log the creation
        const log = ActivityLog.create({
          action: CANDIDATE_ACTIONS.CREATE,
          entity: DATABASE_CONSTANTS.MODELNAME_CANDIDATE,
          details: JSON.stringify({
            id: candidate.id,
            displayName: candidate.displayName,
            position: position.desc1,
            district: district.desc1,
            delegate: delegate.accountName,
            createdBy: username,
            createdAt: getPHDateTime(candidate.createdAt),
          }),
          username: username,
        });
        await this.activityLogRepository.create(log, manager);

        // return the candidate
        return candidate;
      },
    );
  }
}
