import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager, UpdateResult } from 'typeorm';
import { calculatePagination } from '@shared/utils/pagination.util';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { CandidateEntity } from '../entities/candidate.entity';
import { Candidate } from '@domain/models/candidate.model';
import { PaginationMeta } from '@shared/interfaces/pagination.interface';

@Injectable()
export class CandidateRepositoryImpl
  implements CandidateRepository<EntityManager>
{
  constructor() {}

  async create(
    candidate: Candidate,
    manager: EntityManager,
  ): Promise<Candidate> {
    try {
      const candidateEntity = this.toEntity(candidate);
      const savedEntity = await manager.save(CandidateEntity, candidateEntity);
      return this.toModel(savedEntity);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'Candidate name already exists in the current election',
        );
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateFields: Partial<Candidate>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const result: UpdateResult = await manager.update(
        CandidateEntity,
        id,
        updateFields,
      );
      return result.affected && result.affected > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Candidate name already exists');
      }
      throw error;
    }
  }

  async softDelete(id: number, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(CandidateEntity)
      .set({ deletedAt: new Date() })
      .where('id = :id AND deletedAt IS NULL', { id })
      .execute();

    return result.affected > 0;
  }

  async restoreDeleted(id: number, manager: EntityManager): Promise<boolean> {
    const result = await manager
      .createQueryBuilder()
      .update(CandidateEntity)
      .set({ deletedAt: null }) // Restore by clearing deletedAt
      .where('id = :id AND deletedAt IS NOT NULL', { id }) // Restore only if soft-deleted
      .execute();

    return result.affected > 0; // Return true if a row was restored
  }

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<Candidate | null> {
    const queryBuilder = manager
      .createQueryBuilder(CandidateEntity, 'candidates')
      .leftJoinAndSelect('candidates.position', 'positions')
      .leftJoinAndSelect('candidates.district', 'districts')
      .leftJoinAndSelect('candidates.election', 'elections')
      .leftJoinAndSelect('candidates.delegate', 'delegates')
      .select([
        'candidates.id as id',
        'candidates.electionId as electionId',
        'candidates.positionId as positionId',
        'candidates.districtId as districtId',
        'candidates.delegateId as delegateId',
        'candidates.displayName as displayName',
        'delegates.accountId as accountId',
        'delegates.accountName as accountName',
        'positions.desc1 AS position',
        'districts.desc1 AS district',
        'elections.name AS election',
      ])
      .where('candidates.id = :id', { id })
      .andWhere('candidates.deletedAt IS NULL')
      .getRawOne();

    const candidateEntity = await queryBuilder;

    return candidateEntity ? candidateEntity : null;
  }

  async findPaginatedListWithElectionId(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
    electionId: number,
    manager: EntityManager,
  ): Promise<{
    data: any[];
    meta: PaginationMeta;
  }> {
    const skip = (page - 1) * limit;

    // Build the query
    const queryBuilder = manager
      .createQueryBuilder(CandidateEntity, 'candidates')
      .leftJoinAndSelect('candidates.position', 'positions')
      .leftJoinAndSelect('candidates.district', 'districts')
      .leftJoinAndSelect('candidates.election', 'elections')
      .leftJoinAndSelect('candidates.delegate', 'delegates')
      .withDeleted();

    queryBuilder.select([
      'candidates.id as id',
      'candidates.delegateId as delegateId',
      'candidates.displayName as displayName',
      'delegates.accountId as accountId',
      'delegates.accountName as accountName',
      'positions.desc1 AS position',
      'districts.desc1 AS district',
      'elections.name AS election',
    ]);

    // Filter by deletion status
    if (isDeleted) {
      queryBuilder.where('candidates.deletedAt IS NOT NULL');
    } else {
      queryBuilder.where('candidates.deletedAt IS NULL');
    }

    // Apply search filter on description
    if (term) {
      queryBuilder.andWhere('LOWER(candidates.displayName) LIKE :term', {
        term: `%${term.toLowerCase()}%`,
      });
    }

    queryBuilder.andWhere('candidates.electionId = :electionId', {
      electionId,
    });

    // Clone the query to get the count of records (avoiding pagination in the count query)
    const countQuery = queryBuilder
      .clone()
      .select('COUNT(candidates.id)', 'totalRecords');

    // Execute both data and count queries simultaneously
    const [data, countResult] = await Promise.all([
      queryBuilder.offset(skip).limit(limit).getRawMany(),
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

  async countByElection(
    electionId: number,
    manager: EntityManager,
  ): Promise<number> {
    const count = await manager
      .createQueryBuilder(CandidateEntity, 'candidates')
      .where('candidates.deletedAt IS NULL')
      .andWhere('candidates.electionId = :electionId', { electionId })
      .getCount();

    return count;
  }

  async getCastVoteCandidates(
    electionId: number,
    manager: EntityManager,
  ): Promise<any[]> {
    const candidates = await manager
      .createQueryBuilder(CandidateEntity, 'candidates')
      .leftJoinAndSelect('candidates.position', 'positions')
      .leftJoinAndSelect('candidates.district', 'districts')
      .leftJoinAndSelect('candidates.election', 'elections')
      .leftJoinAndSelect('candidates.delegate', 'delegates')
      .select([
        'positions.desc1 AS position',
        'positions.maxCandidates AS positionMaxCandidates',
        'positions.termLimit AS positionTermLimit',
        // 'districts.desc1 AS district',
        'candidates.id as candidateId',
        'candidates.displayName as displayName',
      ])
      .where('candidates.deletedAt IS NULL')
      .andWhere('candidates.electionId = :electionId', { electionId })
      .getRawMany();

    return candidates;
  }

  // Helper: Convert domain model to TypeORM entity
  private toEntity(candidate: Candidate): CandidateEntity {
    const entity = new CandidateEntity();
    entity.id = candidate.id;
    entity.delegateId = candidate.delegateId;
    entity.positionId = candidate.positionId;
    entity.districtId = candidate.districtId;
    entity.electionId = candidate.electionId;
    entity.displayName = candidate.displayName;
    entity.deletedAt = candidate.deletedAt;
    return entity;
  }

  // Helper: Convert TypeORM entity to domain model
  private toModel(entity: CandidateEntity): Candidate {
    return new Candidate({
      id: entity.id,
      delegateId: entity.delegateId,
      positionId: entity.positionId,
      districtId: entity.districtId,
      electionId: entity.electionId,
      displayName: entity.displayName,
      deletedAt: entity.deletedAt,
    });
  }
}
