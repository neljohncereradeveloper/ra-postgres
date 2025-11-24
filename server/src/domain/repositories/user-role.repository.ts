import { UserRole } from '@domain/models/user-role.model';

export interface UserRoleRepository<Context = unknown> {
  createWithManager(userRole: UserRole, context?: Context): Promise<UserRole>;
  updateWithManager(
    id: number,
    updateData: Partial<UserRole>,
    context?: Context,
  ): Promise<boolean>;
  softDeleteWithManager(id: number, context?: Context): Promise<boolean>;
  restoreWithManager(id: number, context?: Context): Promise<boolean>;
  findByIdWithManager(id: number, context?: Context): Promise<UserRole>;
  findWithFilters(
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
  }>;
  findById(id: number): Promise<UserRole>;
  findByDesc(desc1: string): Promise<UserRole>;
  findAll(): Promise<UserRole[]>;
}
