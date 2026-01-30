import type { Metadata } from 'next';
import { ProductGrid } from '@/components/products/grid';
import { mockProducts } from '@/lib/data/mock-products';

export const metadata: Metadata = {
  title: 'KYS FACTORY CIV / Shop',
};

export default function ShopPage() {
  return (
    <main className="grow">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="text-2xl font-medium text-foreground mb-8">
          All products
        </h1>
        <ProductGrid products={mockProducts} />
      </section>
    </main>
  );
}
