'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store/cart-store';
import { useCurrencyStore } from '@/lib/store/currency-store';

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const cartStore = useCartStore();
  const currencyStore = useCurrencyStore();

  // Hydrate stores on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Zustand persist middleware will automatically hydrate when skipHydration is false
      // But we need to wait for hydration to complete before rendering
      // Access the stores to trigger hydration
      void cartStore.cart.itemCount;
      void currencyStore.currency;

      // Mark as hydrated after a brief delay to ensure localStorage is read
      const timer = setTimeout(() => {
        setIsHydrated(true);
      }, 0);

      return () => clearTimeout(timer);
    } else {
      setTimeout(() => {
        setIsHydrated(true);
      }, 0);
    }
  }, [cartStore, currencyStore]);

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
