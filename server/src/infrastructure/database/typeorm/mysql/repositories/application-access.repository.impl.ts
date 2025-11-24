import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { ApplicationAccessEntity } from '../entities/application-access.entity';
import { ApplicationAccess } from '@domain/models/application-access.model';
import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';

@Injectable()
export class ApplicationAccessRepositoryImpl
  implements ApplicationAccessRepository<EntityManager>
{
  constructor(
    @InjectRepository(ApplicationAccessEntity)
    private readonly applicationAccessRepo: Repository<ApplicationAccessEntity>,
  ) {}

  async createWithManager(
    applicationAccess: ApplicationAccess,
    manager: EntityManager,
  ): Promise<ApplicationAccess> {
    try {
      const applicationAccessEntity = this.toEntity(applicationAccess);
      const savedEntity = await manager.save(
        ApplicationAccessEntity,
        applicationAccessEntity,
      );
      return this.toModel(savedEntity);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Application access already exists');
      }
      throw error;
    }
  }

  async updateWithManager(
    id: number,
    updateFields: Partial<ApplicationAccess>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const result: UpdateResult = await manager.update(
        ApplicationAccessEntity,
        id,
        updateFields,
      );
      return result.affected && result.affected > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Application access already exists');
      }
      throw error;
    }
  }

  async softDeleteWithManager(
    id: number,
    manager: EntityManager,
  ): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(ApplicationAccessEntity)
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
      .update(ApplicationAccessEntity)
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
    data: ApplicationAccess[];
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
    const queryBuilder = this.applicationAccessRepo
      .createQueryBuilder('applicationaccess')
      .withDeleted();

    // Select only the required fields
    queryBuilder.select([
      'applicationaccess.id as id',
      'applicationaccess.desc1 as desc1',
    ]);

    // Filter by deletion status
    if (isDeleted) {
      queryBuilder.where('applicationaccess.deletedAt IS NOT NULL');
    } else {
      queryBuilder.where('applicationaccess.deletedAt IS NULL');
    }

    // Apply search filter on description
    if (term) {
      queryBuilder.andWhere('LOWER(applicationaccess.name) LIKE :term', {
        term: `%${term.toLowerCase()}%`,
      });
    }

    // Clone the query to get the count of records (avoiding pagination in the count query)
    const countQuery = queryBuilder
      .clone()
      .select('COUNT(applicationaccess.id)', 'totalRecords');

    // Execute both data and count queries simultaneously
    const [data, countResult] = await Promise.all([
      queryBuilder.offset(skip).limit(limit).getRawMany(), // Fetch the paginated data
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

  async findById(id: number): Promise<ApplicationAccess | null> {
    const applicationAccessEntity = await this.applicationAccessRepo.findOne({
      where: { id, deletedAt: null },
    });
    return applicationAccessEntity
      ? this.toModel(applicationAccessEntity)
      : null;
  }

  async findByIdWithManager(
    id: number,
    manager: EntityManager,
  ): Promise<ApplicationAccess | null> {
    const applicationAccessEntity = await manager.findOne(
      ApplicationAccessEntity,
      {
        where: { id, deletedAt: null },
      },
    );
    return applicationAccessEntity
      ? this.toModel(applicationAccessEntity)
      : null;
  }

  async findAll(): Promise<ApplicationAccess[]> {
    return await this.applicationAccessRepo.find({
      where: { deletedAt: null },
    });
  }

  async findByDesc(desc1: string): Promise<ApplicationAccess> {
    const userRoleEntity = await this.applicationAccessRepo.findOne({
      where: { desc1, deletedAt: null },
    });
    return userRoleEntity ? this.toModel(userRoleEntity) : null;
  }

  // Helper: Convert domain model to TypeORM entity
  private toEntity(
    applicationAccess: ApplicationAccess,
  ): ApplicationAccessEntity {
    const entity = new ApplicationAccessEntity();
    entity.id = applicationAccess.id;
    entity.desc1 = applicationAccess.desc1;
    entity.deletedAt = applicationAccess.deletedAt;
    return entity;
  }

  // Helper: Convert TypeORM entity to domain model
  private toModel(entity: ApplicationAccessEntity): ApplicationAccess {
    return new ApplicationAccess({
      id: entity.id,
      desc1: entity.desc1,
      deletedAt: entity.deletedAt,
    });
  }
}
