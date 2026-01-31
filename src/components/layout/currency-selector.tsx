'use client';

import { useCurrencyStore } from '@/lib/store/currency-store';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export function CurrencySelector() {
  const t = useTranslations('header.currency');
  const { currency, toggleCurrency } = useCurrencyStore();

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
