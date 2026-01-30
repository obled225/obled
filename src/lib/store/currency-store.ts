import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Currency = 'XOF' | 'EUR' | 'USD';

interface CurrencyStore {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: 'XOF',
      setCurrency: (currency: Currency) => set({ currency }),
      toggleCurrency: () => {
        const current = get().currency;
        // Cycle through: XOF -> EUR -> USD -> XOF
        if (current === 'XOF') {
          set({ currency: 'EUR' });
        } else if (current === 'EUR') {
          set({ currency: 'USD' });
        } else if (current === 'USD') {
          set({ currency: 'XOF' });
        } else {
          // Fallback: if somehow an invalid currency, reset to XOF
          set({ currency: 'XOF' });
        }
      },
    }),
    {
      name: 'kysfactory-currency',
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
