import { User } from '@domain/models/user.model';

export interface UserRepository<Context = unknown> {
  create(user: User, context?: Context): Promise<User>;
  update(
    id: number,
    updateData: Partial<User>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<User>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    isArchived: boolean,
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
  findByUserName(userName: string): Promise<User>;
}
