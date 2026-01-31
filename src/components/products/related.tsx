'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils/format';
import { useCurrencyStore } from '@/lib/store/currency-store';

type RelatedProductsProps = {
  products: Product[];
  title?: string;
  description?: string;
};

export default function RelatedProducts({
  products,
  title = 'Related Products',
  description = 'You might also want to check out these products.',
}: RelatedProductsProps) {
  const { currency } = useCurrencyStore();

  if (!products.length) {
    return null;
  }

  return (
    <div className="py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">
          {title}
        </span>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 max-w-lg">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="group">
            <Link href={`/products/${product.slug}`} className="block">
              <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg mb-4 group-hover:shadow-lg transition-shadow">
                {product.images && product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}

                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>

                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">
                    {formatPrice(product.price, currency)}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice, currency)}
                      </span>
                    )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.category.name}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
