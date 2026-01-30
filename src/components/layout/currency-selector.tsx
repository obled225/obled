'use client';

import { useCurrencyStore } from '@/lib/store/currency-store';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export function CurrencySelector() {
  const t = useTranslations('header.currency');
  const { currency, toggleCurrency } = useCurrencyStore();

  // Display "F CFA" when currency is XOF, otherwise display the currency code
  const displayText = currency === 'XOF' ? 'F CFA' : currency;

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
      <span className="text-sm font-medium">{displayText}</span>
    </Button>
  );
}
