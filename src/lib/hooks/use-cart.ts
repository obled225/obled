'use client';

import { useCartStore } from '@/lib/store/cart-store';

export function useCart() {
  const store = useCartStore();

  // Return empty cart data during SSR
  if (typeof window === 'undefined') {
    return {
      cart: {
        id: 'cart',
        items: [],
        total: 0,
        itemCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      getCartSummary: () => ({
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
      }),
      getItemCount: () => 0,
    };
  }

  return store;
}
