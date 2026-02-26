import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { siteUrl } from '@/lib/utils/config';
import { getShopProducts, getAllCategories } from '@/lib/sanity/queries';
import HomeClient from './home-client';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFrench = locale === 'fr';

  return {
    title: "O'bled",
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

interface HomeProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { category } = await searchParams;

  // If category query param exists, redirect to /c/[slug]
  if (category) {
    redirect(`/c/${category}`);
  }

  const products = await getShopProducts();
  const categories = await getAllCategories();

  return <HomeClient products={products} categories={categories} />;
}
