'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Product, ProductCategory } from '@/lib/types';
import Modal from '@/components/ui/modal';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';

export type SortOption =
  | 'featured'
  | 'best-seller'
  | 'price-asc'
  | 'price-desc'
  | 'date-asc'
  | 'date-desc';

export interface FilterState {
  category?: string;
  availability: {
    inStock: boolean;
    outOfStock: boolean;
  };
  sortBy: SortOption;
}

interface ProductFiltersProps {
  products: Product[];
  onFilterChange: (filteredProducts: Product[]) => void;
  categories?: ProductCategory[];
  initialCategory?: string;
  hideCategoryFilter?: boolean;
}

export function ProductFilters({
  products,
  onFilterChange,
  categories = [],
  initialCategory,
  hideCategoryFilter = false,
}: ProductFiltersProps) {
  const t = useTranslations('products.filters');
  const [filters, setFilters] = useState<FilterState>({
    availability: {
      inStock: false,
      outOfStock: false,
    },
    category: initialCategory,
    sortBy: 'featured',
  });

  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
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

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(
        (product) => product.category?.name === filters.category
      );
    }

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
        case 'best-seller':
          // Best sellers first, then by date desc
          if (a.bestSeller && !b.bestSeller) return -1;
          if (!a.bestSeller && b.bestSeller) return 1;
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

  // Check if we're on mobile
  const isMobile = useIsMobile();

  // Mobile: Show bottom sheet modal
  if (isMobile) {
    return (
      <>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-xs md:text-sm">
          {/* Mobile Filters Button */}
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors"
          >
            <span>{t('filtersButton')}</span>
            {(selectedAvailabilityCount > 0 ||
              (!hideCategoryFilter && filters.category)) && (
              <span className="text-xs text-muted-foreground">
                (
                {(selectedAvailabilityCount > 0 ? 1 : 0) +
                  (!hideCategoryFilter && filters.category ? 1 : 0)}
                )
              </span>
            )}
            <svg
              className="w-3 h-3"
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

          {/* Right Side - Sort & Count */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <span className="text-foreground">{t('sort.title')} :</span>

              {/* Sort Button */}
              <button
                type="button"
                onClick={() => setIsMobileSortOpen(true)}
                className="flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors"
              >
                <span>{t(`sort.options.${filters.sortBy}`)}</span>
                <svg
                  className="w-3 h-3"
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
            </div>

            {/* Product Count - Only show when > 1 */}
            {filteredProducts.length > 1 && (
              <span className="text-muted-foreground text-xs md:text-sm">
                {filteredProducts.length} {t('productCount_plural')}
              </span>
            )}
          </div>
        </div>

        {/* Mobile Filters Modal */}
        <Modal
          isOpen={isMobileFiltersOpen}
          close={() => setIsMobileFiltersOpen(false)}
          position="bottom"
        >
          <div className="p-6 pb-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">{t('filtersButton')}</h3>
            </div>

            <div className="space-y-6">
              {/* Category Filter */}
              {!hideCategoryFilter && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    {t('category')}
                  </h4>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          category: undefined,
                        }));
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        !filters.category
                          ? 'bg-accent font-medium'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      {t('allCategories')}
                    </button>
                    {(categories.length > 0
                      ? categories.map((cat) => cat.name)
                      : Array.from(
                          new Set(
                            products
                              .map((p) => p.category?.name)
                              .filter(Boolean)
                          )
                        )
                    ).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, category: cat }));
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          filters.category === cat
                            ? 'bg-accent font-medium'
                            : 'hover:bg-accent/50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Filter */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">
                  {t('availability.title')}
                </h4>
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
            </div>
          </div>
        </Modal>

        {/* Mobile Sort Modal */}
        <Modal
          isOpen={isMobileSortOpen}
          close={() => setIsMobileSortOpen(false)}
          position="bottom"
        >
          <div className="p-6 pb-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">{t('sort.title')}</h3>
            </div>

            <div className="space-y-2">
              {(
                [
                  'featured',
                  'best-seller',
                  'price-asc',
                  'price-desc',
                  'date-asc',
                  'date-desc',
                ] as SortOption[]
              ).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, sortBy: option }));
                    setIsMobileSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-3 text-sm rounded-md transition-colors ${
                    filters.sortBy === option
                      ? 'bg-accent font-medium'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  {t(`sort.options.${option}`)}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Desktop: Show traditional dropdowns
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-xs md:text-sm">
      {/* Left Side - Filters */}
      <div className="flex items-center gap-4">
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

        {/* Category Dropdown */}
        {!hideCategoryFilter && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors"
            >
              <span>{filters.category || t('allCategories')}</span>
              <svg
                className={`w-3 h-3 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
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

            {isCategoryOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsCategoryOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-56 bg-background border border-border rounded-md shadow-lg z-20 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, category: undefined }));
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${
                      !filters.category ? 'bg-accent font-medium' : ''
                    }`}
                  >
                    {t('allCategories')}
                  </button>
                  {(categories.length > 0
                    ? categories.map((cat) => cat.name)
                    : Array.from(
                        new Set(
                          products.map((p) => p.category?.name).filter(Boolean)
                        )
                      )
                  ).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, category: cat }));
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${
                        filters.category === cat ? 'bg-accent font-medium' : ''
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
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
          <span className="text-muted-foreground text-xs md:text-sm">
            {filteredProducts.length} {t('productCount_plural')}
          </span>
        )}
      </div>
    </div>
  );
}
