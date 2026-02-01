import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Product } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clx(...inputs: ClassValue[]) {
  return cn(...inputs);
}

// Re-export formatPrice from utils/format
// Note: This function now requires currency parameter, but kept for backward compatibility
// New code should import from '@/lib/utils/format' directly
export { formatPrice } from '@/lib/utils/format';

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getPercentageDiff(
  original: number,
  calculated: number
): string {
  const diff = original - calculated;
  const decrease = (diff / original) * 100;
  return decrease.toFixed();
}

export function isSimpleProduct(product: Product): boolean {
  // A product is "simple" if it has no variant and no related products
  // (variants or related products indicate complex product relationships)
  return !product.variant && (!product.relatedProducts || product.relatedProducts.length === 0);
}

export function sortProducts(products: Product[], sortBy: string): Product[] {
  const sortedProducts = [...products];

  switch (sortBy) {
    case 'price_asc':
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      sortedProducts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case 'name':
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }

  return sortedProducts;
}
