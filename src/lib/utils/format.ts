/**
 * Currency formatting utilities
 *
 * Formats:
 * - XOF: "15 000 F CFA" (French number format with spaces as thousand separators, no decimals)
 * - USD: "55 $" or "55.50 $" (space before symbol, symbol on right, up to 2 decimals)
 * - EUR: "55 €" or "55.50 €" (space before symbol, symbol on right, up to 2 decimals)
 */

export type Currency = 'XOF' | 'USD' | 'EUR';

/**
 * Format a number with French locale (spaces as thousand separators)
 * @param value - The number to format
 * @param maxDecimals - Maximum number of decimal places (default: 0)
 */
function formatFrenchNumber(value: number, maxDecimals: number = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
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
 * formatPrice(55.5, 'USD') // "55.50 $"
 * formatPrice(55.5, 'EUR') // "55.50 €"
 */
export function formatPrice(
  price: number,
  currency: Currency | string = 'XOF'
): string {
  const numericValue =
    typeof price === 'number' ? price : parseFloat(String(price)) || 0;
  const normalizedCurrency = (currency as string).toUpperCase() as Currency;

  switch (normalizedCurrency) {
    case 'XOF':
      // French format: "15 000 F CFA" (no decimals)
      return `${formatFrenchNumber(numericValue, 0)} F CFA`;

    case 'USD':
      // Format: "55 $" or "55.50 $" (space before symbol, up to 2 decimals)
      return `${formatFrenchNumber(numericValue, 2)} $`;

    case 'EUR':
      // Format: "55 €" or "55.50 €" (space before symbol, up to 2 decimals)
      return `${formatFrenchNumber(numericValue, 2)} €`;

    default:
      // Fallback to XOF format (no decimals)
      return `${formatFrenchNumber(numericValue, 0)} F CFA`;
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
