'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency-store';
import { formatPrice } from '@/lib/utils/format';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface CartItemProps {
  item: CartItemType;
  showControls?: boolean;
}

export function CartItem({ item, showControls = true }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const { currency, convertPrice } = useCurrencyStore();
  const t = useTranslations('header.cart');

  // All prices are in XOF, convert to selected currency
  const basePriceXOF = item.product.price || 0;
  const variantPriceXOF = item.selectedVariant?.priceModifier || 0;
  const totalPriceXOF = basePriceXOF + variantPriceXOF;
  const convertedPrice = convertPrice(totalPriceXOF, currency);
  const itemTotal = convertedPrice * item.quantity;

  return (
    <div className="bg-white border border-gray-200 rounded-md p-3 sm:p-4 hover:shadow-sm transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-start gap-3 sm:items-center sm:flex-1 sm:min-w-0">
          <div className="relative w-16 h-16 sm:w-16 sm:h-16 shrink-0 bg-gray-100 rounded-md overflow-hidden">
            {item.product.images && item.product.images[0] ? (
              <Image
                src={item.product.images[0]}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No image</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${item.product.slug}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
            >
              {item.product.name}
              {item.selectedVariant?.packSize && (
                <span className="text-gray-500 font-normal">
                  {' · '}
                  {item.selectedVariant.name}
                </span>
              )}
            </Link>

            {item.selectedVariant && !item.selectedVariant.packSize && (
              <p className="text-xs text-gray-500 mt-1">
                {`${item.selectedVariant.name}${item.selectedVariant.value ? `: ${item.selectedVariant.value}` : ''}`}
              </p>
            )}

            <div className="flex items-center gap-2 mt-1">
              {(() => {
                const packPriceXOF = basePriceXOF + variantPriceXOF;
                const packPrice = convertPrice(packPriceXOF, currency);

                // Find original price for pack if it exists
                let originalPriceXOF: number | undefined;
                if (
                  item.selectedVariant?.packSize &&
                  item.product.businessPacks
                ) {
                  const pack = item.product.businessPacks.find(
                    (p) => p.quantity === item.selectedVariant?.packSize
                  );
                  originalPriceXOF = pack?.originalPrice;
                } else {
                  originalPriceXOF = item.product.originalPrice;
                }
                const originalPrice = originalPriceXOF
                  ? convertPrice(originalPriceXOF, currency)
                  : undefined;

                return (
                  <>
                    {originalPrice && originalPrice > packPrice && (
                      <span className="text-xs text-gray-500 line-through">
                        {formatPrice(originalPrice, currency)}
                      </span>
                    )}
                    <span className="text-sm text-gray-600">
                      {formatPrice(packPrice, currency)}
                      {item.selectedVariant?.packSize ? (
                        <span className="text-xs"> {t('pack')}</span>
                      ) : (
                        <span> {t('each')}</span>
                      )}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4">
          {showControls && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                  aria-label={t('decreaseQuantity')}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-3 py-2 text-sm font-medium min-w-12 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-2 hover:bg-gray-50 touch-target"
                  aria-label={t('increaseQuantity')}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col items-end gap-2">
            <p className="text-sm sm:text-base font-semibold text-gray-900">
              {formatPrice(itemTotal, currency)}
            </p>
            {showControls && (
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 p-1 touch-target"
                aria-label={t('removeItem')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
