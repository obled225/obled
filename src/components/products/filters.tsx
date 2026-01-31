'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Product } from '@/lib/types';

export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'date-asc'
  | 'date-desc';

export interface FilterState {
  availability: {
    inStock: boolean;
    outOfStock: boolean;
  };
  sortBy: SortOption;
}

interface ProductFiltersProps {
  products: Product[];
  onFilterChange: (filteredProducts: Product[]) => void;
}

export function ProductFilters({
  products,
  onFilterChange,
}: ProductFiltersProps) {
  const t = useTranslations('products.filters');
  const [filters, setFilters] = useState<FilterState>({
    availability: {
      inStock: false,
      outOfStock: false,
    },
    sortBy: 'featured',
  });

  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const onFilterChangeRef = useRef(onFilterChange);

  // Keep the ref updated
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  // Count products by availability
  const availabilityCounts = useMemo(() => {
    const inStockCount = products.filter((p) => p.inStock && !p.soldOut).length;
    const outOfStockCount = products.filter(
      (p) => !p.inStock || p.soldOut
    ).length;
    return { inStock: inStockCount, outOfStock: outOfStockCount };
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply availability filters
    const hasAvailabilityFilter =
      filters.availability.inStock || filters.availability.outOfStock;
    if (hasAvailabilityFilter) {
      filtered = filtered.filter((product) => {
        if (filters.availability.inStock && filters.availability.outOfStock) {
          return true; // Show all if both are selected
        }
        if (filters.availability.inStock) {
          return product.inStock && !product.soldOut;
        }
        if (filters.availability.outOfStock) {
          return !product.inStock || product.soldOut;
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'featured':
          // Featured first, then by date desc
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'date-asc':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'date-desc':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, filters]);

  // Notify parent of filtered products
  useEffect(() => {
    onFilterChangeRef.current(filteredProducts);
  }, [filteredProducts]);

  const handleAvailabilityToggle = (type: 'inStock' | 'outOfStock') => {
    setFilters((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [type]: !prev.availability[type],
      },
    }));
  };

  const handleSortChange = (sortBy: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy }));
    setIsSortOpen(false);
  };

  const selectedAvailabilityCount =
    (filters.availability.inStock ? 1 : 0) +
    (filters.availability.outOfStock ? 1 : 0);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-sm">
      {/* Left Side - Filters */}
      <div className="flex items-center gap-4">
        <span className="text-foreground">Filtre :</span>

        {/* Availability Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
            className="flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors"
          >
            <span>{t('availability.title')}</span>
            {selectedAvailabilityCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({selectedAvailabilityCount})
              </span>
            )}
            <svg
              className={`w-3 h-3 transition-transform ${isAvailabilityOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isAvailabilityOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsAvailabilityOpen(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-md shadow-lg z-20 p-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.availability.outOfStock}
                      onChange={() => handleAvailabilityToggle('outOfStock')}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">
                        {t('availability.outOfStock')}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({availabilityCounts.outOfStock})
                      </span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.availability.inStock}
                      onChange={() => handleAvailabilityToggle('inStock')}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">
                        {t('availability.inStock')}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({availabilityCounts.inStock})
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Sort & Count */}
      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-2">
          <span className="text-foreground">{t('sort.title')} :</span>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors"
            >
              <span>{t(`sort.options.${filters.sortBy}`)}</span>
              <svg
                className={`w-3 h-3 transition-transform ${isSortOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isSortOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsSortOpen(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-56 bg-background border border-border rounded-md shadow-lg z-20 py-2">
                  {(
                    [
                      'featured',
                      'price-asc',
                      'price-desc',
                      'date-asc',
                      'date-desc',
                    ] as SortOption[]
                  ).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSortChange(option)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${
                        filters.sortBy === option ? 'bg-accent font-medium' : ''
                      }`}
                    >
                      {t(`sort.options.${option}`)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Product Count - Only show when > 1 */}
        {filteredProducts.length > 1 && (
          <span className="text-muted-foreground">
            {filteredProducts.length} {t('productCount_plural')}
          </span>
        )}
      </div>
    </div>
  );
}
