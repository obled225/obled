import { useState, useEffect } from 'react';
import {
  getTaxSettings,
  type TaxSettings,
} from '@/lib/sanity/queries';

/**
 * Custom hook to fetch tax settings from Sanity
 * 
 * This is a simpler hook for components that only need tax settings
 * (e.g., to display "All taxes included" message)
 * 
 * For components that need full cart pricing calculations, use useCartPricing instead.
 * 
 * @returns Tax settings and loading state
 */
export function useTaxSettings(): {
  taxSettings: TaxSettings | null;
  isLoading: boolean;
} {
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return {
    taxSettings,
    isLoading,
  };
}
