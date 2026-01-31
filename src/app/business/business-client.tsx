'use client';

import { useState } from 'react';
import { ProductGrid } from '@/components/products/grid';
import { ProductFilters } from '@/components/products/filters';
import { Product } from '@/lib/types';

interface BusinessClientProps {
  products: Product[];
}

export default function BusinessClient({ products }: BusinessClientProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  return (
    <main className="grow">
      {/* Pack Products */}
      <section className="mx-auto max-w-7xl px-4 py-6  border-border">
        {products.length > 0 && (
          <ProductFilters
            products={products}
            onFilterChange={setFilteredProducts}
          />
        )}
        <ProductGrid
          products={filteredProducts}
          emptyStateKey="emptyBusiness"
        />
      </section>
    </main>
  );
}
