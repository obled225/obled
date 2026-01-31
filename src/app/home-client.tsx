'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { ProductGrid } from '@/components/products/grid';
import { ProductFilters } from '@/components/products/filters';
import { Product } from '@/lib/types';

interface HomeClientProps {
  products: Product[];
}

export default function HomeClient({ products }: HomeClientProps) {
  // Filter products that have categories (not "uncategorized")
  const productsWithCategories = useMemo(() => {
    return products.filter(
      (product) => product.category.id !== 'uncategorized'
    );
  }, [products]);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(
    productsWithCategories
  );

  // Update filtered products when categories filter changes
  // Memoize to prevent infinite loops
  const handleFilterChange = useCallback((filtered: Product[]) => {
    // Further filter to only include products with categories
    const withCategories = filtered.filter(
      (product) => product.category.id !== 'uncategorized'
    );
    setFilteredProducts(withCategories);
  }, []);

  // Update filtered products when products prop changes
  useEffect(() => {
    setFilteredProducts(productsWithCategories);
  }, [products]); // Only depend on products, not productsWithCategories

  return (
    <main className="grow">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {productsWithCategories.length > 0 && (
          <ProductFilters
            products={productsWithCategories}
            onFilterChange={handleFilterChange}
          />
        )}
        <ProductGrid products={filteredProducts} />
      </section>
    </main>
  );
}
