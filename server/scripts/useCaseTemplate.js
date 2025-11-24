module.exports = {
  createDomainRepositoryTemplate: (name, filename) => {
    const modelNamePascalCase = `${name.charAt(0).toUpperCase() + name.slice(1)}`;
    const modelNameCamelCase = name;
    return `import { ${modelNamePascalCase} } from '@domain/models/${filename}.model';

export interface ${modelNamePascalCase}Repository<Context = unknown> {
  createWithManager(${modelNameCamelCase}: ${modelNamePascalCase}, context?: Context): Promise<${modelNamePascalCase}>;
  updateWithManager(
    id: number,
    updateData: Partial<${modelNamePascalCase}>,
    context?: Context,
  ): Promise<boolean>;
  softDeleteWithManager(id: number, context?: Context): Promise<boolean>;
  restoreWithManager(id: number, context?: Context): Promise<boolean>;
  findByIdWithManager(id: number,context?: Context): Promise<${modelNamePascalCase}>;
  findWithFilters(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
  ): Promise<{
    data: ${modelNamePascalCase}[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findById(id: number): Promise<${modelNamePascalCase}>;
  findAll(): Promise<${modelNamePascalCase}[]>;
}`;
  },

  createRepositoryImplementationTemplate: (name, filename) => {
    const modelNamePascalCase = `${name.charAt(0).toUpperCase() + name.slice(1)}`;
    const modelNameCamelCase = name;

    return `import { ${modelNamePascalCase}Repository } from '@domains/repositories/${filename}.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { ${modelNamePascalCase}Entity } from '../entities/${filename}.entity';
import { ${modelNamePascalCase} } from '@domain/models/${filename}.model';

@Injectable()
export class ${modelNamePascalCase}RepositoryImpl
  implements ${modelNamePascalCase}Repository<EntityManager>
{
  constructor(
    @InjectRepository(${modelNamePascalCase}Entity)
    private readonly ${modelNameCamelCase}Repo: Repository<${modelNamePascalCase}Entity>,
  ) {}

  async createWithManager(
    ${modelNameCamelCase}: ${modelNamePascalCase},
    manager: EntityManager,
  ): Promise<${modelNamePascalCase}> {
    const ${modelNameCamelCase}Entity = this.toEntity(${modelNameCamelCase});
    const savedEntity = await manager.save(${modelNamePascalCase}Entity, ${modelNameCamelCase}Entity);
    return this.toModel(savedEntity);
  }

  async updateWithManager(
    id: number,
    updateFields: Partial<${modelNamePascalCase}>,
    manager: EntityManager,
  ): Promise<boolean> {
    const result: UpdateResult = await manager.update(
      ${modelNamePascalCase}Entity,
      id,
      updateFields,
    );
    return result.affected && result.affected > 0;
  }

  async softDeleteWithManager(
    id: number,
    manager: EntityManager,
  ): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(${modelNamePascalCase}Entity)
      .set({ deletedAt: new Date() })
      .where('id = :id AND deletedAt IS NULL', { id })
      .execute();

    return result.affected > 0;
  }

  async restoreWithManager(
    id: number,
    manager: EntityManager,
  ): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(${modelNamePascalCase}Entity)
      .set({ deletedAt: null }) // Restore by clearing deletedAt
      .where('id = :id AND deletedAt IS NOT NULL', { id }) // Restore only if soft-deleted
      .execute();

    return result.affected > 0; // Return true if a row was restored
  }

  async findWithFilters(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
  ): Promise<{
    data: ${modelNamePascalCase}[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const skip = (page - 1) * limit;

    // Build the query
    const queryBuilder = this.${modelNameCamelCase}Repo.createQueryBuilder('${modelNamePascalCase}s').withDeleted();;

    // Join the districts table (inner join)
    // queryBuilder.innerJoinAndSelect('events.district', 'districts');

    // Select only the required fields
    // queryBuilder.select([
    //   'events.id',
    //   'events.name',
    //   'events.desc1',
    //   'events.address',
    //   'events.date',
    //   'events.isActive',
    //   'events.startTime',
    //   'events.endTime',
    //   'events.deletedAt',
    //   'districts.desc1 AS district',
    // ]);

    // Filter by deletion status
    if (isDeleted) {
      queryBuilder.where('${modelNamePascalCase}s.deletedAt IS NOT NULL');
    } else {
      queryBuilder.where('${modelNamePascalCase}s.deletedAt IS NULL');
    }

    // Apply search filter on description
    if (term) {
      queryBuilder.andWhere('LOWER(${modelNamePascalCase}s.name) LIKE :term', {
        term: '%{term.toLowerCase()}%',
      });
    }

        // Clone the query to get the count of records (avoiding pagination in the count query)
    const countQuery = queryBuilder
      .clone()
      .select('COUNT(${modelNamePascalCase}s.id)', 'totalRecords');


    // Execute both data and count queries simultaneously
    const [data, countResult] = await Promise.all([
      queryBuilder.skip(skip).take(limit).getRawMany(), // Fetch the paginated data
      countQuery.getRawOne(),
    ]);

     // Extract total records
    const totalRecords = parseInt(countResult?.totalRecords || '0', 10);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalRecords / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

    return {
      data,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages,
        nextPage,
        previousPage,
      },
    };
  }

  async findById(id: number): Promise<${modelNamePascalCase} | null> {
    const ${modelNameCamelCase}Entity = await this.${modelNameCamelCase}Repo.findOne({
      where: { id, deletedAt: null },
    });
    return ${modelNameCamelCase}Entity ? this.toModel(${modelNameCamelCase}Entity) : null;
  }

  async findByIdWithManager(
    id: number,
    manager: EntityManager,
  ): Promise<${modelNamePascalCase} | null> {
    const ${modelNameCamelCase}Entity = await manager.findOne(${modelNamePascalCase}Entity, {
      where: { id, deletedAt: null },
    });
    return ${modelNameCamelCase}Entity ? this.toModel(${modelNameCamelCase}Entity) : null;
  }

  async findAll(): Promise<${modelNamePascalCase}[]> {
    return await this.${modelNameCamelCase}Repo.find({
      where: { deletedAt: null },
    });
  }

  // Helper: Convert domain model to TypeORM entity
  private toEntity(${modelNameCamelCase}: ${modelNamePascalCase}): ${modelNamePascalCase}Entity {
    const entity = new ${modelNamePascalCase}Entity();
    entity.id = ${modelNameCamelCase}.id;
    entity.deletedAt = ${modelNameCamelCase}.deletedAt;
    return entity;
  }

  // Helper: Convert TypeORM entity to domain model
  private toModel(entity: ${modelNamePascalCase}Entity): ${modelNamePascalCase} {
    return new ${modelNamePascalCase}({
      id: entity.id,
      deletedAt: entity.deletedAt,
    });
  }
}`;
  },

  useCaseCreateTemplate: (name, filename) => {
    const modelNamePascalCase = `${name.charAt(0).toUpperCase() + name.slice(1)}`;
    const modelNameCamelCase = name;
    const modelNameUpperCase = name.toUpperCase();
    return `import { Create${modelNamePascalCase}Command } from '@application/commands/${filename}/create-${filename}.command';
import { ActivityLog } from '@domain/models/activitylog,model';
import { ${modelNamePascalCase} } from '@domain/models/${filename}.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ${modelNamePascalCase}Repository } from '@domains/repositories/${filename}.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class Create${modelNamePascalCase}UseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.${modelNameUpperCase})
    private readonly ${modelNameCamelCase}Repository: ${modelNamePascalCase}Repository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(dto: Create${modelNamePascalCase}Command, userId: number): Promise<${modelNamePascalCase}> {
    return this.transactionHelper.executeTransaction(async (manager) => {
      // Create the ${modelNameCamelCase}
      const ${modelNameCamelCase} = new ${modelNamePascalCase}({ desc1: dto.desc1 });
      const created${modelNamePascalCase} = await this.${modelNameCamelCase}Repository.createWithManager(
        ${modelNameCamelCase},
        manager,
      );

      // Log the creation
      const log = new ActivityLog(
        LOG_ACTION_CONSTANTS.CREATE_${modelNameUpperCase},
        DATABASE_CONSTANTS.MODELNAME_${modelNameUpperCase},
        JSON.stringify({
          id: created${modelNamePascalCase}.id,
          desc1: created${modelNamePascalCase}.desc1,
        }),
        new Date(),
        userId, // USERI
      );

      await this.activityLogRepository.createWithManager(log, manager);

      return created${modelNamePascalCase};
    });
  }
}`;
  },

  useCaseUpdateTemplate: (name, filename) => {
    const modelNamePascalCase = `${name.charAt(0).toUpperCase() + name.slice(1)}`;
    const modelNameCamelCase = name;
    const modelNameUpperCase = name.toUpperCase();
    return `import { Update${modelNamePascalCase}Command } from '@application/commands/${filename}/update-${filename}.command';
import { ActivityLog } from '@domain/models/activitylog,model';
import { ${modelNamePascalCase} } from '@domain/models/${filename}.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ${modelNamePascalCase}Repository } from '@domains/repositories/${filename}.repository';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class Update${modelNamePascalCase}UseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.${modelNameUpperCase})
    private readonly ${modelNameCamelCase}Repository: ${modelNamePascalCase}Repository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(
    id: number,
    dto: Update${modelNamePascalCase}Command,
    userId: number,
  ): Promise<${modelNamePascalCase}> {
    return this.transactionHelper.executeTransaction(async (manager) => {
      // validate ${modelNameCamelCase} existence
      const ${modelNameCamelCase}Result = await this.${modelNameCamelCase}Repository.findByIdWithManager(id,manager);
      if (!${modelNameCamelCase}Result) {
        throw new NotFoundException('${modelNamePascalCase} not found');
      }

      // Update the ${modelNameCamelCase}
      const ${modelNameCamelCase} = new ${modelNamePascalCase}({ desc1: dto.desc1 });
      const updateSuccessfull = await this.${modelNameCamelCase}Repository.updateWithManager(
        id,
        ${modelNameCamelCase},
        manager,
      );

      if (!updateSuccessfull) {
        throw new InternalServerErrorException('${modelNamePascalCase} update failed');
      }

      const updateResult = await this.${modelNameCamelCase}Repository.findByIdWithManager(id,manager);
      // Log the creation
      const log = new ActivityLog(
        LOG_ACTION_CONSTANTS.UPDATE_${modelNameUpperCase},
        DATABASE_CONSTANTS.MODELNAME_${modelNameUpperCase},
        JSON.stringify({
          id: updateResult.id,
          desc1: updateResult.desc1,
        }),
        new Date(),
        userId,
      );
      // insert log
      await this.activityLogRepository.createWithManager(log, manager);

      return updateResult;
    });
  }
}`;
  },

  useCaseSoftDeleteTemplate: (name, filename) => {
    const modelNamePascalCase = `${name.charAt(0).toUpperCase() + name.slice(1)}`;
    const modelNameCamelCase = name;
    const modelNameUpperCase = name.toUpperCase();
    return `import { ActivityLog } from '@domain/models/activitylog,model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ${modelNamePascalCase}Repository } from '@domains/repositories/${filename}.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class SoftDelete${modelNamePascalCase}UseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.${modelNameUpperCase})
    private readonly ${modelNameCamelCase}Repository: ${modelNamePascalCase}Repository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(id: number, userId: number): Promise<void> {
    return this.transactionHelper.executeTransaction(async (manager) => {
      const success = await this.${modelNameCamelCase}Repository.softDeleteWithManager(
        id,
        manager,
      );
      if (!success) {
        // If the entity wasn't found, throw a 404 error
        throw new NotFoundException(
          "${modelNamePascalCase} with ID {id} not found or already deleted.",
        );
      }

      // Log the creation
      const log = new ActivityLog(
        LOG_ACTION_CONSTANTS.SOFT_DELETE_${modelNameUpperCase},
        DATABASE_CONSTANTS.MODELNAME_${modelNameUpperCase},
        JSON.stringify({
          id,
          explaination: '${modelNamePascalCase} with ID {id} deleted',
        }),
        new Date(),
        userId,
      );
      // insert log
      await this.activityLogRepository.createWithManager(log, manager);
    });
  }
}`;
  },

  useCaseRestoreDeleteTemplate: (name, filename) => {
    const modelNamePascalCase = `${name.charAt(0).toUpperCase() + name.slice(1)}`;
    const modelNameCamelCase = name;
    const modelNameUpperCase = name.toUpperCase();
    return `import { ActivityLog } from '@domain/models/activitylog,model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ${modelNamePascalCase}Repository } from '@domains/repositories/${filename}.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RestoreDelete${modelNamePascalCase}UseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.${modelNameUpperCase})
    private readonly ${modelNameCamelCase}Repository: ${modelNamePascalCase}Repository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(id: number, userId: number): Promise<void> {
    return this.transactionHelper.executeTransaction(async (manager) => {
      const success = await this.${modelNameCamelCase}Repository.restoreWithManager(
        id,
        manager,
      );
      if (!success) {
        throw new NotFoundException(
          "${modelNamePascalCase} with ID {id} not found or already restored.",
        );
      }

      // Log the creation
      const log = new ActivityLog(
        LOG_ACTION_CONSTANTS.RESTORE_DELETE_${modelNameUpperCase},
        DATABASE_CONSTANTS.MODELNAME_${modelNameUpperCase},
        JSON.stringify({
          id,
          explaination: "${modelNamePascalCase} with ID {id} restored",
        }),
        new Date(),
        userId,
      );
      // insert log
      await this.activityLogRepository.createWithManager(log, manager);
    });
  }
}`;
  },

  useCaseRetrieveComboboxTemplate: (name, filename) => {
    const modelNamePascalCase = `${name.charAt(0).toUpperCase() + name.slice(1)}`;
    const modelNameCamelCase = name;
    const modelNameUpperCase = name.toUpperCase();
    return `import { ${modelNamePascalCase}Repository } from '@domains/repositories/${filename}.repository';
import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class RetrieveCombobox${modelNamePascalCase}UseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.${modelNameUpperCase})
    private readonly ${modelNameCamelCase}Repository: ${modelNamePascalCase}Repository,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    const ${modelNameCamelCase}s = await this.${modelNameCamelCase}Repository.findAll();

    return ${modelNameCamelCase}s.map((val: { desc1: string }) => ({
      value: val.desc1,
      label:
        val.desc1.charAt(0).toUpperCase() + val.desc1.slice(1).toLowerCase(),
    }));
  }
}`;
  },

  useCaseFindWithFilterTemplate: (name, filename) => {
    const modelNamePascalCase = `${name.charAt(0).toUpperCase() + name.slice(1)}`;
    const modelNameCamelCase = name;
    const modelNameUpperCase = name.toUpperCase();
    return `import { Injectable } from '@nestjs/common';
import { ${modelNamePascalCase} } from '@domain/models/${filename}.model';
import { Inject } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ${modelNamePascalCase}Repository } from '@domains/repositories/${filename}.repository';

@Injectable()
export class Find${modelNamePascalCase}sWithFiltersUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.${modelNameUpperCase})
    private readonly ${modelNameCamelCase}Repository: ${modelNamePascalCase}Repository,
  ) {}

  /**
   * Executes the use case for finding ${modelNameCamelCase}s with filters.
   * @param term Search term for filtering by ${modelNameCamelCase} description.
   * @param page The current page number for pagination.
   * @param limit The number of items per page.
   * @param isDeleted Whether to retrieve deleted or non-deleted ${modelNameCamelCase}s.
   * @returns An object containing filtered ${modelNameCamelCase}s and total count.
   */
  async execute(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
  ): Promise<{
    data: ${modelNamePascalCase}[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    // Validate input parameters (optional but recommended)
    if (page < 1) {
      throw new Error('Page number must be greater than 0');
    }
    if (limit < 1) {
      throw new Error('Limit must be greater than 0');
    }

    // Call the repository method to get filtered data
    const result = await this.${modelNameCamelCase}Repository.findWithFilters(
      term,
      page,
      limit,
      isDeleted,
    );

    return result;
  }
}`;
  },

  createCommandTemplate: (name) => {
    const modelNamePascalCase = `${name.charAt(0).toUpperCase() + name.slice(1)}`;
    return `export interface Create${modelNamePascalCase}Command {}
`;
  },

  updateCommandTemplate: (name) => {
    const modelNamePascalCase = `${name.charAt(0).toUpperCase() + name.slice(1)}`;
    return `export interface Update${modelNamePascalCase}Command {}
`;
  },

  moduleTemplate: (name, filename) => {
    const modelNamePascalCase = `${name.charAt(0).toUpperCase() + name.slice(1)}`;
    const modelNameUpperCase = name.toUpperCase();
    return `import { Module } from '@nestjs/common';
import { ${modelNamePascalCase}Controller } from './controller/${filename}.controller';
import { MysqlDatabaseModule } from '@infrastructure/database/typeorm/mysql/mysql-database.module';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionHelper } from '@infrastructure/database/typeorm/mysql/services/transaction-helper.service';
import { ${modelNamePascalCase}RepositoryImpl } from '@infrastructure/database/typeorm/mysql/repositories/${filename}.repository.impl';
import { ActivityLogRepositoryImpl } from '@infrastructure/database/typeorm/mysql/repositories/activity-log.repository.impl';
import { Create${modelNamePascalCase}UseCase } from '@application/use-cases/${filename}/create-${filename}.use-case';
import { Update${modelNamePascalCase}UseCase } from '@application/use-cases/${filename}/update-${filename}.use-case';
import { Find${modelNamePascalCase}sWithFiltersUseCase } from '@application/use-cases/${filename}/find-with-filters-${filename}.use-case';
import { SoftDelete${modelNamePascalCase}UseCase } from '@application/use-cases/${filename}/soft-delete-${filename}.use-case';
import { RestoreDelete${modelNamePascalCase}UseCase } from '@application/use-cases/${filename}/restore-delete-${filename}.use-case';
import { RetrieveCombobox${modelNamePascalCase}UseCase } from '@application/use-cases/${filename}/retrieve-combobox-${filename}.use-case';

@Module({
  imports: [MysqlDatabaseModule],
  controllers: [${modelNamePascalCase}Controller],
  providers: [
    // Directly provide TransactionHelper here
    { provide: REPOSITORY_TOKENS.TRANSACTIONPORT, useClass: TransactionHelper },
    { provide: REPOSITORY_TOKENS.${modelNameUpperCase}, useClass: ${modelNamePascalCase}RepositoryImpl },
    {
      provide: REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    Create${modelNamePascalCase}UseCase,
    Update${modelNamePascalCase}UseCase,
    Find${modelNamePascalCase}sWithFiltersUseCase,
    SoftDelete${modelNamePascalCase}UseCase,
    RestoreDelete${modelNamePascalCase}UseCase,
    RetrieveCombobox${modelNamePascalCase}UseCase,
  ],
  exports: [
    Create${modelNamePascalCase}UseCase,
    Update${modelNamePascalCase}UseCase,
    Find${modelNamePascalCase}sWithFiltersUseCase,
    SoftDelete${modelNamePascalCase}UseCase,
    RestoreDelete${modelNamePascalCase}UseCase,
    RetrieveCombobox${modelNamePascalCase}UseCase,
  ],
})
export class ${modelNamePascalCase}Module {}`;
  },

  controllerTemplate: (name, filename) => {
    const modelNamePascalCase = `${name.charAt(0).toUpperCase() + name.slice(1)}`;
    const modelNameCamelCase = name;
    return `import {
  Controller,
  Post,
  Body,
  Version,
  Patch,
  Param,
  Query,
  Get,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { Create${modelNamePascalCase}UseCase } from '@application/use-cases/${filename}/create-${filename}.use-case';
import { Create${modelNamePascalCase}Dto } from '../dto/create-${filename}.dto';
import { Update${modelNamePascalCase}Dto } from '../dto/update-${filename}.dto';
import { Update${modelNamePascalCase}UseCase } from '@application/use-cases/${filename}/update-${filename}.use-case';
import { Find${modelNamePascalCase}sWithFiltersUseCase } from '@application/use-cases/${filename}/find-with-filters-${filename}.use-case';
import { SoftDelete${modelNamePascalCase}UseCase } from '@application/use-cases/${filename}/soft-delete-${filename}.use-case';
import { RestoreDelete${modelNamePascalCase}UseCase } from '@application/use-cases/${filename}/restore-delete-${filename}.use-case';
import { RetrieveCombobox${modelNamePascalCase}UseCase } from '@application/use-cases/${filename}/retrieve-combobox-${filename}.use-case';

// Controller for handling client-related requests
@Controller('${modelNameCamelCase}s')
export class ${modelNamePascalCase}Controller {
  constructor(
    private readonly create${modelNamePascalCase}UseCase: Create${modelNamePascalCase}UseCase,
    private readonly update${modelNamePascalCase}UseCase: Update${modelNamePascalCase}UseCase,
    private readonly find${modelNamePascalCase}sWithFiltersUseCase: Find${modelNamePascalCase}sWithFiltersUseCase,
    private readonly softDelete${modelNamePascalCase}UseCase: SoftDelete${modelNamePascalCase}UseCase,
    private readonly restoreDelete${modelNamePascalCase}UseCase: RestoreDelete${modelNamePascalCase}UseCase,
    private readonly retrieveCombobox${modelNamePascalCase}UseCase: RetrieveCombobox${modelNamePascalCase}UseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  async create(@Body() create${modelNamePascalCase}Dto: Create${modelNamePascalCase}Dto) {
    const userId = 1;
    return this.create${modelNamePascalCase}UseCase.execute(create${modelNamePascalCase}Dto, userId);
  }

  @Version('1') // API versioning
  @Get()
  async findWithFilters(
    @Query('term') term: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('isDeleted') isDeleted: boolean,
  ) {
    // Validate and parse query parameters
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;

    if (parsedPage < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }

    if (parsedLimit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    // Execute the use case
    return await this.find${modelNamePascalCase}sWithFiltersUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
      isDeleted,
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  async retrieveCombobox() {
    return this.retrieveCombobox${modelNamePascalCase}UseCase.execute();
  }

  @Version('1') // API versioning
  @Delete('delete/:id')
  async delete(@Param('id') id: number) {
    const userId = 1;
    return this.softDelete${modelNamePascalCase}UseCase.execute(id, userId);
  }

  @Version('1') // API versioning
  @Patch('restore/:id')
  async restore(@Param('id') id: number) {
    const userId = 1;
    return this.restoreDelete${modelNamePascalCase}UseCase.execute(id, userId);
  }

  @Version('1') // API versioning
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() update${modelNamePascalCase}Dto: Update${modelNamePascalCase}Dto,
  ) {
    const userId = 1;
    return this.update${modelNamePascalCase}UseCase.execute(id, update${modelNamePascalCase}Dto, userId);
  }
}`;
  },

  createDtoTemplate: (name) => {
    const modelNamePascalCase = `${name.charAt(0).toUpperCase() + name.slice(1)}`;
    return `import { IsNotEmpty, IsString } from 'class-validator';

export class Create${modelNamePascalCase}Dto {
  @IsNotEmpty()
  @IsString()
  desc1: string;
}`;
  },

  updateDtoTemplate: (name) => {
    const modelNamePascalCase = `${name.charAt(0).toUpperCase() + name.slice(1)}`;
    return `import { IsNotEmpty, IsString } from 'class-validator';

export class Update${modelNamePascalCase}Dto {
  @IsNotEmpty()
  @IsString()
  desc1: string;
}`;
  },
};
