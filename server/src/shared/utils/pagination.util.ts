export function calculatePagination(
  totalRecords: number,
  page: number,
  limit: number,
) {
  const totalPages = Math.ceil(totalRecords / limit);
  const nextPage = page < totalPages ? page + 1 : null;
  const previousPage = page > 1 ? page - 1 : null;

  return { totalPages, nextPage, previousPage };
}
