import { useState, useEffect, useMemo } from 'react';
import { useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency-store';
import {
  getTaxSettings,
  calculateTax,
  type TaxSettings,
} from '@/lib/sanity/queries';
import type { CartSummary } from '@/lib/types';

interface UseCartPricingOptions {
  /**
   * Shipping cost to include in the cart summary
   * @default 0
   */
  shippingCost?: number;
}

interface CartPricingResult {
  /**
   * Tax settings from Sanity
   */
  taxSettings: TaxSettings | null;
  /**
   * Calculated tax amount based on discounted subtotal
   */
  taxAmount: number;
  /**
   * Complete cart summary including subtotal, discount, tax, shipping, and total
   */
  cartSummary: CartSummary;
  /**
   * Whether tax settings are still loading
   */
  isLoading: boolean;
}

/**
 * Custom hook to centralize cart pricing calculations
 *
 * This hook handles:
 * - Fetching tax settings from Sanity
 * - Calculating tax on discounted subtotal
 * - Getting complete cart summary
 *
 * This eliminates duplication across components like:
 * - cart-summary.tsx
 * - checkout-client.tsx
 * - cart-drawer.tsx
 *
 * @param options - Configuration options
 * @returns Cart pricing data and loading state
 */
export function useCartPricing(
  options: UseCartPricingOptions = {}
): CartPricingResult {
  const { shippingCost = 0 } = options;
  const { getCartSummary, cart } = useCartStore();
  const { currency } = useCurrencyStore();
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tax settings
  useEffect(() => {
    async function fetchTaxSettings() {
      try {
        const settings = await getTaxSettings();
        setTaxSettings(settings);
      } catch (error) {
        console.error('Error fetching tax settings:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTaxSettings();
  }, []);

  // Subscribe to cart so pricing recalculates when items/quantities change (e.g. in cart drawer)
  const cartSnapshot = useMemo(() => {
    const updatedAt =
      cart.updatedAt instanceof Date
        ? cart.updatedAt.getTime()
        : typeof cart.updatedAt === 'string'
          ? new Date(cart.updatedAt).getTime()
          : 0;
    return { items: cart.items, updatedAt: updatedAt || 0 };
  }, [cart.items, cart.updatedAt]);

  // Calculate tax when subtotal or currency changes (using useMemo instead of useEffect)
  // Tax should be calculated on the discounted subtotal, not the full subtotal
  // cartSnapshot in deps forces recalc when cart changes; getCartSummary() reads store at call time
  const taxAmount = useMemo(() => {
    if (!taxSettings) return 0;

    // First, calculate the subtotal and discount
    const tempSummary = getCartSummary(currency, 0, 0);
    const discountedSubtotal = tempSummary.subtotal - tempSummary.discount;

    // Calculate tax on the discounted subtotal
    return calculateTax(discountedSubtotal, currency, taxSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cartSnapshot triggers recalc when cart items/quantity change
  }, [taxSettings, currency, getCartSummary, cartSnapshot]);

  // Get complete cart summary with tax and shipping
  // cartSnapshot in deps forces recalc when cart changes; getCartSummary() reads store at call time
  const cartSummary = useMemo(() => {
    return getCartSummary(currency, taxAmount, shippingCost);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cartSnapshot triggers recalc when cart items/quantity change
  }, [getCartSummary, currency, taxAmount, shippingCost, cartSnapshot]);

  return {
    taxSettings,
    taxAmount,
    cartSummary,
    isLoading,
  };
}
