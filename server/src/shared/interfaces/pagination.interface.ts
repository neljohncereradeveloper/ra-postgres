export interface PaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
}
