import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { ProductGrid } from '@/components/products/grid';
import { siteUrl } from '@/lib/utils/config';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFrench = locale === 'fr';

  return {
    title: 'KYS Factory',
    description: isFrench
      ? 'Fabricant textile local à Abidjan spécialisé dans la production de t-shirts vierges de haute qualité pour professionnels.'
      : 'Local textile manufacturer in Abidjan specialized in high-quality blank t-shirt production for professionals.',
    openGraph: {
      url: siteUrl,
    },
    alternates: {
      canonical: siteUrl,
    },
  };
}

export default function Home() {
  return (
    <main className="grow">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <ProductGrid products={[]} />
      </section>
    </main>
  );
}
