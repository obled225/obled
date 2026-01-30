export type FeaturedProduct = {
  id: string;
  title: string;
  handle: string;
  thumbnail?: string;
};

export type VariantPrice = {
  calculated_price_number: number;
  calculated_price: string;
  original_price_number: number;
  original_price: string;
  currency_code: string;
  price_type: string;
  percentage_diff: string;
};

export type SortOption = {
  label: string;
  value: string;
};

export type FilterOption = {
  label: string;
  value: string;
};

export type SearchParams = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
