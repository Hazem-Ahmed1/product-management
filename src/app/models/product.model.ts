/** Full product resource as returned by the API */
export interface Product {
  id: number;
  name: string;
  slug: string | null;
  sku: string;
  description: string | null;
  stock: number;
  price: number;
  currency: string;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

/** Query parameters accepted by GET /api/products */
export interface ProductFilters {
  page: number;
  per_page: number;
  search?: string;
  /** undefined = all, true = active, false = inactive */
  is_active?: boolean;
}

/** Laravel-style paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export type StatusFilter = 'all' | 'active' | 'inactive';

export const PAGE_SIZE_OPTIONS = [10, 15, 25, 50] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

/** POST /api/products request body */
export interface CreateProductRequest {
  name: string;
  description?: string;
  stock: number;
  price: number;
  currency: string;
  is_active: boolean;
}

/** Thrown when the API returns 422 with field-level errors */
export class ProductValidationError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ProductValidationError';
  }
}

export const CURRENCIES = [
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
] as const;
