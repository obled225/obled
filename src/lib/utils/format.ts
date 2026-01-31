/**
 * Currency formatting utilities
 * 
 * Formats:
 * - XOF: "15 000 F CFA" (French number format with spaces as thousand separators)
 * - USD: "55 $" (space before symbol, symbol on right)
 * - EUR: "55 €" (space before symbol, symbol on right)
 */

export type Currency = 'XOF' | 'USD' | 'EUR';

/**
 * Format a number with French locale (spaces as thousand separators)
 */
function formatFrenchNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a price with the appropriate currency format
 * 
 * @param price - The price value
 * @param currency - The currency code (XOF, USD, or EUR) - accepts string for backward compatibility
 * @returns Formatted price string with currency symbol on the right
 * 
 * @example
 * formatPrice(15000, 'XOF') // "15 000 F CFA"
 * formatPrice(55, 'USD') // "55 $"
 * formatPrice(55, 'EUR') // "55 €"
 */
export function formatPrice(price: number, currency: Currency | string = 'XOF'): string {
  const numericValue = typeof price === 'number' ? price : parseFloat(String(price)) || 0;
  const normalizedCurrency = (currency as string).toUpperCase() as Currency;

  switch (normalizedCurrency) {
    case 'XOF':
      // French format: "15 000 F CFA"
      return `${formatFrenchNumber(numericValue)} F CFA`;
    
    case 'USD':
      // Format: "55 $" (space before symbol)
      return `${formatFrenchNumber(numericValue)} $`;
    
    case 'EUR':
      // Format: "55 €" (space before symbol)
      return `${formatFrenchNumber(numericValue)} €`;
    
    default:
      // Fallback to XOF format
      return `${formatFrenchNumber(numericValue)} F CFA`;
  }
}

/**
 * Get currency display name
 * 
 * @param currency - The currency code
 * @returns Display name for the currency
 */
export function getCurrencyDisplayName(currency: Currency): string {
  switch (currency) {
    case 'XOF':
      return 'F CFA';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    default:
      return 'F CFA';
  }
}

/**
 * Get currency full name
 * 
 * @param currency - The currency code
 * @returns Full name for the currency
 */
export function getCurrencyFullName(currency: Currency): string {
  switch (currency) {
    case 'XOF':
      return 'West African CFA Franc';
    case 'USD':
      return 'US Dollar';
    case 'EUR':
      return 'Euro';
    default:
      return 'West African CFA Franc';
  }
}
