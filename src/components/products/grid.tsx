import { Product } from '@/lib/types';
import { ProductCard } from './card';
import { useTranslations } from 'next-intl';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export function ProductGrid({ products, loading = false }: ProductGridProps) {
  const t = useTranslations('products');

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center w-full">
        <div className="bg-background border border-border rounded-lg overflow-hidden max-w-md w-full">
          <div className="p-4 sm:p-6 text-center">
            <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-foreground mb-3 sm:mb-4">
              {t('empty.title')}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-foreground/80 mb-3 sm:mb-4">
              {t('empty.description')}
            </p>
            <p className="text-xs sm:text-sm md:text-base text-foreground/70">
              {t('empty.suggestion')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
