import { District } from '@domain/models/district.model';

export interface DistrictRepository<Context = unknown> {
  create(district: District, context?: Context): Promise<District>;
  update(
    id: number,
    update_data: Partial<District>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<District>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
    election_id: number,
    context?: Context,
  ): Promise<{
    data: District[];
    meta: {
      page: number;
      limit: number;
      total_records: number;
      total_pages: number;
      next_page: number | null;
      previous_page: number | null;
    };
  }>;
  findByDescription(
    desc1: string,
    election_id: number,
    context?: Context,
  ): Promise<District | null>;
  combobox(election_id: number, context?: Context): Promise<District[]>;
  countByElection(election_id: number, context?: Context): Promise<number>;
}
