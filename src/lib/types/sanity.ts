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
    image?: {
      asset?: {
        _ref: string;
        _type: 'reference';
      };
    };
  }>;
  prices?: Array<{
    currency: 'XOF' | 'USD' | 'EUR';
    basePrice: number;
    originalPrice?: number;
    lomiPriceId: string;
  }>;
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
  sizes?: {
    xxs?: boolean;
    xs?: boolean;
    s?: boolean;
    m?: boolean;
    l?: boolean;
    xl?: boolean;
    xxl?: boolean;
  };
  variant?: {
    _id: string;
    name?: string;
    slug?: string;
  };
  productType?: 'normal' | 'collab' | 'business';
  lomiProductId?: string;
  businessPacks?: Array<{
    quantity: number;
    price?: number;
    lomiPriceId?: string;
    label?: string;
  }>;
  featured?: boolean;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
  };
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
 * Product price in a specific currency
 */
export interface ProductPrice {
  currency: 'XOF' | 'USD' | 'EUR';
  basePrice: number;
  originalPrice?: number;
  lomiPriceId: string;
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
  prices: ProductPrice[];
  // Convenience fields for backward compatibility (uses first price or selected currency)
  price: number;
  originalPrice?: number;
  currency: string;
  image: string;
  images?: string[];
  soldOut: boolean;
  colors?: Array<{
    name: string;
    value: string;
    available: boolean;
    image?: string;
  }>;
  sizes?: Array<{
    name: string;
    available: boolean;
  }>;
  description?: PortableTextBlock[];
  category: ProductCategory;
  inStock: boolean;
  stockQuantity: number;
  sku: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
  };
  variant?: {
    id: string;
    name: string;
    slug: string;
  };
  productType: 'normal' | 'collab' | 'business';
  lomiProductId?: string;
  businessPacks?: Array<{
    quantity: number;
    price?: number;
    lomiPriceId?: string;
    label?: string;
  }>;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceModifier: number;
  stockQuantity: number;
  sku: string;
  lomiPriceId?: string;
  packSize?: number;
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
 * Get product price for a specific currency
 */
export function getProductPrice(
  product: Product,
  currency: 'XOF' | 'USD' | 'EUR' = 'XOF'
): ProductPrice | null {
  return (
    product.prices.find((p) => p.currency === currency) ||
    product.prices[0] ||
    null
  );
}

/**
 * Get product price value for a specific currency (for backward compatibility)
 */
export function getProductPriceValue(
  product: Product,
  currency: 'XOF' | 'USD' | 'EUR' = 'XOF'
): number {
  const price = getProductPrice(product, currency);
  return price?.basePrice || product.price || 0;
}
