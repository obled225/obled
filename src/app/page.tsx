import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { siteUrl } from '@/lib/utils/config';
import { getShopProducts, getAllCategories } from '@/lib/sanity/queries';
import HomeClient from './home-client';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "O'bled",
    description:
      "TU GNAN ON TE BOUAI — Porter O'bled c'est pas juste un habit. Fabriqué en Côte d'Ivoire 🇨🇮 • Vêtements | Accessoires | Inspiré du Nouchi vers le monde 🌎",
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
