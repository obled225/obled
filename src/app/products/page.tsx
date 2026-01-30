import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import ProductsClient from './products-client';
import { siteUrl } from '@/lib/utils/config';
import { getAllProducts } from '@/lib/sanity/queries';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFrench = locale === 'fr';

  return {
    title: isFrench ? 'Tous les Produits' : 'All Products',
    description: isFrench
      ? 'Découvrez notre collection complète de t-shirts vierges de haute qualité et produits textiles. Filtrez et recherchez selon vos besoins.'
      : 'Discover our complete collection of high-quality blank t-shirts and textile products. Filter and search according to your needs.',
    openGraph: {
      url: `${siteUrl}/products`,
    },
    alternates: {
      canonical: `${siteUrl}/products`,
    },
  };
}

export default async function ProductsPage() {
  const products = await getAllProducts();
  return <ProductsClient products={products} />;
}
