import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteUrl } from '@/lib/utils/config';
import {
  getProductsByCategorySlug,
  getAllCategories,
  getCategoryBySlug,
} from '@/lib/sanity/queries';
import CategoryClient from './category-client';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: category.name,
    description: category.description || `${category.name} products`,
    openGraph: {
      url: `${siteUrl}/c/${slug}`,
    },
    alternates: {
      canonical: `${siteUrl}/c/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const products = await getProductsByCategorySlug(slug);
  const categories = await getAllCategories();
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <CategoryClient
      products={products}
      categories={categories}
      initialCategory={category.name}
    />
  );
}
