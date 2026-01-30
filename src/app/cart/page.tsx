import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getLocale } from 'next-intl/server';
import { siteUrl } from '@/lib/utils/config';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFrench = locale === 'fr';

  return {
    title: isFrench ? 'Panier' : 'Cart',
    description: isFrench
      ? "Votre panier d'achat KYS Factory"
      : 'Your KYS Factory shopping cart',
    openGraph: {
      url: `${siteUrl}/cart`,
    },
    alternates: {
      canonical: `${siteUrl}/cart`,
    },
  };
}

export default function PanierPage() {
  return (
    <main className="grow">
      <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-medium text-foreground">
            Your cart is empty
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Discover our products and add them to your cart.
          </p>
          <Link href="/shop">
            <Button className="mt-6 sm:mt-8 h-11 sm:h-12 px-6 sm:px-8 bg-foreground text-background hover:bg-foreground/90">
              Continue shopping
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
