import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { PaginationMeta } from '@shared/interfaces/pagination.interface';
import { calculatePagination } from '@shared/utils/pagination.util';
import { PrecinctRepository } from '@domains/repositories/precinct.repository';
import { PrecinctEntity } from '../entities/precinct.entity';
import { Precinct } from '@domain/models/precinct.model';

@Injectable()
export class PrecinctRepositoryImpl
  implements PrecinctRepository<EntityManager>
{
  constructor(
    @InjectRepository(PrecinctEntity)
    private readonly precinctRepo: Repository<PrecinctEntity>,
  ) {}

  async create(precinct: Precinct, manager: EntityManager): Promise<Precinct> {
    try {
      const precinctEntity = this.toEntity(precinct);
      const savedEntity = await manager.save(PrecinctEntity, precinctEntity);
      return this.toModel(savedEntity);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Precinct name already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateFields: Partial<Precinct>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const result: UpdateResult = await manager.update(
        PrecinctEntity,
        id,
        updateFields,
      );
      return result.affected && result.affected > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Precinct name already exists');
      }
      throw error;
    }
  }

  async softDelete(id: number, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(PrecinctEntity)
      .set({ deletedAt: new Date() })
      .where('id = :id AND deletedAt IS NULL', { id })
      .execute();

    return result.affected > 0;
  }

  async restoreDeleted(id: number, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(PrecinctEntity)
      .set({ deletedAt: null }) // Restore by clearing deletedAt
      .where('id = :id AND deletedAt IS NOT NULL', { id }) // Restore only if soft-deleted
      .execute();

    return result.affected > 0; // Return true if a row was restored
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
    manager: EntityManager,
  ): Promise<{
    data: Precinct[];
    meta: PaginationMeta;
  }> {
    const skip = (page - 1) * limit;

    // Build the query
    const queryBuilder = manager
      .createQueryBuilder(PrecinctEntity, 'precincts')
      .withDeleted();

    // Filter by deletion status
    if (isDeleted) {
      queryBuilder.where('precincts.deletedAt IS NOT NULL');
    } else {
      queryBuilder.where('precincts.deletedAt IS NULL');
    }

    // Apply search filter on description
    if (term) {
      queryBuilder.andWhere('LOWER(precincts.desc1) LIKE :term', {
        term: `%${term.toLowerCase()}%`,
      });
    }

    // Clone the query to get the count of records (avoiding pagination in the count query)
    const countQuery = queryBuilder
      .clone()
      .select('COUNT(precincts.id)', 'totalRecords');

    // Execute both data and count queries simultaneously
    const [data, countResult] = await Promise.all([
      queryBuilder.offset(skip).limit(limit).getMany(), // Fetch the paginated data
      countQuery.getRawOne(), // Fetch the total count of records
    ]);

    // Extract total records
    const totalRecords = parseInt(countResult?.totalRecords || '0', 10);
    const { totalPages, nextPage, previousPage } = calculatePagination(
      totalRecords,
      page,
      limit,
    );

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

  async findById(id: number, manager: EntityManager): Promise<Precinct | null> {
    const precinctEntity = await manager.findOne(PrecinctEntity, {
      where: { id, deletedAt: null },
    });
    return precinctEntity ? this.toModel(precinctEntity) : null;
  }

  async findByDescription(
    desc1: string,
    manager: EntityManager,
  ): Promise<Precinct | null> {
    const precinctEntity = await manager.findOne(PrecinctEntity, {
      where: { desc1, deletedAt: null },
    });
    return precinctEntity ? this.toModel(precinctEntity) : null;
  }

  async findAll(manager: EntityManager): Promise<Precinct[]> {
    return await manager.find(PrecinctEntity, {
      where: { deletedAt: null },
    });
  }

  // Helper: Convert domain model to TypeORM entity
  private toEntity(precinct: Precinct): PrecinctEntity {
    const entity = new PrecinctEntity();
    entity.id = precinct.id;
    entity.desc1 = precinct.desc1;
    entity.deletedAt = precinct.deletedAt;
    return entity;
  }

  // Helper: Convert TypeORM entity to domain model
  private toModel(entity: PrecinctEntity): Precinct {
    return new Precinct({
      id: entity.id,
      desc1: entity.desc1,
      deletedAt: entity.deletedAt,
    });
  }
}
