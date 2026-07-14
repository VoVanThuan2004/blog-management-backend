export interface PaginationParams {
  page: number;
  size: number;
  search?: string | undefined;
}

export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}