import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DelegateEntity } from '../entities/delegate.entity';
import { Delegate } from '@domain/models/delegate.model';
import { DelegateRepository } from '@domains/repositories/delegate.repository';

@Injectable()
export class DelegateRepositoryImpl
  implements DelegateRepository<EntityManager>
{
  constructor() {}

  async create(delegate: Delegate, manager: EntityManager): Promise<Delegate> {
    try {
      const delegateEntity = this.toEntity(delegate);
      const savedEntity = await manager.save(DelegateEntity, delegateEntity);
      return this.toModel(savedEntity);
    } catch (error) {
      console.log('error', error);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(error.sqlMessage);
      }
      throw error;
    }
  }

  async findPaginatedWithElectionIdList(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
    electionId: number,
    manager: EntityManager,
  ): Promise<{
    data: Delegate[];
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
    const queryBuilder = manager.createQueryBuilder(
      DelegateEntity,
      'delegates',
    );

    // Join the districts table (inner join)
    queryBuilder.innerJoinAndSelect('delegates.election', 'elections');

    // Select only the required fields
    queryBuilder.select([
      'delegates.id AS id',
      'delegates.branch AS branch',
      'delegates.accountId AS accountId',
      'delegates.accountName AS accountName',
      'delegates.age AS age',
      'delegates.birthDate AS birthDate',
      'delegates.address AS address',
      'delegates.tell AS tell',
      'delegates.cell AS cell',
      'delegates.dateOpened AS dateOpened',
      'delegates.clientType AS clientType',
      'delegates.balance AS balance',
      'delegates.loanStatus AS loanStatus',
      'delegates.mevStatus AS mevStatus',
      'delegates.deletedAt AS deletedAt',
      'delegates.electionId as electionId',
      'elections.name as election',
      'delegates.hasVoted AS hasVoted',
      'delegates.controlNumber AS controlNumber',
    ]);

    // Filter by deletion status
    if (isDeleted) {
      queryBuilder.where('delegates.deletedAt IS NOT NULL');
    } else {
      queryBuilder.where('delegates.deletedAt IS NULL');
    }

    // Apply search filter on description
    if (term) {
      queryBuilder.andWhere('LOWER(delegates.accountName) LIKE :term', {
        term: `%${term.toLowerCase()}%`,
      });
    }

    queryBuilder.andWhere('delegates.electionId = :electionId', {
      electionId,
    });

    // Add ORDER BY clause for consistent pagination
    queryBuilder.orderBy('delegates.accountName', 'ASC'); // Or another unique field

    // Clone the query to get the count of records (avoiding pagination in the count query)
    const countQuery = queryBuilder
      .clone()
      .select('COUNT(delegates.id)', 'totalRecords');

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

  async findById(id: number, manager: EntityManager): Promise<Delegate | null> {
    const delegateEntity = await manager.findOne(DelegateEntity, {
      where: { id, deletedAt: null },
    });
    return delegateEntity ? this.toModel(delegateEntity) : null;
  }

  async findAllWithElectionId(
    electionId: number,
    manager: EntityManager,
  ): Promise<Delegate[]> {
    return await manager.find(DelegateEntity, {
      where: { electionId, deletedAt: null },
    });
  }

  async findByControlNumberWithElectionId(
    controlNumber: string,
    electionId: number,
    manager: EntityManager,
  ): Promise<Delegate> {
    const delegateEntity = await manager.findOne(DelegateEntity, {
      where: { controlNumber, electionId, deletedAt: null },
    });
    return delegateEntity ? this.toModel(delegateEntity) : null;
  }

  async findByAccountIdWithElectionId(
    accountId: string,
    electionId: number,
    manager: EntityManager,
  ): Promise<Delegate> {
    const delegateEntity = await manager.findOne(DelegateEntity, {
      where: { accountId, electionId, deletedAt: null },
    });
    return delegateEntity ? this.toModel(delegateEntity) : null;
  }

  async countByElection(
    electionId: number,
    manager: EntityManager,
  ): Promise<number> {
    const count = await manager
      .createQueryBuilder('delegates', 'delegates')
      .where('delegates.deletedAt IS NULL')
      .andWhere('delegates.electionId = :electionId', { electionId })
      .getCount();

    return count;
  }

  async markAsVoted(delegateId: number, manager: EntityManager): Promise<void> {
    await manager.update(DelegateEntity, delegateId, { hasVoted: true });
  }

  // Helper: Convert domain model to TypeORM entity
  private toEntity(delegate: Delegate): DelegateEntity {
    const entity = new DelegateEntity();
    entity.id = delegate.id;
    entity.branch = delegate.branch;
    entity.electionId = delegate.electionId;
    entity.accountId = delegate.accountId;
    entity.accountName = delegate.accountName;
    entity.age = delegate.age;
    entity.balance = delegate.balance;
    entity.loanStatus = delegate.loanStatus;
    entity.mevStatus = delegate.mevStatus;
    entity.clientType = delegate.clientType;
    entity.address = delegate.address;
    entity.tell = delegate.tell;
    entity.cell = delegate.cell;
    entity.dateOpened = delegate.dateOpened;
    entity.birthDate = delegate.birthDate;
    entity.hasVoted = delegate.hasVoted;
    entity.controlNumber = delegate.controlNumber;
    entity.deletedAt = delegate.deletedAt;
    return entity;
  }

  // Helper: Convert TypeORM entity to domain model
  private toModel(entity: DelegateEntity): Delegate {
    return new Delegate({
      id: entity.id,
      branch: entity.branch,
      electionId: entity.electionId,
      accountId: entity.accountId,
      accountName: entity.accountName,
      age: entity.age,
      balance: entity.balance,
      loanStatus: entity.loanStatus,
      mevStatus: entity.mevStatus,
      clientType: entity.clientType,
      address: entity.address,
      tell: entity.tell,
      cell: entity.cell,
      dateOpened: entity.dateOpened,
      birthDate: entity.birthDate,
      hasVoted: entity.hasVoted,
      controlNumber: entity.controlNumber,
      deletedAt: entity.deletedAt,
    });
  }
}
