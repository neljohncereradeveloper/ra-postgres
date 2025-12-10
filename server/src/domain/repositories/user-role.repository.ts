import { UserRole } from '@domain/models/user-role.model';

export interface UserRoleRepository<Context = unknown> {
  create(userRole: UserRole, context?: Context): Promise<UserRole>;
  update(
    id: number,
    update_data: Partial<UserRole>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<UserRole>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<{
    data: UserRole[];
    meta: {
      page: number;
      limit: number;
      total_records: number;
      total_pages: number;
      next_page: number | null;
      previous_page: number | null;
    };
  }>;
  findByDesc(desc1: string): Promise<UserRole>;
  combobox(): Promise<UserRole[]>;
}
