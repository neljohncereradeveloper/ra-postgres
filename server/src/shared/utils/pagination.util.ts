export function calculatePagination(
  total_records: number,
  page: number,
  limit: number,
) {
  const total_pages = Math.ceil(total_records / limit);
  const next_page = page < total_pages ? page + 1 : null;
  const previous_page = page > 1 ? page - 1 : null;

  return { total_pages, next_page, previous_page };
}
