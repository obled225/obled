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
  }, [productsWithCategories]);

  return (
    <main className="grow">
      <section className="mx-auto max-w-7xl px-4 py-6  border-border">
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
