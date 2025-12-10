export interface PaginationMeta {
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
  next_page: number | null;
  previous_page: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
