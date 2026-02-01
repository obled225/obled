import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { siteUrl } from '@/lib/utils/config';
import { getShopProducts } from '@/lib/sanity/queries';
import HomeClient from './home-client';

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

export default async function Home() {
  const products = await getShopProducts();
  return <HomeClient products={products} />;
}
