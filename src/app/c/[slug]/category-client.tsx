'use client';

import { useState } from 'react';
import { ProductGrid } from '@/components/products/grid';
import { ProductFilters } from '@/components/products/filters';
import { Product, ProductCategory } from '@/lib/types';

interface CategoryClientProps {
  products: Product[];
  categories?: ProductCategory[];
  initialCategory?: string;
}

export default function CategoryClient({
  products,
  categories = [],
  initialCategory,
}: CategoryClientProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  return (
    <main className="grow">
      <section className="mx-auto max-w-7xl px-4 py-6 border-border">
        {products.length > 0 && (
          <ProductFilters
            products={products}
            onFilterChange={setFilteredProducts}
            categories={categories}
            initialCategory={initialCategory}
            hideCategoryFilter={true}
          />
        )}
        <ProductGrid
          products={filteredProducts}
          emptyStateKey="emptyCategory"
        />
      </section>
    </main>
  );
}
