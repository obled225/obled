'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency-store';
import { formatPrice } from '@/lib/utils/format';
import { ShippingCalculator } from './shipping-calculator';
import {
  getTaxSettings,
  getGlobalFreeShippingThreshold,
  calculateTax,
  type TaxSettings,
} from '@/lib/sanity/queries';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  showContinueShopping?: boolean;
  showShippingCalculator?: boolean;
  className?: string;
  onShippingCostChange?: (cost: number) => void;
}

export function CartSummary({
  showCheckoutButton = true,
  showContinueShopping = true,
  showShippingCalculator = false,
  className = '',
  onShippingCostChange,
}: CartSummaryProps) {
  const { cart, getCartSummary } = useCartStore();
  const { currency, convertPrice } = useCurrencyStore();
  const t = useTranslations('header.cart');
  const tShipping = useTranslations('shipping');
  const [selectedShipping, setSelectedShipping] = useState<string | undefined>(
    undefined
  );
  const [shippingCost, setShippingCost] = useState(0);
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);
  const [globalFreeShippingThreshold, setGlobalFreeShippingThreshold] =
    useState<{
      enabled: boolean;
      amount?: number;
    } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch tax settings and global free shipping threshold
  useEffect(() => {
    async function fetchSettings() {
      try {
        const [tax, globalThreshold] = await Promise.all([
          getTaxSettings(),
          getGlobalFreeShippingThreshold(),
        ]);
        setTaxSettings(tax);
        setGlobalFreeShippingThreshold(globalThreshold);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // Calculate tax when subtotal or currency changes (using useMemo instead of useEffect)
  // Tax should be calculated on the discounted subtotal, not the full subtotal
  const taxAmount = useMemo(() => {
    if (!taxSettings) return 0;

    // First, calculate the subtotal and discount
    const tempSummary = getCartSummary(currency, 0, 0);
    const discountedSubtotal = tempSummary.subtotal - tempSummary.discount;

    // Calculate tax on the discounted subtotal
    return calculateTax(discountedSubtotal, currency, taxSettings);
  }, [taxSettings, currency, getCartSummary]);

  const cartSummary = getCartSummary(currency, taxAmount, shippingCost);

  // Check if global free shipping threshold is met
  const globalFreeShippingActive = useMemo(() => {
    if (
      !globalFreeShippingThreshold?.enabled ||
      globalFreeShippingThreshold?.amount === undefined
    ) {
      return false;
    }
    const thresholdInCurrency = convertPrice(
      globalFreeShippingThreshold.amount,
      currency
    );
    return cartSummary.subtotal >= thresholdInCurrency;
  }, [
    globalFreeShippingThreshold,
    cartSummary.subtotal,
    currency,
    convertPrice,
  ]);

  const handleShippingChange = (shippingId: string, cost: number) => {
    setSelectedShipping(shippingId);
    setShippingCost(cost);
    // Notify parent component of shipping cost change
    onShippingCostChange?.(cost);
  };

  // Subtotal already reflects discounted prices, so don't subtract discount again
  // Discount is only for display purposes to show savings
  const finalTotal = cartSummary.subtotal + cartSummary.tax + shippingCost;

  // Show skeleton while loading
  if (loading) {
    return (
      <div className={`space-y-4 sm:space-y-6 ${className}`}>
        {showShippingCalculator && (
          <ShippingCalculator
            subtotal={cartSummary.subtotal}
            selectedShipping={selectedShipping}
            onShippingChange={handleShippingChange}
          />
        )}

        <div className="bg-white border border-gray-200 rounded-md p-4 sm:p-6">
          {/* Title skeleton */}
          <Skeleton className="h-4 sm:h-5 w-20 mb-3 sm:mb-4" />

          {/* Summary rows skeleton */}
          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between text-sm">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>

          {/* Total skeleton */}
          <div className="border-t pt-4 mb-0">
            <div className="flex justify-between">
              <Skeleton className="h-4 sm:h-5 w-12" />
              <Skeleton className="h-4 sm:h-5 w-20" />
            </div>
          </div>

          {/* Buttons skeleton */}
          {showCheckoutButton && (
            <div className="block mb-2 sm:mb-3 mt-4">
              <Skeleton className="w-full h-11 sm:h-12 rounded-md" />
            </div>
          )}

          {showContinueShopping && (
            <div className="mt-2 sm:mt-3">
              <Skeleton className="w-full h-11 sm:h-12 rounded-md" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {showShippingCalculator && (
        <ShippingCalculator
          subtotal={cartSummary.subtotal}
          selectedShipping={selectedShipping}
          onShippingChange={handleShippingChange}
        />
      )}

      <div className="bg-white border border-gray-200 rounded-md p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
          {t('summaryTitle')}
        </h2>

        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {t('subtotalWithItems', { count: cart.itemCount })}
            </span>
            {cartSummary.originalSubtotal &&
              cartSummary.originalSubtotal > cartSummary.subtotal ? (
              <span className="text-sm text-gray-500">
                {formatPrice(cartSummary.originalSubtotal, currency)}
              </span>
            ) : (
              <span className="text-sm font-medium">
                {formatPrice(cartSummary.subtotal, currency)}
              </span>
            )}
          </div>

          {cartSummary.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('discount')}</span>
              <span className="text-green-600">
                {formatPrice(cartSummary.discount, currency)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('shipping')}</span>
            <span className="font-medium">
              {selectedShipping === 'free-shipping' ||
                (selectedShipping &&
                  (globalFreeShippingActive || shippingCost === 0)) ? (
                <span className="text-green-600 font-semibold">
                  {tShipping('free')}
                </span>
              ) : selectedShipping ? (
                formatPrice(shippingCost, currency)
              ) : (
                <span className="text-green-600 font-semibold">
                  {tShipping('free')}
                </span>
              )}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {cartSummary.tax === 0
                ? t('taxesIncluded')
                : taxSettings?.taxRates?.[0]?.name || t('tax')}
            </span>
            {cartSummary.tax !== 0 && (
              <span className="font-medium">
                {taxSettings?.taxRates?.[0]?.type === 'percentage' ? (
                  <>
                    {formatPrice(cartSummary.tax, currency)} (
                    {((taxSettings.taxRates[0].rate || 0) * 100).toFixed(1)}%)
                  </>
                ) : (
                  formatPrice(cartSummary.tax, currency)
                )}
              </span>
            )}
          </div>
        </div>

        <div className="border-t pt-4 mb-0">
          <div className="flex justify-between text-base sm:text-lg font-semibold">
            <span>{t('total')}</span>
            <span>{formatPrice(finalTotal, currency)}</span>
          </div>
        </div>

        {cartSummary.subtotal < 50 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-800">
              {t('addMoreForFreeShipping', {
                amount: formatPrice(50 - cartSummary.subtotal, currency),
              })}
            </p>
          </div>
        )}

        {showCheckoutButton && (
          <Link href="/checkout" className="block mb-2 sm:mb-3">
            <Button className="w-full h-11 sm:h-12" size="lg">
              {t('proceedToCheckout')}
            </Button>
          </Link>
        )}

        {showContinueShopping && (
          <Link href="/">
            <Button variant="outline" className="w-full h-11 sm:h-12">
              {t('continueShopping')}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
