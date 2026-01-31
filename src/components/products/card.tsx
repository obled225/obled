'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product, formatPrice, getProductPrice } from '@/lib/types';
import { useCurrencyStore } from '@/lib/store/currency-store';
import { useTranslations } from 'next-intl';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('products');
  const { currency } = useCurrencyStore();

  const imageUrl = (product.images && product.images[0]) || product.image;
  const hasValidImage = imageUrl && imageUrl.trim() !== '';

  // Get price for selected currency
  const currentPrice =
    getProductPrice(product, currency) ||
    getProductPrice(product, 'XOF') ||
    product.prices[0];
  const displayPrice = currentPrice?.basePrice || product.price;
  const displayCurrency = currentPrice?.currency || product.currency;
  const displayOriginalPrice = currentPrice?.originalPrice;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-3/4 overflow-hidden bg-gray-100 rounded-md">
        {hasValidImage ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            <span>No image</span>
          </div>
        )}
        {!product.inStock && (
          <span className="absolute bottom-4 left-4 rounded-sm bg-gray-900 px-3 py-1.5 text-xs font-medium text-white">
            {t('outOfStock')}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-normal text-gray-900 leading-snug group-hover:underline">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          {displayOriginalPrice && displayOriginalPrice > displayPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(displayOriginalPrice, displayCurrency)}
            </span>
          )}
          <span className="text-sm font-medium text-gray-900">
            {displayOriginalPrice && displayOriginalPrice > displayPrice
              ? `${t('from')} ${formatPrice(displayPrice, displayCurrency)}`
              : formatPrice(displayPrice, displayCurrency)}
          </span>
        </div>
      </div>
    </Link>
  );
}
