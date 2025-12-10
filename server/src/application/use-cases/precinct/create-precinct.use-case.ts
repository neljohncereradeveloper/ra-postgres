import { CreatePrecinctCommand } from '@application/commands/precinct/create-precinct.command';
import { PRECINCT_ACTIONS } from '@domain/constants/index';
import { ActivityLog, Precinct } from '@domain/models/index';
import { TransactionPort } from '@domain/ports/index';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import {
  ActivityLogRepository,
  PrecinctRepository,
} from '@domains/repositories/index';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { SomethinWentWrongException } from '@domains/exceptions/index';

@Injectable()
export class CreatePrecinctUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.PRECINCT)
    private readonly precinctRepository: PrecinctRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(
    dto: CreatePrecinctCommand,
    userName: string,
  ): Promise<Precinct> {
    return this.transactionHelper.executeTransaction(
      PRECINCT_ACTIONS.CREATE,
      async (manager) => {
        // use domain model factory method to create (encapsulates business logic and validation)
        const precinct = Precinct.create({
          desc1: dto.desc1,
          createdby: userName,
        });

        // Create the precinct in the database
        const createdPrecinct = await this.precinctRepository.create(
          precinct,
          manager,
        );

        if (!createdPrecinct) {
          throw new SomethinWentWrongException('Precinct creation failed');
        }

        // Log the creation
        const log = ActivityLog.create({
          action: PRECINCT_ACTIONS.CREATE,
          entity: DATABASE_CONSTANTS.MODELNAME_PRECINCT,
          details: JSON.stringify({
            id: createdPrecinct.id,
            desc1: createdPrecinct.desc1,
            createdBy: userName,
            createdAt: getPHDateTime(createdPrecinct.createdat),
          }),
          username: userName,
        });
        await this.activityLogRepository.create(log, manager);

        // Return the created precinct
        return createdPrecinct;
      },
    );
  }
}
