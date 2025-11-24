import { User } from '@domain/models/user.model';

export interface UserRepository<Context = unknown> {
  createWithManager(user: User, context?: Context): Promise<User>;
  updateWithManager(
    id: number,
    updateData: Partial<User>,
    context?: Context,
  ): Promise<boolean>;
  softDeleteWithManager(id: number, context?: Context): Promise<boolean>;
  restoreWithManager(id: number, context?: Context): Promise<boolean>;
  findByIdWithManager(id: number, context?: Context): Promise<User>;
  findWithFilters(
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
  }>;
  findById(id: number): Promise<User>;
  findAll(): Promise<User[]>;
  findByUserName(userName: string): Promise<User>;
}
