import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, CartItem, CartSummary } from '@/lib/types';
import { Product, ProductVariant } from '@/lib/types';
import type { Currency } from './currency-store';

interface CartStore {
  cart: Cart;
  addItem: (
    product: Product,
    quantity?: number,
    variant?: ProductVariant
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartSummary: (
    currency?: Currency,
    taxAmount?: number,
    shippingAmount?: number
  ) => CartSummary;
  getItemCount: () => number;
  getCartTotal: (currency?: Currency) => number;
}

// Conversion rates from XOF (base currency) to other currencies
const CONVERSION_RATES: Record<Currency, number> = {
  XOF: 1,
  EUR: 0.0015,
  USD: 0.0016,
};

const convertPrice = (priceInXOF: number, currency: Currency): number => {
  return priceInXOF * CONVERSION_RATES[currency];
};

const calculateCartTotal = (
  items: CartItem[],
  currency: Currency = 'XOF'
): number => {
  return items.reduce((total, item) => {
    // All prices are stored in XOF, convert to target currency
    const basePriceXOF = item.product.price || 0;
    const variantPriceXOF = item.selectedVariant?.priceModifier || 0;
    const totalPriceXOF = basePriceXOF + variantPriceXOF;
    const convertedPrice = convertPrice(totalPriceXOF, currency);
    return total + convertedPrice * item.quantity;
  }, 0);
};

const calculateOriginalSubtotal = (
  items: CartItem[],
  currency: Currency = 'XOF'
): number => {
  return items.reduce((total, item) => {
    // All prices are stored in XOF
    const basePriceXOF = item.product.price || 0;
    const variantPriceXOF = item.selectedVariant?.priceModifier || 0;
    const finalPriceXOF = basePriceXOF + variantPriceXOF;

    const originalPriceXOF = item.product.originalPrice;

    // Use original price if available and greater than final price, otherwise use final price
    const priceToUseXOF =
      originalPriceXOF && originalPriceXOF > finalPriceXOF
        ? originalPriceXOF
        : finalPriceXOF;
    const convertedPrice = convertPrice(priceToUseXOF, currency);
    return total + convertedPrice * item.quantity;
  }, 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

// Create store with SSR support
const createCartStore = () =>
  create<CartStore>()(
    persist(
      (set, get) => ({
        cart: {
          id: 'cart',
          items: [],
          total: 0,
          itemCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        addItem: (product: Product, quantity = 1, variant?: ProductVariant) => {
          set((state) => {
            const existingItemIndex = state.cart.items.findIndex(
              (item) =>
                item.product.id === product.id &&
                (!variant || item.selectedVariant?.id === variant.id)
            );

            let newItems: CartItem[];

            if (existingItemIndex >= 0) {
              // Update existing item quantity
              newItems = [...state.cart.items];
              newItems[existingItemIndex] = {
                ...newItems[existingItemIndex],
                quantity: newItems[existingItemIndex].quantity + quantity,
              };
            } else {
              // Add new item
              const newItem: CartItem = {
                id: `${product.id}-${variant?.id || 'default'}-${Date.now()}`,
                product,
                quantity,
                selectedVariant: variant,
                addedAt: new Date(),
              };
              newItems = [...state.cart.items, newItem];
            }

            // Note: total is stored as XOF by default, will be recalculated on render with correct currency
            const total = calculateCartTotal(newItems);
            const itemCount = calculateItemCount(newItems);

            return {
              cart: {
                ...state.cart,
                items: newItems,
                total,
                itemCount,
                updatedAt: new Date(),
              },
            };
          });
        },

        removeItem: (itemId: string) => {
          set((state) => {
            const newItems = state.cart.items.filter(
              (item) => item.id !== itemId
            );
            const total = calculateCartTotal(newItems);
            const itemCount = calculateItemCount(newItems);

            return {
              cart: {
                ...state.cart,
                items: newItems,
                total,
                itemCount,
                updatedAt: new Date(),
              },
            };
          });
        },

        updateQuantity: (itemId: string, quantity: number) => {
          if (quantity <= 0) {
            get().removeItem(itemId);
            return;
          }

          set((state) => {
            const newItems = state.cart.items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            );
            const total = calculateCartTotal(newItems);
            const itemCount = calculateItemCount(newItems);

            return {
              cart: {
                ...state.cart,
                items: newItems,
                total,
                itemCount,
                updatedAt: new Date(),
              },
            };
          });
        },

        clearCart: () => {
          set((state) => ({
            cart: {
              ...state.cart,
              items: [],
              total: 0,
              itemCount: 0,
              updatedAt: new Date(),
            },
          }));
        },

        getCartTotal: (currency: Currency = 'XOF'): number => {
          const { cart } = get();
          return calculateCartTotal(cart.items, currency);
        },

        getCartSummary: (
          currency: Currency = 'XOF',
          taxAmount: number = 0,
          shippingAmount: number = 0
        ): CartSummary => {
          const { cart } = get();
          const subtotal = calculateCartTotal(cart.items, currency);
          const originalSubtotal = calculateOriginalSubtotal(
            cart.items,
            currency
          );
          const discount =
            originalSubtotal > subtotal ? originalSubtotal - subtotal : 0;

          return {
            subtotal,
            originalSubtotal:
              originalSubtotal > subtotal ? originalSubtotal : undefined,
            tax: taxAmount,
            shipping: shippingAmount,
            discount,
            // Subtotal already reflects discounted prices, so don't subtract discount again
            // Discount is only for display purposes to show savings
            total: subtotal + taxAmount + shippingAmount,
          };
        },

        getItemCount: (): number => {
          return get().cart.itemCount;
        },
      }),
      {
        name: 'obled225-cart',
        storage: createJSONStorage(() => {
          // Check if we're in browser environment
          if (typeof window !== 'undefined') {
            return localStorage;
          }
          return {
            getItem: () => null,
            setItem: () => null,
            removeItem: () => null,
          };
        }),
        skipHydration: false, // Enable automatic hydration from localStorage
      }
    )
  );

export const useCartStore = createCartStore();
