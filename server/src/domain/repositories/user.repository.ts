import { User } from '@domain/models/user.model';

export interface UserRepository<Context = unknown> {
  create(user: User, context?: Context): Promise<User>;
  update(
    id: number,
    update_data: Partial<User>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<User>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<{
    data: User[];
    meta: {
      page: number;
      limit: number;
      total_records: number;
      total_pages: number;
      next_page: number | null;
      previous_page: number | null;
    };
  }>;
  findByUserName(user_name: string): Promise<User>;
}
