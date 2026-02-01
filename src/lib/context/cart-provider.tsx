'use client';

import { ReactNode, useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency-store';

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const cartStore = useCartStore();
  const currencyStore = useCurrencyStore();

  // Hydrate stores on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Force hydration of both stores by accessing them
      // This triggers Zustand's persist middleware to load from localStorage
      // WITHOUT causing a state update that would trigger infinite re-renders
      void cartStore.cart.itemCount;
      void currencyStore.currency;
    }
    // Empty dependency array - only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
