import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { User } from '@domain/models/user.model';
import { UserRepository } from '@domains/repositories/user.repository';

@Injectable()
export class UserRepositoryImpl implements UserRepository<EntityManager> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async createWithManager(user: User, manager: EntityManager): Promise<User> {
    try {
      const userEntity = this.toEntity(user);
      const savedEntity = await manager.save(UserEntity, userEntity);
      return this.toModel(savedEntity);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Username already exists');
      }
      throw error;
    }
  }

  async updateWithManager(
    id: number,
    updateFields: Partial<User>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const result: UpdateResult = await manager.update(
        UserEntity,
        id,
        updateFields,
      );
      return result.affected && result.affected > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Username already exists');
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
      .update(UserEntity)
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
      .update(UserEntity)
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
    data: User[];
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
    const queryBuilder = this.userRepo
      .createQueryBuilder('users')
      .withDeleted();

    // Select only the required fields
    queryBuilder.select([
      'users.id',
      'users.precinct as precinct',
      'users.watcher as watcher',
      'users.applicationAccess as applicationAccess',
      'users.userRoles as userRoles',
      'users.userName as userName',
      'users.deletedAt as deletedAt',
    ]);

    // Filter by deletion status
    if (isDeleted) {
      queryBuilder.where('users.deletedAt IS NOT NULL');
    } else {
      queryBuilder.where('users.deletedAt IS NULL');
    }

    // Apply search filter on description
    if (term) {
      queryBuilder.andWhere('LOWER(users.watcher) LIKE :term', {
        term: `%${term.toLowerCase()}%`,
      });
    }

    // Clone the query to get the count of records (avoiding pagination in the count query)
    const countQuery = queryBuilder
      .clone()
      .select('COUNT(users.id)', 'totalRecords');

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

  async findById(id: number): Promise<User | null> {
    const userEntity = await this.userRepo.findOne({
      where: { id, deletedAt: null },
    });
    return userEntity ? this.toModel(userEntity) : null;
  }

  async findByIdWithManager(
    id: number,
    manager: EntityManager,
  ): Promise<User | null> {
    const userEntity = await manager.findOne(UserEntity, {
      where: { id, deletedAt: null },
    });
    return userEntity ? this.toModel(userEntity) : null;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepo.find({
      where: { deletedAt: null },
    });
  }

  async findByUserName(userName: string): Promise<User | null> {
    const userEntity = await this.userRepo.findOne({
      where: { userName },
      select: [
        'id',
        'userName',
        'password',
        'userRoles',
        'applicationAccess',
        'precinct',
      ],
    });

    return userEntity ? this.toModel(userEntity) : null;
  }

  // Helper: Convert domain model to TypeORM entity
  private toEntity(user: User): UserEntity {
    const entity = new UserEntity();
    entity.id = user.id;
    entity.precinct = user.precinct;
    entity.watcher = user.watcher;
    entity.applicationAccess = user.applicationAccess;
    entity.userRoles = user.userRoles;
    entity.userName = user.userName;
    entity.password = user.password;
    entity.deletedAt = user.deletedAt;
    return entity;
  }

  // Helper: Convert TypeORM entity to domain model
  private toModel(entity: UserEntity): User {
    return new User({
      id: entity.id,
      precinct: entity.precinct,
      watcher: entity.watcher,
      userRoles: entity.userRoles,
      applicationAccess: entity.applicationAccess,
      userName: entity.userName,
      password: entity.password,
      deletedAt: entity.deletedAt,
    });
  }
}
