import { UserRole } from '@domain/models/user-role.model';

export interface UserRoleRepository<Context = unknown> {
  create(userRole: UserRole, context?: Context): Promise<UserRole>;
  update(
    id: number,
    updateData: Partial<UserRole>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<UserRole>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    isArchived: boolean,
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
  }>;
  findByDesc(desc1: string): Promise<UserRole>;
  combobox(): Promise<UserRole[]>;
}
