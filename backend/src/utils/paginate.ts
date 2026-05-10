export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export const paginate = (input: PaginationInput): PaginationResult => {
  const page = Math.max(input.page ?? 1, 1);
  const limit = Math.min(Math.max(input.limit ?? 20, 1), 100);

  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit
  };
};
