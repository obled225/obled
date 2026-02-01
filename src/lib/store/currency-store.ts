import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Currency = 'XOF' | 'EUR' | 'USD';

// Conversion rates from XOF (base currency) to other currencies
// These rates should be updated periodically based on current exchange rates
const CONVERSION_RATES: Record<Currency, number> = {
  XOF: 1, // Base currency
  EUR: 0.0015, // 1 XOF = 0.0015 EUR (approximately 1 EUR = 655.957 XOF)
  USD: 0.0016, // 1 XOF = 0.0016 USD (approximately 1 USD = 600 XOF)
};

interface CurrencyStore {
  currency: Currency;
  conversionRates: Record<Currency, number>;
  _hasHydrated: boolean;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  setHasHydrated: (state: boolean) => void;
  convertPrice: (priceInXOF: number, targetCurrency?: Currency) => number;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: 'XOF',
      conversionRates: CONVERSION_RATES,
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
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
      convertPrice: (priceInXOF: number, targetCurrency?: Currency) => {
        const currency = targetCurrency || get().currency;
        const rate = CONVERSION_RATES[currency];
        return priceInXOF * rate;
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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
