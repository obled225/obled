/**
 * Common shared types used across the application
 */

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export type SortOption = {
  label: string;
  value: string;
};

export type FilterOption = {
  label: string;
  value: string;
};

// Loading and async state types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

// FAQ types
export interface FaqItem {
  question: string;
  answer: string | string[];
}

export interface FaqData {
  [key: string]: FaqItem;
}

// Meta Pixel types
export type FbqCommand = 'init' | 'track' | 'trackSingle' | 'trackCustom';

export interface FbqFunction {
  (command: FbqCommand, ...args: unknown[]): void;
}

declare global {
  interface Window {
    fbq?: FbqFunction;
  }
}

// Icon types
export type IconProps = {
  color?: string;
  size?: string | number;
} & React.SVGAttributes<SVGElement>;

// Product-related types (from global.ts - keeping for backward compatibility)
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

// Cart types (frontend-only state, not stored in database)
import type { Product, ProductVariant } from './sanity';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  addedAt: Date;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}
