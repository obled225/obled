'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils/format';
import { useCurrencyStore } from '@/lib/store/currency-store';
import { useTranslations } from 'next-intl';

type RelatedProductsProps = {
  products: Product[];
  title?: string;
};

export default function RelatedProducts({
  products,
  title,
}: RelatedProductsProps) {
  const { currency, convertPrice } = useCurrencyStore();
  const t = useTranslations('products');
  const tRelated = useTranslations('products.relatedProducts');

  const displayTitle = title || tRelated('defaultTitle');

  if (!products.length) {
    return null;
  }

  return (
    <div className="pb-12">
      <div className="flex flex-col items-start text-left mb-4">
        <span className="text-sm font-medium text-gray-600 mb-1 uppercase tracking-wide">
          {displayTitle}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          // All prices are in XOF, convert to selected currency
          const priceXOF = product.price || 0;
          const displayPrice = convertPrice(priceXOF, currency);
          const displayOriginalPrice = product.originalPrice
            ? convertPrice(product.originalPrice, currency)
            : undefined;

          return (
            <div key={product.id} className="group">
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-md mb-4 group-hover:shadow-lg transition-shadow">
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">
                        {t('noImage')}
                      </span>
                    </div>
                  )}

                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {t('outOfStock')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between gap-2">
                    {product.category?.name ? (
                      <p className="text-sm text-gray-600">
                        {product.category.name}
                      </p>
                    ) : null}
                    <div className="flex items-center space-x-2">
                      {displayOriginalPrice &&
                        displayOriginalPrice > displayPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(displayOriginalPrice, currency)}
                          </span>
                        )}
                      <span className="font-semibold text-gray-900">
                        {formatPrice(displayPrice, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
