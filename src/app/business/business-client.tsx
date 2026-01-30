'use client';

import { ProductGrid } from '@/components/products/grid';
import { Product } from '@/lib/types';
import { useTranslations } from 'next-intl';

export default function BusinessClient() {
  const t = useTranslations('products');
  // TODO: Fetch pack products from Sanity CMS
  const packProducts: Product[] = [];

  return (
    <main className="grow">
      {/* Pack Products */}
      <section className="mx-auto max-w-7xl px-4 py-12  border-border">
        <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-8">
          {t('sections.ourPacks')}
        </h2>
        <ProductGrid products={packProducts} />
      </section>
    </main>
  );
}
