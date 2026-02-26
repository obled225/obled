'use client';

import { useCurrencyStore } from '@/lib/store/currency-store';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';

export function CurrencySelector() {
  const t = useTranslations('header.currency');
  const { currency, toggleCurrency, _hasHydrated } = useCurrencyStore();

  // Display format: F CFA / EUR € / USD $
  const getDisplayText = () => {
    switch (currency) {
      case 'XOF':
        return 'F CFA';
      case 'EUR':
        return 'EUR €';
      case 'USD':
        return 'USD $';
      default:
        return 'F CFA';
    }
  };

  const handleCurrencyToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toggleCurrency();
  };

  // Show skeleton while hydrating (before mount or before hydration completes)
  // Check window directly to avoid setState in effects
  const isMounted = typeof window !== 'undefined';
  if (!isMounted || !_hasHydrated) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="px-3 h-9"
        aria-label={t('ariaLabel')}
      >
        <Skeleton className="h-8 w-12 rounded-md" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCurrencyToggle}
      className="px-3 h-9"
      aria-label={t('ariaLabel')}
    >
      <span className="text-sm font-medium">{getDisplayText()}</span>
    </Button>
  );
}
