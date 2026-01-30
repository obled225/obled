import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, CartItem, CartSummary } from '@/lib/types';
import { Product, ProductVariant } from '@/lib/types';

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
  getCartSummary: () => CartSummary;
  getItemCount: () => number;
}

const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const variantPrice = item.selectedVariant?.priceModifier || 0;
    return total + (item.product.price + variantPrice) * item.quantity;
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

        getCartSummary: (): CartSummary => {
          const { cart } = get();
          const subtotal = cart.total;
          const tax = subtotal * 0.1; // 10% tax
          const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
          const discount = 0; // Could be implemented with coupons

          return {
            subtotal,
            tax,
            shipping,
            discount,
            total: subtotal + tax + shipping - discount,
          };
        },

        getItemCount: (): number => {
          return get().cart.itemCount;
        },
      }),
      {
        name: 'kysfactory-cart',
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
        skipHydration: true,
      }
    )
  );

export const useCartStore = createCartStore();
