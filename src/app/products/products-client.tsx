'use client';

import { useState, useMemo } from 'react';
import { ProductGrid } from '@/components/products/grid';
import { Pagination } from '@/components/ui/pagination';
import { ProductFilters, ProductSortOption, Product } from '@/lib/types';
import { sortProducts } from '@/lib/actions/utils';

const ITEMS_PER_PAGE = 12;

const sortOptions: ProductSortOption[] = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Price: low to high', value: 'price-asc' },
  { label: 'Price: high to low', value: 'price-desc' },
  { label: 'Name A-Z', value: 'name' },
];

interface ProductsClientProps {
  products: Product[];
}

export default function ProductsClient({ products }: ProductsClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<ProductSortOption['value']>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered: Product[] = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description &&
            product.description
              .join(' ')
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          product.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(
        (product) => product.category.id === filters.category
      );
    }

    // Apply price filters
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(
        (product) => product.price >= filters.minPrice!
      );
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(
        (product) => product.price <= filters.maxPrice!
      );
    }

    // Apply stock filter
    if (filters.inStock !== undefined) {
      filtered = filtered.filter(
        (product) => product.inStock === filters.inStock
      );
    }

    // Apply tag filters
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((product) =>
        filters.tags!.some((tag) => product.tags.includes(tag))
      );
    }

    // Sort products
    filtered = sortProducts(filtered, sortBy);

    return filtered;
  }, [products, searchQuery, filters, sortBy]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  // Reset to first page when filters change
  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortChange = (sortValue: ProductSortOption['value']) => {
    setSortBy(sortValue);
    setCurrentPage(1);
  };

  return (
    <main className="grow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            All Products
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Discover our complete collection of amazing products
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          {/* Search Bar */}
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort Options */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) =>
                  handleSortChange(e.target.value as ProductSortOption['value'])
                }
                className="flex-1 sm:flex-none px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Basic Filters */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock === true}
                  onChange={(e) =>
                    handleFiltersChange({
                      ...filters,
                      inStock: e.target.checked ? true : undefined,
                    })
                  }
                  className="mr-2 w-4 h-4"
                />
                <span className="text-xs sm:text-sm">In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-xs sm:text-sm text-gray-600">
            Showing {paginatedProducts.length} of {filteredProducts.length}{' '}
            products
          </div>
        </div>

        {/* Products Grid */}
        <ProductGrid products={paginatedProducts} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 sm:mt-12">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              data-testid="products-pagination"
            />
          </div>
        )}
      </div>
    </main>
  );
}
