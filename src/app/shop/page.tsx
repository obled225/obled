import type { Metadata } from 'next';
import { AnnouncementBar } from '@/components/store/announcement-bar';
import { ProductGrid } from '@/components/products/grid';
import { mockProducts } from '@/lib/data/mock-products';

export const metadata: Metadata = {
  title: 'KYS FACTORY CIV / Shop',
};

const announcements = [
  {
    text: "KYS FACTORY CIV / Fournisseur de T-shirt Vierge made in Côte d'Ivoire",
    href: '/about',
  },
  {
    text: 'Business offers for brands and businesses',
    href: '/business',
  },
];

export default function ShopPage() {
  return (
    <>
      <AnnouncementBar messages={announcements} />

      <main className="grow">
        <section className="mx-auto max-w-7xl px-4 py-12">
          <h1 className="text-2xl font-medium text-foreground mb-8">
            All products
          </h1>
          <ProductGrid products={mockProducts} />
        </section>
      </main>
    </>
  );
}
