import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductGrid } from '@/components/products/grid';
import { mockProducts } from '@/lib/data/mock-products';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'KYS FACTORY CIV / Business',
};

export default function BusinessPage() {
  // Filter products that could be considered packs (you might want to add a category field to your products)
  const packProducts = mockProducts; // For now, show all products

  return (
    <main className="grow">
      {/* Hero Section */}
      <section className="bg-foreground text-background py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-medium md:text-4xl">
            Business Offers (B2B)
          </h1>
          <p className="mt-4 text-lg text-background/80">
            Custom solutions for brands and businesses
          </p>
        </div>
      </section>


      {/* Pack Products */}
      <section className="mx-auto max-w-7xl px-4 py-12 border-t border-border">
        <h2 className="text-2xl font-medium text-foreground mb-8">
          Our packs
        </h2>
        <ProductGrid products={packProducts} />
      </section>

    </main>
  );
}
