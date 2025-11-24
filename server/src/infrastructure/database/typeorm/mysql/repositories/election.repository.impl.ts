import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { calculatePagination } from '@shared/utils/pagination.util';
import { ElectionEntity } from '../entities/election.entity';
import { ElectionMapper } from '../mappers/election.mapper';
import { Election } from '@domain/models/election.model';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { PaginationMeta } from '@shared/interfaces/pagination.interface';

@Injectable()
export class ElectionRepositoryImpl
  implements ElectionRepository<EntityManager>
{
  constructor(
    @InjectRepository(ElectionEntity)
    private readonly electionRepo: Repository<ElectionEntity>,
  ) {}

  async create(election: Election, manager: EntityManager): Promise<Election> {
    try {
      const electionEntity = this.toEntity(election);
      const savedEntity = await manager.save(ElectionEntity, electionEntity);

      return this.toModel(savedEntity);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Election name already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateFields: Partial<Election>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const result: UpdateResult = await manager.update(
        ElectionEntity,
        id,
        updateFields,
      );
      return result.affected && result.affected > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Election name already exists');
      }
      throw error;
    }
  }

  async softDelete(id: number, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(ElectionEntity)
      .set({ deletedAt: new Date() })
      .where('id = :id AND deletedAt IS NULL', { id })
      .execute();

    return result.affected > 0;
  }

  async restoreDeleted(id: number, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(ElectionEntity)
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
  ): Promise<{
    data: Election[];
    meta: PaginationMeta;
  }> {
    const skip = (page - 1) * limit;

    // Build the query
    const queryBuilder = this.electionRepo
      .createQueryBuilder('elections')
      .withDeleted();

    // Select only the required fields
    queryBuilder.select([
      'elections.id AS id',
      'elections.name AS name',
      'elections.desc1 AS desc1',
      'elections.address AS address',
      'elections.date AS date',
      'elections.status AS status',
      'elections.startTime AS startTime',
      'elections.endTime AS endTime',
      'elections.maxAttendees AS maxAttendees',
      'elections.deletedAt AS deletedAt',
    ]);

    // Filter by deletion status
    if (isDeleted) {
      queryBuilder.where('elections.deletedAt IS NOT NULL');
    } else {
      queryBuilder.where('elections.deletedAt IS NULL');
    }

    // Apply search filter on description
    if (term) {
      queryBuilder.andWhere('LOWER(elections.name) LIKE :term', {
        term: `%${term.toLowerCase()}%`,
      });
    }

    // Clone the query to get the count of records (avoiding pagination in the count query)
    const countQuery = queryBuilder
      .clone()
      .select('COUNT(elections.id)', 'totalRecords');

    // Execute both data and count queries simultaneously
    const [data, countResult] = await Promise.all([
      queryBuilder.offset(skip).limit(limit).getRawMany(), // Fetch the paginated data
      countQuery.getRawOne(),
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

  async findById(
    id: number,
    manager?: EntityManager,
  ): Promise<Election | null> {
    const electionEntity = await manager.findOne(ElectionEntity, {
      where: { id, deletedAt: null },
    });
    return electionEntity ? this.toModel(electionEntity) : null;
  }

  async findByIdNoneTransaction(id: number): Promise<any | null> {
    const electionEntity = await this.electionRepo
      .createQueryBuilder('elections')
      .withDeleted()
      .where('elections.id = :id', { id })
      .andWhere('elections.deletedAt IS NULL')
      .getOne();

    if (!electionEntity) return null;

    return {
      id: electionEntity.id,
      name: electionEntity.name,
      desc1: electionEntity.desc1,
      address: electionEntity.address,
      date: electionEntity.date,
      startTime: electionEntity.startTime,
      endTime: electionEntity.endTime,
      maxAttendees: electionEntity.maxAttendees,
      status: electionEntity.status,
      deletedAt: electionEntity.deletedAt,
    };
  }

  async findAll(): Promise<Election[]> {
    const electionEntities = await this.electionRepo.find({
      where: { deletedAt: null },
    });

    // Map the entities to domain models
    return ElectionMapper.toDomainList(electionEntities);
  }

  async retrieveScheduledElections(): Promise<Election[]> {
    const electionEntities = await this.electionRepo.find({
      where: { deletedAt: null },
    });
    return ElectionMapper.toDomainList(electionEntities);
  }

  async findByName(
    name: string,
    manager: EntityManager,
  ): Promise<Election | null> {
    const electionEntity = await manager.findOne(ElectionEntity, {
      where: { name, deletedAt: null },
    });
    return electionEntity ? this.toModel(electionEntity) : null;
  }

  // Helper: Convert domain model to TypeORM entity
  private toEntity(election: Election): ElectionEntity {
    const entity = new ElectionEntity();
    entity.id = election.id;
    entity.name = election.name;
    entity.desc1 = election.desc1;
    entity.address = election.address;
    entity.date = election.date;
    entity.startTime = election.startTime;
    entity.endTime = election.endTime;
    entity.maxAttendees = election.maxAttendees;
    entity.status = election.status;
    entity.deletedAt = election.deletedAt;
    return entity;
  }

  // Helper: Convert TypeORM entity to domain model
  private toModel(entity: ElectionEntity): Election {
    return new Election({
      id: entity.id,
      name: entity.name,
      desc1: entity.desc1,
      address: entity.address,
      date: entity.date,
      startTime: entity.startTime,
      endTime: entity.endTime,
      maxAttendees: entity.maxAttendees,
      status: entity.status,
      deletedAt: entity.deletedAt,
    });
  }
}
