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
  calculateTax,
  type TaxSettings,
} from '@/lib/sanity/queries';
import { useTranslations } from 'next-intl';

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
  const { currency } = useCurrencyStore();
  const t = useTranslations('header.cart');
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [shippingCost, setShippingCost] = useState(0);
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);

  // Fetch tax settings
  useEffect(() => {
    async function fetchTaxSettings() {
      const settings = await getTaxSettings();
      setTaxSettings(settings);
    }
    fetchTaxSettings();
  }, []);

  // Calculate tax when subtotal or currency changes (using useMemo instead of useEffect)
  const taxAmount = useMemo(() => {
    if (!taxSettings) return 0;
    
    // Calculate subtotal manually
    const subtotal = cart.items.reduce((total, item) => {
      const priceObj = item.product.prices?.find((p) => p.currency === currency) || item.product.prices?.[0];
      const basePrice = priceObj?.basePrice || item.product.price;
      const variantPrice = item.selectedVariant?.priceModifier || 0;
      return total + (basePrice + variantPrice) * item.quantity;
    }, 0);
    
    return calculateTax(subtotal, currency, taxSettings);
  }, [taxSettings, currency, cart.items]);

  const cartSummary = getCartSummary(currency, taxAmount, shippingCost);

  const handleShippingChange = (shippingId: string, cost: number) => {
    setSelectedShipping(shippingId);
    setShippingCost(cost);
    // Notify parent component of shipping cost change
    onShippingCostChange?.(cost);
  };

  const finalTotal =
    cartSummary.subtotal +
    cartSummary.tax +
    shippingCost -
    cartSummary.discount;

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
          Summary
        </h2>

        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Subtotal ({cart.itemCount} items)
            </span>
            {cartSummary.originalSubtotal && cartSummary.originalSubtotal > cartSummary.subtotal ? (
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
              <span className="text-gray-600">Discount</span>
              <span className="text-green-600">
                {formatPrice(cartSummary.discount, currency)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {shippingCost === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                formatPrice(shippingCost, currency)
              )}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {cartSummary.tax === 0 ? t('taxesIncluded') : 'Tax'}
            </span>
            <span className="font-medium">
              {cartSummary.tax === 0 ? (
                <span className="text-gray-500 text-xs">0</span>
              ) : (
                formatPrice(cartSummary.tax, currency)
              )}
            </span>
          </div>
        </div>

        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between text-base sm:text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(finalTotal, currency)}</span>
          </div>
        </div>

        {cartSummary.subtotal < 50 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-800">
              Add {formatPrice(50 - cartSummary.subtotal, currency)} more for
              free shipping!
            </p>
          </div>
        )}

        {showCheckoutButton && (
          <Link href="/checkout" className="block mb-2 sm:mb-3">
            <Button className="w-full h-11 sm:h-12" size="lg">
              Proceed to Checkout
            </Button>
          </Link>
        )}

        {showContinueShopping && (
          <Link href="/">
            <Button variant="outline" className="w-full h-11 sm:h-12">
              Continue Shopping
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
