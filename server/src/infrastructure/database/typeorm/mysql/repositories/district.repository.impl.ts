import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { DistrictEntity } from '../entities/district.entity';
import { District } from '@domain/models/district.model';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { PaginationMeta } from '@shared/interfaces/pagination.interface';
import { calculatePagination } from '@shared/utils/pagination.util';

@Injectable()
export class DistrictRepositoryImpl
  implements DistrictRepository<EntityManager>
{
  constructor(
    @InjectRepository(DistrictEntity)
    private readonly districtRepo: Repository<DistrictEntity>,
  ) {}

  async create(district: District, manager: EntityManager): Promise<District> {
    try {
      const districtEntity = this.toEntity(district);
      const savedEntity = await manager.save(DistrictEntity, districtEntity);
      return this.toModel(savedEntity);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('District name already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateFields: Partial<District>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const result: UpdateResult = await manager.update(
        DistrictEntity,
        id,
        updateFields,
      );
      return result.affected && result.affected > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('District name already exists');
      }
      throw error;
    }
  }

  async softDelete(id: number, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(DistrictEntity)
      .set({ deletedAt: new Date() })
      .where('id = :id AND deletedAt IS NULL', { id })
      .execute();

    return result.affected > 0;
  }

  async restoreDeleted(id: number, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(DistrictEntity)
      .set({ deletedAt: null }) // Restore by clearing deletedAt
      .where('id = :id AND deletedAt IS NOT NULL', { id }) // Restore only if soft-deleted
      .execute();

    return result.affected > 0; // Return true if a row was restored
  }

  async findPaginatedListWithElectionId(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
    electionId: number,
    manager: EntityManager,
  ): Promise<{
    data: District[];
    meta: PaginationMeta;
  }> {
    const skip = (page - 1) * limit;

    // Build the query
    const queryBuilder = manager
      .createQueryBuilder(DistrictEntity, 'districts')
      .withDeleted();

    // Filter by deletion status
    if (isDeleted) {
      queryBuilder.where('districts.deletedAt IS NOT NULL');
    } else {
      queryBuilder.where('districts.deletedAt IS NULL');
    }

    // Apply search filter on description
    if (term) {
      queryBuilder.andWhere('LOWER(districts.desc1) LIKE :term', {
        term: `%${term.toLowerCase()}%`,
      });
    }

    queryBuilder.andWhere('districts.electionId = :electionId', {
      electionId,
    });

    // Clone the query to get the count of records (avoiding pagination in the count query)
    const countQuery = queryBuilder
      .clone()
      .select('COUNT(districts.id)', 'totalRecords');

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

  async findById(id: number, manager: EntityManager): Promise<District | null> {
    const districtEntity = await manager.findOne(DistrictEntity, {
      where: { id, deletedAt: null },
    });
    return districtEntity ? this.toModel(districtEntity) : null;
  }

  async findByDescriptionWithElectionId(
    desc1: string,
    electionId: number,
    manager: EntityManager,
  ): Promise<District | null> {
    const districtEntity = await manager.findOne(DistrictEntity, {
      where: { desc1, electionId, deletedAt: null },
    });
    return districtEntity ? this.toModel(districtEntity) : null;
  }

  async findAllWithElectionId(
    electionId: number,
    manager: EntityManager,
  ): Promise<District[]> {
    return await manager.find(DistrictEntity, {
      where: { electionId, deletedAt: null },
    });
  }

  async countByElectionId(
    electionId: number,
    manager: EntityManager,
  ): Promise<number> {
    const count = await manager
      .createQueryBuilder(DistrictEntity, 'districts')
      .where('districts.deletedAt IS NULL')
      .andWhere('districts.electionId = :electionId', { electionId })
      .getCount();

    return count;
  }

  // Helper: Convert domain model to TypeORM entity
  private toEntity(district: District): DistrictEntity {
    const entity = new DistrictEntity();
    entity.id = district.id;
    entity.desc1 = district.desc1;
    entity.deletedAt = district.deletedAt;
    entity.electionId = district.electionId;
    return entity;
  }

  // Helper: Convert TypeORM entity to domain model
  private toModel(entity: DistrictEntity): District {
    return new District({
      id: entity.id,
      desc1: entity.desc1,
      deletedAt: entity.deletedAt,
      electionId: entity.electionId,
    });
  }
}
