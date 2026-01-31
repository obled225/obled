'use client';

import { ProductGrid } from '@/components/products/grid';
import { Product } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface BusinessClientProps {
  products: Product[];
}

export default function BusinessClient({ products }: BusinessClientProps) {
  const t = useTranslations('products');

  return (
    <main className="grow">
      {/* Pack Products */}
      <section className="mx-auto max-w-7xl px-4 py-6  border-border">
        <h2 className="text-2xl sm:text-3xl font-medium text-foreground mb-8">
          {t('sections.ourPacks')}
        </h2>
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
