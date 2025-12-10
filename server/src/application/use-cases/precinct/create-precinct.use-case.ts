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
    user_name: string,
  ): Promise<Precinct> {
    return this.transactionHelper.executeTransaction(
      PRECINCT_ACTIONS.CREATE,
      async (manager) => {
        // use domain model factory method to create (encapsulates business logic and validation)
        const precinct = Precinct.create({
          desc1: dto.desc1,
          created_by: user_name,
        });

        // Create the precinct in the database
        const created_precinct = await this.precinctRepository.create(
          precinct,
          manager,
        );

        if (!created_precinct) {
          throw new SomethinWentWrongException('Precinct creation failed');
        }

        // Log the creation
        const log = ActivityLog.create({
          action: PRECINCT_ACTIONS.CREATE,
          entity: DATABASE_CONSTANTS.MODELNAME_PRECINCT,
          details: JSON.stringify({
            id: created_precinct.id,
            desc1: created_precinct.desc1,
            created_by: user_name,
            created_at: getPHDateTime(created_precinct.created_at),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        // Return the created precinct
        return created_precinct;
      },
    );
  }
}
