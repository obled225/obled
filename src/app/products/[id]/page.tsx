import { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export async function generateStaticParams() {
  // Generate static params for all products
  // TODO: Fetch products from Sanity CMS
  return [];
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFrench = locale === 'fr';
  // TODO: Fetch product from Sanity CMS
  const product = null;

  if (!product) {
    return {
      title: isFrench ? 'Produit introuvable' : 'Product Not Found',
      description: isFrench
        ? 'Le produit que vous recherchez est introuvable.'
        : 'The product you are looking for could not be found.',
    };
  }

  // TODO: Generate metadata when product is fetched from Sanity
  return {
    title: isFrench ? 'Produit introuvable' : 'Product Not Found',
    description: isFrench
      ? 'Le produit que vous recherchez est introuvable.'
      : 'The product you are looking for could not be found.',
  };
}

// Client component for the not found page content
function ProductNotFound() {
  const t = useTranslations('products');

  return (
    <main className="grow">
      <div className="flex justify-center py-16">
        <div className="bg-background border border-border rounded-lg overflow-hidden max-w-md w-full">
          <div className="p-6 text-center">
            <h1 className="text-2xl font-medium text-foreground mb-4">
              {t('productNotFound.title')}
            </h1>
            <p className="text-lg text-foreground/80 mb-4">
              {t('productNotFound.description')}
            </p>
            <Link
              href="/shop"
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

export default async function ProductPage() {
  // TODO: Fetch product from Sanity CMS
  const product = null;

  if (!product) {
    return <ProductNotFound />;
  }

  // Product structured data will be generated when product is fetched from Sanity
  // TODO: Add structured data generation here

  return (
    <main className="grow">
      {/* TODO: Render ProductDetail when product is fetched from Sanity */}
    </main>
  );
}
