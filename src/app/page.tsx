import { Header } from '@/components/layout/header';
import { AnnouncementBar } from '@/components/store/announcement-bar';
import { ProductGrid } from '@/components/products/grid';
import { Footer } from '@/components/layout/footer';
import { mockProducts } from '@/lib/data/mock-products';

const announcements = [
  {
    text: 'KYSFactory - Premium Quality Products',
    href: '/about',
  },
  {
    text: 'Free Shipping on Orders Over $50',
    href: '/shipping',
  },
  {
    text: 'New Arrivals - Check Out Our Latest Collection',
    href: '/products',
  },
];

export default function Home() {
  // Get all products for the main grid (like the replication)
  const allProducts = mockProducts;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <AnnouncementBar messages={announcements} />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-12">
          <ProductGrid products={allProducts} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
