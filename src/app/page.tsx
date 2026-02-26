import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { siteUrl } from '@/lib/utils/config';
import { getShopProducts, getAllCategories } from '@/lib/sanity/queries';
import HomeClient from './home-client';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "O'bled | Découvrez nos pièces",
    description:
      'Boutique de vêtements et accessoires conçus à Abidjan. Nouveautés et classiques, livrés chez vous.',
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
