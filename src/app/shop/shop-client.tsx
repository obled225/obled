'use client';

import { ProductGrid } from '@/components/products/grid';
import { useTranslations } from 'next-intl';
import { Product } from '@/lib/types';

interface ShopClientProps {
  products: Product[];
}

export default function ShopClient({ products }: ShopClientProps) {
  const t = useTranslations('products');

  return (
    <main className="grow">
      <section className="mx-auto max-w-7xl px-4 py-6  border-border">
        <h2 className="text-2xl sm:text-3xl font-medium text-foreground mb-8">
          {t('sections.allProducts')}
        </h2>
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
