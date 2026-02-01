'use client';

import { useState, useMemo } from 'react';
import { ProductGrid } from '@/components/products/grid';
import { ProductFilters } from '@/components/products/filters';
import { Product, ProductCategory } from '@/lib/types';

interface HomeClientProps {
  products: Product[];
  categories?: ProductCategory[];
}

export default function HomeClient({
  products,
  categories = [],
}: HomeClientProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  // Filter out categories that have no products
  const categoriesWithProducts = useMemo(() => {
    if (categories.length === 0) {
      // If no categories provided, extract from products (existing behavior)
      return [];
    }

    // Get all unique category names that have products
    const categoryNamesWithProducts = new Set(
      products.map((p) => p.category?.name).filter(Boolean)
    );

    // Only include categories that have at least one product
    return categories.filter((cat) => categoryNamesWithProducts.has(cat.name));
  }, [categories, products]);

  return (
    <main className="grow">
      <section className="mx-auto max-w-7xl px-4 py-6  border-border">
        {products.length > 0 && (
          <ProductFilters
            products={products}
            onFilterChange={setFilteredProducts}
            categories={categoriesWithProducts}
          />
        )}
        <ProductGrid products={filteredProducts} />
      </section>
    </main>
  );
}
