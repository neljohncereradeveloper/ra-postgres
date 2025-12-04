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

  async findPaginatedList(
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

    // Build WHERE conditions
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    // Filter by deletion status
    if (isDeleted) {
      whereConditions.push('d.deleted_at IS NOT NULL');
    } else {
      whereConditions.push('d.deleted_at IS NULL');
    }

    // Filter by election ID
    whereConditions.push('d.election_id = ?');
    queryParams.push(electionId);

    // Apply search filter on account name
    if (term) {
      whereConditions.push('LOWER(d.account_name) LIKE ?');
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Build data query
    const dataQuery = `
      SELECT 
        d.id AS id,
        d.branch AS branch,
        d.account_id AS accountId,
        d.account_name AS accountName,
        d.age AS age,
        d.birth_date AS birthDate,
        d.address AS address,
        d.tell AS tell,
        d.cell AS cell,
        d.date_opened AS dateOpened,
        d.client_type AS clientType,
        d.balance AS balance,
        d.loan_status AS loanStatus,
        d.mev_status AS mevStatus,
        d.deleted_at AS deletedAt,
        d.election_id AS electionId,
        e.name AS election,
        d.has_voted AS hasVoted,
        d.control_number AS controlNumber
      FROM delegates d
      INNER JOIN elections e ON d.election_id = e.id
      WHERE ${whereClause}
      ORDER BY d.account_name ASC
      LIMIT ? OFFSET ?
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(d.id) AS totalRecords
      FROM delegates d
      INNER JOIN elections e ON d.election_id = e.id
      WHERE ${whereClause}
    `;

    // Execute both queries simultaneously
    const [dataRows, countResult] = await Promise.all([
      manager.query(dataQuery, [...queryParams, limit, skip]),
      manager.query(countQuery, queryParams),
    ]);

    // Extract total records
    const totalRecords = parseInt(countResult[0]?.totalRecords || '0', 10);

    // Map raw results to domain models
    const data = dataRows.map((row: any) => {
      const entity = new DelegateEntity();
      entity.id = row.id;
      entity.branch = row.branch;
      entity.accountId = row.accountId;
      entity.accountName = row.accountName;
      entity.age = row.age;
      entity.birthDate = row.birthDate;
      entity.address = row.address;
      entity.tell = row.tell;
      entity.cell = row.cell;
      entity.dateOpened = row.dateOpened;
      entity.clientType = row.clientType;
      entity.balance = row.balance;
      entity.loanStatus = row.loanStatus;
      entity.mevStatus = row.mevStatus;
      entity.deletedAt = row.deletedAt;
      entity.electionId = row.electionId;
      entity.hasVoted = row.hasVoted;
      entity.controlNumber = row.controlNumber;
      return this.toModel(entity);
    });

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

  // async findAllWithElectionId(
  //   electionId: number,
  //   manager: EntityManager,
  // ): Promise<Delegate[]> {
  //   return await manager.find(DelegateEntity, {
  //     where: { electionId, deletedAt: null },
  //   });
  // }

  async findByControlNumberAndElectionId(
    controlNumber: string,
    electionId: number,
    manager: EntityManager,
  ): Promise<Delegate> {
    const delegateEntity = await manager.findOne(DelegateEntity, {
      where: { controlNumber, electionId, deletedAt: null },
    });
    return delegateEntity ? this.toModel(delegateEntity) : null;
  }

  // async findByAccountIdWithElectionId(
  //   accountId: string,
  //   electionId: number,
  //   manager: EntityManager,
  // ): Promise<Delegate> {
  //   const delegateEntity = await manager.findOne(DelegateEntity, {
  //     where: { accountId, electionId, deletedAt: null },
  //   });
  //   return delegateEntity ? this.toModel(delegateEntity) : null;
  // }

  async countByElection(
    electionId: number,
    manager: EntityManager,
  ): Promise<number> {
    const countQuery = `
      SELECT COUNT(id) AS count
      FROM delegates
      WHERE deleted_at IS NULL
      AND election_id = ?
    `;

    const result = await manager.query(countQuery, [electionId]);
    return parseInt(result[0]?.count || '0', 10);
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
