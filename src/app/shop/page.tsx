import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import ShopClient from './shop-client';
import { siteUrl } from '@/lib/utils/config';
import { getAllProducts } from '@/lib/sanity/queries';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFrench = locale === 'fr';

  return {
    title: isFrench ? 'Boutique' : 'Shop',
    description: isFrench
      ? 'Collection complète de t-shirts vierges de qualité premium fabriqués localement à Abidjan. T-shirts oversized, boxy cut et manches longues.'
      : 'Complete collection of premium quality blank t-shirts manufactured locally in Abidjan. Oversized t-shirts, boxy cut and long sleeves.',
    openGraph: {
      url: `${siteUrl}/shop`,
    },
    alternates: {
      canonical: `${siteUrl}/shop`,
    },
  };
}

export default async function ShopPage() {
  const products = await getAllProducts();
  return <ShopClient products={products} />;
}
