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
  'categories' | 'prices' | 'colors' | 'sizes' | 'description' | 'dimensions'
> {
  categories?: Array<{
    _id: string;
    _type: 'categories';
    title?: string;
    slug?: {
      current?: string;
    };
    description?: string;
  }>;
  currentPrice?: number; // Current selling price in XOF (base currency)
  basePrice?: number; // Base price in XOF (shown with strikethrough)
  colors?: Array<{
    name: string;
    value: string;
    available?: boolean;
    image?: {
      asset?: {
        _ref: string;
        _type: 'reference';
      };
    };
  }>;
  sizes?: Array<{
    name: string;
    available?: boolean;
  }>;
  variant?: {
    _id: string;
    name?: string;
    slug?:
      | {
          current?: string;
        }
      | string;
  };
  relatedProducts?: Array<{
    _id: string;
    _createdAt?: string;
    _updatedAt?: string;
    name?: string;
    slug?:
      | {
          current?: string;
        }
      | string;
    currentPrice?: number; // Current selling price in XOF
    basePrice?: number; // Base price in XOF
    inStock?: boolean;
    images?: Array<{
      asset?: {
        _ref: string;
        _type: 'reference';
      };
    }>;
    categories?: Array<{
      _id: string;
      slug?: {
        current?: string;
      };
      title?: string;
      description?: string;
    }>;
  }>;
  featured?: boolean;
  bestSeller?: boolean;
  grammage?: string; // Fabric weight (e.g., '180', '200')
  material?: string; // Material composition (e.g., '100% coton', '100% coton PK')
  description?: PortableTextBlock[];
}

/**
 * Helper type for GROQ query results
 */
export type SanityProductQueryResult = SanityProductExpanded;

/**
 * Type guard to check if a document is a product
 */
export function isSanityProduct(doc: SanityDocument): doc is SanityProductRaw {
  return doc._type === 'products';
}

/**
 * Type guard to check if a document is a category
 */
export function isSanityCategory(
  doc: SanityDocument
): doc is SanityCategoryRaw {
  return doc._type === 'categories';
}

/**
 * @deprecated ProductPrice is no longer used. Products now have a single price in XOF.
 * Use convertPrice from currency store to convert to other currencies.
 */
export interface ProductPrice {
  currency: 'XOF' | 'USD' | 'EUR';
  basePrice: number;
  originalPrice?: number;
}

/**
 * Portable text block content (for rich text descriptions)
 */
export type PortableTextBlock = {
  _type: 'block';
  _key: string;
  style?: string;
  children: Array<{
    _type: 'span';
    _key: string;
    text: string;
    marks?: string[];
  }>;
  markDefs?: Array<{
    _key: string;
    _type: string;
    [key: string]: unknown;
  }>;
  listItem?: 'bullet' | 'number';
  level?: number;
};

/**
 * Transformed Product type for frontend use
 * This is the transformed version of SanityProductExpanded used throughout the app
 */
export interface Product {
  id: string;
  slug: string;
  name: string;
  // Price in XOF (base currency)
  price: number;
  originalPrice?: number; // Original price in XOF (before discount)
  image: string;
  images?: string[];
  soldOut: boolean;
  colors?: Array<{
    name: string;
    available: boolean;
    image?: string;
  }>;
  sizes?: Array<{
    name: string;
    available: boolean;
  }>;
  description?: PortableTextBlock[];
  category?: ProductCategory;
  inStock: boolean;
  grammage?: string; // Fabric weight (e.g., '180', '200')
  material?: string; // Material composition (e.g., '100% coton', '100% coton PK')
  variant?: {
    id: string;
    name: string;
    slug: string;
  };
  relatedProducts?: Product[];
  featured?: boolean;
  bestSeller?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceModifier: number; // Price modifier in XOF
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  subcategories?: ProductCategory[];
  badgeText?: string;
  badgeColor?: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
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

// Re-export formatPrice from utils/format for backward compatibility
export { formatPrice } from '@/lib/utils/format';

/**
 * @deprecated Use product.price directly and convertPrice from currency store.
 * This function is kept for backward compatibility but always returns the XOF price.
 */
export function getProductPrice(
  product: Product,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _currency: 'XOF' | 'USD' | 'EUR' = 'XOF'
): { currency: 'XOF'; basePrice: number; originalPrice?: number } | null {
  if (!product.price) return null;
  return {
    currency: 'XOF',
    basePrice: product.price,
    originalPrice: product.originalPrice,
  };
}

/**
 * Get product price value (always returns XOF price)
 * @deprecated Use product.price directly
 */
export function getProductPriceValue(
  product: Product,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _currency: 'XOF' | 'USD' | 'EUR' = 'XOF'
): number {
  return product.price || 0;
}
