/**
 * Sanity CMS Type Definitions
 *
 * These types extend the generated Sanity Studio types with
 * transformed types for frontend use.
 */

import type { SanityDocument } from '@sanity/types';
import type {
  Product as SanityProductRaw,
  Category as SanityCategoryRaw,
} from '../../../studio/types/sanity.types';

/**
 * Expanded Product with resolved references
 * This is what we get from GROQ queries with references resolved
 */
export interface SanityProductExpanded extends Omit<
  SanityProductRaw,
  'categories'
> {
  categories?: Array<{
    _id: string;
    _type: 'category';
    title?: string;
    slug?: {
      current?: string;
    };
    description?: string;
    image?: {
      asset?: {
        _ref: string;
        _type: 'reference';
      };
    };
  }>;
}

/**
 * Helper type for GROQ query results
 */
export type SanityProductQueryResult = SanityProductExpanded;

/**
 * Type guard to check if a document is a product
 */
export function isSanityProduct(doc: SanityDocument): doc is SanityProductRaw {
  return doc._type === 'product';
}

/**
 * Type guard to check if a document is a category
 */
export function isSanityCategory(
  doc: SanityDocument
): doc is SanityCategoryRaw {
  return doc._type === 'category';
}

/**
 * Transformed Product type for frontend use
 * This is the transformed version of SanityProductExpanded used throughout the app
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  image: string;
  images?: string[];
  soldOut: boolean;
  colors?: { name: string; value: string; available: boolean }[];
  sizes?: { name: string; available: boolean }[];
  description?: string[];
  category: ProductCategory;
  // Legacy fields for backward compatibility
  inStock: boolean;
  stockQuantity: number;
  sku: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceModifier: number;
  stockQuantity: number;
  sku: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  subcategories?: ProductCategory[];
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  tags?: string[];
  search?: string;
}

export interface ProductSortOption {
  label: string;
  value: 'name' | 'price-asc' | 'price-desc' | 'newest' | 'rating';
}

export interface SizeGuide {
  headers: string[];
  rows: {
    size: string;
    chest: number;
    length: number;
  }[];
}

export const sizeGuide: SizeGuide = {
  headers: ['SIZE', 'Poitrine', 'Longueur'],
  rows: [
    { size: 'XS', chest: 58, length: 63 },
    { size: 'S', chest: 60, length: 65 },
    { size: 'M', chest: 62, length: 67 },
    { size: 'L', chest: 64, length: 69 },
    { size: 'XL', chest: 66, length: 71 },
    { size: 'XXL', chest: 68, length: 73 },
    { size: '3XL', chest: 70, length: 75 },
    { size: '4XL', chest: 72, length: 77 },
  ],
};

export function getProductById(
  id: string,
  products: Product[]
): Product | undefined {
  return products.find((p) => p.id === id);
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return `$${price.toFixed(2)} ${currency}`;
}
