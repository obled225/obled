'use client';

import { useState } from 'react';
import { ProductGrid } from '@/components/products/grid';
import { ProductFilters } from '@/components/products/filters';
import { Product } from '@/lib/types';

interface ShopClientProps {
  products: Product[];
}

export default function ShopClient({ products }: ShopClientProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  return (
    <main className="grow">
      <section className="mx-auto max-w-7xl px-4 py-6  border-border">
        {products.length > 0 && (
          <ProductFilters
            products={products}
            onFilterChange={setFilteredProducts}
          />
        )}
        <ProductGrid products={filteredProducts} />
      </section>
    </main>
  );
}
