'use client';

import { useState, useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import { ProductGrid } from '@/components/products/grid';
import { Pagination } from '@/components/ui/pagination';
import { mockProducts } from '@/lib/data/mock-products';
import { Product, Category, ProductSortOption } from '@/lib/types';
import { sortProducts } from '@/lib/actions/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const ITEMS_PER_PAGE = 12;

const sortOptions: ProductSortOption[] = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Name A-Z', value: 'name' },
];

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;

  // Get category info and products
  const categoryProducts = mockProducts.filter(
    (product) => product.category.id === categoryId
  );

  if (categoryProducts.length === 0) {
    notFound();
  }

  const category = categoryProducts[0].category;

  return <CategoryPageClient category={category} products={categoryProducts} />;
}

function CategoryPageClient({
  category,
  products,
}: {
  category: Category;
  products: Product[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<ProductSortOption['value']>('newest');

  // Sort products
  const sortedProducts = useMemo(() => {
    return sortProducts(products, sortBy);
  }, [products, sortBy]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);

  const handleSortChange = (sortValue: ProductSortOption['value']) => {
    setSortBy(sortValue);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-600 mb-4">{category.description}</p>
            )}
            <p className="text-sm text-gray-500">
              {products.length} {products.length === 1 ? 'product' : 'products'}{' '}
              available
            </p>
          </div>

          {/* Sort Options */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) =>
                  handleSortChange(e.target.value as ProductSortOption['value'])
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {paginatedProducts.length} of {sortedProducts.length}{' '}
              products
            </div>
          </div>

          {/* Products Grid */}
          <ProductGrid products={paginatedProducts} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                data-testid="category-pagination"
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
