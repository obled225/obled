import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getMetadataBaseUrl } from '@/lib/utils/metadata-base-url';
import { getShopProducts, getAllCategories } from '@/lib/sanity/queries';
import HomeClient from './home-client';

const homeTitle = "O'bled";
const homeDescription =
  'Boutique de vêtements et accessoires conçus à Abidjan. Nouveautés et classiques inspirés du Nouchi pour le monde.';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = await getMetadataBaseUrl();
  return {
    title: homeTitle,
    description: homeDescription,
    openGraph: {
      type: 'website',
      url: baseUrl,
      siteName: "O'bled",
      title: homeTitle,
      description: homeDescription,
      images: [
        {
          url: '/banner.png',
          width: 1200,
          height: 630,
          alt: homeTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: homeTitle,
      description: homeDescription,
      images: ['/banner.png'],
      creator: '@obled225',
    },
    alternates: {
      canonical: baseUrl,
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
