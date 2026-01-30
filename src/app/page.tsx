import type { Metadata } from 'next';
import { ProductGrid } from '@/components/products/grid';
import { mockProducts } from '@/lib/data/mock-products';

export const metadata: Metadata = {
  title:
    "KYS FACTORY CIV / Fournisseur de T-shirt Vierge made in Côte d'Ivoire",
};

export default function Home() {
  return (
    <main className="grow">
      <section className="mx-auto max-w-7xl px-4 py-12">
        <ProductGrid products={mockProducts} />
      </section>
    </main>
  );
}
