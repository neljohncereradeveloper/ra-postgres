import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { calculatePagination } from '@shared/utils/pagination.util';
import { PositionRepository } from '@domains/repositories/position.repository';
import { PositionEntity } from '../entities/position.entity';
import { Position } from '@domain/models/position.model';
import { PaginationMeta } from '@shared/interfaces/pagination.interface';

@Injectable()
export class PositionRepositoryImpl
  implements PositionRepository<EntityManager>
{
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepo: Repository<PositionEntity>,
  ) {}

  async create(position: Position, manager: EntityManager): Promise<Position> {
    try {
      const positionEntity = this.toEntity(position);
      const savedEntity = await manager.save(PositionEntity, positionEntity);
      return this.toModel(savedEntity);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Position name already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateFields: Partial<Position>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const result: UpdateResult = await manager.update(
        PositionEntity,
        id,
        updateFields,
      );
      return result.affected && result.affected > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Position name already exists');
      }
      throw error;
    }
  }

  async softDelete(id: number, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(PositionEntity)
      .set({ deletedAt: new Date() })
      .where('id = :id AND deletedAt IS NULL', { id })
      .execute();

    return result.affected > 0;
  }

  async restoreDeleted(id: number, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(PositionEntity)
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
    data: Position[];
    meta: PaginationMeta;
  }> {
    const skip = (page - 1) * limit;

    // Build the query
    const queryBuilder = manager
      .createQueryBuilder(PositionEntity, 'positions')
      .withDeleted();

    // Filter by deletion status
    if (isDeleted) {
      queryBuilder.where('positions.deletedAt IS NOT NULL');
    } else {
      queryBuilder.where('positions.deletedAt IS NULL');
    }

    // Apply search filter on description
    if (term) {
      queryBuilder.andWhere('LOWER(positions.desc1) LIKE :term', {
        term: `%${term.toLowerCase()}%`,
      });
    }

    queryBuilder.andWhere('positions.electionId = :electionId', {
      electionId,
    });

    // Clone the query to get the count of records (avoiding pagination in the count query)
    const countQuery = queryBuilder
      .clone()
      .select('COUNT(positions.id)', 'totalRecords');

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

  async findById(id: number, manager: EntityManager): Promise<Position | null> {
    const positionEntity = await manager.findOne(PositionEntity, {
      where: { id, deletedAt: null },
    });
    return positionEntity ? this.toModel(positionEntity) : null;
  }

  async findByDescriptionWithElectionId(
    desc1: string,
    electionId: number,
    manager: EntityManager,
  ): Promise<Position | null> {
    const positionEntity = await manager.findOne(PositionEntity, {
      where: { desc1, deletedAt: null, electionId },
    });
    return positionEntity ? this.toModel(positionEntity) : null;
  }

  async findAllWithElectionId(
    electionId: number,
    manager: EntityManager,
  ): Promise<Position[]> {
    return await manager.find(PositionEntity, {
      where: { deletedAt: null, electionId },
    });
  }

  async findByElectionId(
    electionId: number,
    manager: EntityManager,
  ): Promise<Position[]> {
    const positionEntities = await manager.find(PositionEntity, {
      where: { deletedAt: null, electionId },
    });

    return positionEntities.map((entity) => this.toModel(entity));
  }

  async countByElectionId(
    electionId: number,
    manager: EntityManager,
  ): Promise<number> {
    const count = await manager
      .createQueryBuilder(PositionEntity, 'positions')
      .where('positions.deletedAt IS NULL')
      .andWhere('positions.electionId = :electionId', { electionId })
      .getCount();

    return count;
  }

  // Helper: Convert domain model to TypeORM entity
  private toEntity(position: Position): PositionEntity {
    const entity = new PositionEntity();
    entity.id = position.id;
    entity.desc1 = position.desc1;
    entity.maxCandidates = position.maxCandidates;
    entity.termLimit = position.termLimit;
    entity.deletedAt = position.deletedAt;
    entity.electionId = position.electionId;
    return entity;
  }

  // Helper: Convert TypeORM entity to domain model
  private toModel(entity: PositionEntity): Position {
    return new Position({
      id: entity.id,
      desc1: entity.desc1,
      maxCandidates: entity.maxCandidates,
      termLimit: entity.termLimit,
      deletedAt: entity.deletedAt,
      electionId: entity.electionId,
    });
  }
}
