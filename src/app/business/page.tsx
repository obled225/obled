import type { Metadata } from 'next';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/store/announcement-bar';
import { ProductGrid } from '@/components/products/grid';
import { mockProducts } from '@/lib/data/mock-products';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'KYS FACTORY CIV / Business',
};

const announcements = [
  {
    text: "KYS FACTORY CIV / Fournisseur de T-shirt Vierge made in Côte d'Ivoire",
    href: '/about',
  },
];

export default function BusinessPage() {
  // Filter products that could be considered packs (you might want to add a category field to your products)
  const packProducts = mockProducts; // For now, show all products

  return (
    <>
      <AnnouncementBar messages={announcements} />

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

        {/* Benefits */}
        <section className="mx-auto max-w-4xl px-4 py-16">
          <h2 className="text-2xl font-medium text-foreground text-center mb-12">
            Why order wholesale from KYS Factory?
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center text-2xl mb-4">
                💰
              </div>
              <h3 className="font-medium text-foreground">Volume discounts</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The more you order, the more you save
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center text-2xl mb-4">
                🏭
              </div>
              <h3 className="font-medium text-foreground">
                Local manufacturing
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Made in Abidjan, quality guaranteed
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center text-2xl mb-4">
                📦
              </div>
              <h3 className="font-medium text-foreground">
                Packs of 5 to 50 pieces
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Flexibility according to your needs
              </p>
            </div>
          </div>
        </section>

        {/* Pack Products */}
        <section className="mx-auto max-w-7xl px-4 py-12 border-t border-border">
          <h2 className="text-2xl font-medium text-foreground mb-8">
            Our packs
          </h2>
          <ProductGrid products={packProducts} />
        </section>

        {/* CTA */}
        <section className="bg-muted py-16">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-2xl font-medium text-foreground">
              Need a custom order?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Contact us to discuss your specific needs and get a personalized
              quote.
            </p>
            <Link href="/contact">
              <Button className="mt-8 h-12 px-8 bg-foreground text-background hover:bg-foreground/90">
                Contact us
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
