import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { UserRoleEntity } from '../entities/user-role.entity';
import { UserRole } from '@domain/models/user-role.model';
import { UserRoleRepository } from '@domains/repositories/user-role.repository';

@Injectable()
export class UserRoleRepositoryImpl
  implements UserRoleRepository<EntityManager>
{
  constructor(
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepo: Repository<UserRoleEntity>,
  ) {}

  async createWithManager(
    userRole: UserRole,
    manager: EntityManager,
  ): Promise<UserRole> {
    try {
      const userRoleEntity = this.toEntity(userRole);
      const savedEntity = await manager.save(UserRoleEntity, userRoleEntity);
      return this.toModel(savedEntity);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Userrole already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateFields: Partial<UserRole>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const result: UpdateResult = await manager.update(
        UserRoleEntity,
        id,
        updateFields,
      );
      return result.affected && result.affected > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Userrole already exists');
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
      .update(UserRoleEntity)
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
      .update(UserRoleEntity)
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
    data: UserRole[];
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
    const queryBuilder = this.userRoleRepo
      .createQueryBuilder('userroles')
      .withDeleted();

    // Select only the required fields
    queryBuilder.select(['userroles.id as id', 'userroles.desc1 as desc1']);

    // Filter by deletion status
    if (isDeleted) {
      queryBuilder.where('userroles.deletedAt IS NOT NULL');
    } else {
      queryBuilder.where('userroles.deletedAt IS NULL');
    }

    // Apply search filter on description
    if (term) {
      queryBuilder.andWhere('LOWER(userroles.name) LIKE :term', {
        term: '%{term.toLowerCase()}%',
      });
    }

    // Clone the query to get the count of records (avoiding pagination in the count query)
    const countQuery = queryBuilder
      .clone()
      .select('COUNT(userroles.id)', 'totalRecords');

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

  async findById(id: number, manager: EntityManager): Promise<UserRole | null> {
    const userRoleEntity = await manager.findOne(UserRoleEntity, {
      where: { id, deletedAt: null },
    });
    return userRoleEntity ? this.toModel(userRoleEntity) : null;
  }

  async combobox(): Promise<UserRole[]> {
    return await this.userRoleRepo.find({
      where: { deletedAt: null },
    });
  }

  async findByDesc(desc1: string): Promise<UserRole> {
    const userRoleEntity = await this.userRoleRepo.findOne({
      where: { desc1, deletedAt: null },
    });
    return userRoleEntity ? this.toModel(userRoleEntity) : null;
  }

  // Helper: Convert domain model to TypeORM entity
  private toEntity(userRole: UserRole): UserRoleEntity {
    const entity = new UserRoleEntity();
    entity.id = userRole.id;
    entity.desc1 = userRole.desc1;
    entity.deletedAt = userRole.deletedAt;
    return entity;
  }

  // Helper: Convert TypeORM entity to domain model
  private toModel(entity: UserRoleEntity): UserRole {
    return new UserRole({
      id: entity.id,
      desc1: entity.desc1,
      deletedAt: entity.deletedAt,
    });
  }
}
