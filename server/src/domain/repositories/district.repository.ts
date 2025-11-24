import { District } from '@domain/models/district.model';

export interface DistrictRepository<Context = unknown> {
  create(district: District, context?: Context): Promise<District>;
  update(
    id: number,
    updateData: Partial<District>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, context?: Context): Promise<boolean>;
  restoreDeleted(id: number, context?: Context): Promise<boolean>;
  findById(id: number, context?: Context): Promise<District>;
  findPaginatedListWithElectionId(
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
  findByDescriptionWithElectionId(
    desc1: string,
    electionId: number,
    context?: Context,
  ): Promise<District | null>;
  findAllWithElectionId(
    electionId: number,
    context?: Context,
  ): Promise<District[]>;
  countByElectionId(electionId: number, context?: Context): Promise<number>;
}
