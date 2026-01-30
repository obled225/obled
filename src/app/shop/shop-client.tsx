'use client';

import { ProductGrid } from '@/components/products/grid';
import { useTranslations } from 'next-intl';

export default function ShopClient() {
  const t = useTranslations('products');

  return (
    <main className="grow">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="text-2xl font-medium text-foreground mb-8">
          {t('sections.allProducts')}
        </h1>
        <ProductGrid products={[]} />
      </section>
    </main>
  );
}
