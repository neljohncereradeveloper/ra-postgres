import { District } from '@domain/models/district.model';

export interface DistrictRepository<Context = unknown> {
  create(district: District, context?: Context): Promise<District>;
  update(
    id: number,
    updateData: Partial<District>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<District>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
    electionId: number,
    context?: Context,
  ): Promise<{
    data: District[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(
    desc1: string,
    electionId: number,
    context?: Context,
  ): Promise<District | null>;
  combobox(electionId: number, context?: Context): Promise<District[]>;
  countByElection(electionId: number, context?: Context): Promise<number>;
}
