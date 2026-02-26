import { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getProductBySlug } from '@/lib/sanity/queries';
import { ProductDetail } from '@/components/store/product-detail';

export async function generateStaticParams() {
  // Generate static params for all products
  // This will be populated when products are available
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const locale = await getLocale();
  const isFrench = locale === 'fr';
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) {
    return {
      title: isFrench ? 'Produit introuvable' : 'Product Not Found',
      description: isFrench
        ? 'Le produit que vous recherchez est introuvable.'
        : 'The product you are looking for could not be found.',
    };
  }

  return {
    title: product.name,
    description: Array.isArray(product.description)
      ? product.description.join(' ')
      : product.description || `${product.name} - O'bled`,
    openGraph: {
      images: product.image ? [product.image] : [],
    },
  };
}

// Client component for the not found page content
function ProductNotFound() {
  const t = useTranslations('products');

  return (
    <main className="grow">
      <div className="flex justify-center items-center w-full py-12 sm:py-16 md:py-20">
        <div className="bg-background border border-border rounded-md overflow-hidden max-w-md w-full">
          <div className="p-6 text-center">
            <h1 className="text-2xl font-medium text-foreground mb-4">
              {t('productNotFound.title')}
            </h1>
            <p className="text-lg text-foreground/80 mb-4">
              {t('productNotFound.description')}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors"
            >
              {t('productNotFound.browseProducts')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) {
    return <ProductNotFound />;
  }

  return (
    <main className="grow">
      <ProductDetail product={product} />
    </main>
  );
}
