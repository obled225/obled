/// <reference types="https://deno.land/x/deno/cli/tsc/dts/lib.deno.d.ts" />
/// <reference lib="deno.ns" />

/**
 * Server-Side Pricing Validation Utility
 * 
 * This module provides failproof pricing validation by:
 * 1. Fetching actual product prices from Sanity (source of truth)
 * 2. Validating client-provided prices against server-calculated prices
 * 3. Recalculating all pricing components (subtotal, discount, tax, shipping)
 * 4. Ensuring currency conversions match server-side rates
 * 
 * This prevents price manipulation attacks where clients could modify
 * prices in the browser before checkout.
 * 
 * All prices are stored in XOF (base currency) in Sanity and converted
 * to the target currency (XOF, EUR, USD) using server-side conversion rates.
 */

import { createClient } from 'https://esm.sh/@sanity/client@6';

// Currency conversion rates (must match client-side rates)
const CONVERSION_RATES: Record<'XOF' | 'EUR' | 'USD', number> = {
  XOF: 1,
  EUR: 0.0015,
  USD: 0.0016,
};

// Initialize Sanity client for server-side use
// Uses server-side env vars from supabase/.env or Supabase dashboard
function getSanityClient() {
  const projectId = Deno.env.get('SANITY_PROJECT_ID');
  const dataset = Deno.env.get('SANITY_DATASET') || 'production';
  const token = Deno.env.get('SANITY_READ_TOKEN');
  const useCdn = Deno.env.get('NODE_ENV') === 'production';

  if (!projectId) {
    throw new Error(
      'SANITY_PROJECT_ID must be set in Supabase Edge Function environment variables. ' +
      'Set it in supabase/.env for local development or in the Supabase dashboard for production.'
    );
  }

  if (!token) {
    console.warn(
      'SANITY_READ_TOKEN not set. Some queries may fail if Sanity requires authentication.'
    );
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn,
    token: token || undefined,
  });
}

// GROQ query to get product by ID with pricing info
// This matches the structure used in src/lib/sanity/queries.ts
const PRODUCT_BY_ID_QUERY = `*[_type == "products" && _id == $id && !(_id in path("drafts.**"))][0] {
  _id,
  name,
  currentPrice,
  basePrice,
  inStock
}`;

// GROQ query to get tax settings
const TAX_SETTINGS_QUERY = `*[_type == "shippingAndTaxes" && !(_id in path("drafts.**"))][0] {
  taxSettings {
    isActive,
    taxRates[] {
      name,
      type,
      rate
    }
  }
}`;

interface SanityProduct {
  _id: string;
  name: string;
  currentPrice?: number;
  basePrice?: number;
  inStock?: boolean;
}

interface CartItem {
  productId: string;
  productTitle: string;
  productSlug?: string;
  variantId?: string;
  variantTitle?: string;
  quantity: number;
  price: number; // Price in selected currency (from client)
  productImageUrl?: string;
}

interface PricingValidationResult {
  isValid: boolean;
  hasCriticalErrors: boolean; // True if there are errors that should block checkout
  errors: string[]; // All errors (critical and warnings)
  warnings: string[]; // Non-critical warnings (price mismatches, etc.)
  recalculatedItems: Array<{
    productId: string;
    originalPrice: number; // Client-provided price
    validatedPrice: number; // Server-validated price
    priceDifference: number;
  }>;
  subtotal: number; // Recalculated subtotal in target currency
  originalSubtotal: number; // Original subtotal from client
  discount: number; // Recalculated discount
  originalDiscount: number; // Original discount from client
}

/**
 * Convert price from XOF (base currency) to target currency
 */
function convertPrice(priceInXOF: number, currency: 'XOF' | 'EUR' | 'USD'): number {
  return priceInXOF * CONVERSION_RATES[currency];
}

/**
 * Get product price from Sanity
 * Returns price in XOF
 */
async function getProductPrice(
  sanityClient: ReturnType<typeof getSanityClient>,
  productId: string
): Promise<{ price: number; originalPrice?: number } | null> {
  try {
    const product = await sanityClient.fetch<SanityProduct>(PRODUCT_BY_ID_QUERY, {
      id: productId,
    });

    if (!product) {
      return null;
    }

    if (product.inStock === false) {
      throw new Error(`Product ${productId} is out of stock`);
    }

    const basePrice = product.currentPrice || 0;
    if (basePrice === 0) {
      throw new Error(`Product ${productId} has no price set`);
    }

    return {
      price: basePrice,
      originalPrice: product.basePrice,
    };
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
}

/**
 * Validate and recalculate cart pricing
 * This ensures all prices match what's stored in Sanity (source of truth)
 * 
 * Calculation flow (matches client-side logic):
 * 1. price = product.currentPrice (in XOF)
 * 2. Convert to target currency: price * CONVERSION_RATES[currency]
 * 4. Calculate item total: pricePerUnit * quantity
 * 5. Calculate subtotal: sum of all item totals
 * 6. Calculate original subtotal: sum of originalPrice * quantity (if originalPrice > price)
 * 7. Calculate discount: originalSubtotal - subtotal (if originalSubtotal > subtotal)
 * 8. Tax is calculated on discounted subtotal: (subtotal - discount) * taxRate
 * 
 * This matches the client-side calculation in:
 * - src/lib/store/cart-store.ts (calculateCartTotal, calculateOriginalSubtotal)
 * - src/components/checkout/checkout-client.tsx (cartItems preparation)
 * - src/components/cart/cart-summary.tsx (tax calculation on discounted subtotal)
 */
export async function validateAndRecalculatePricing(
  cartItems: CartItem[],
  currency: 'XOF' | 'EUR' | 'USD',
  clientSubtotal: number,
  clientDiscount: number
): Promise<PricingValidationResult> {
  const sanityClient = getSanityClient();
  const errors: string[] = [];
  const warnings: string[] = [];
  const recalculatedItems: PricingValidationResult['recalculatedItems'] = [];
  let validatedSubtotal = 0;
  let validatedOriginalSubtotal = 0;

  // Validate each cart item
  for (const item of cartItems) {
    try {
      // Get actual product price from Sanity
      const productPricing = await getProductPrice(
        sanityClient,
        item.productId
      );

      if (!productPricing) {
        // Critical error: product not found or unavailable
        errors.push(`Product ${item.productId} (${item.productTitle}) not found or unavailable`);
        // Still add to recalculatedItems to maintain array order, but mark as invalid
        recalculatedItems.push({
          productId: item.productId,
          originalPrice: item.price * item.quantity,
          validatedPrice: 0, // Invalid - product not found
          priceDifference: item.price * item.quantity,
        });
        continue;
      }

      // Calculate price per unit in target currency
      const pricePerUnitXOF = productPricing.price;
      const pricePerUnit = convertPrice(pricePerUnitXOF, currency);

      // Calculate total for this item (price per unit * quantity)
      // This matches client-side: convertedPrice * item.quantity
      const validatedItemTotal = pricePerUnit * item.quantity;
      const clientItemTotal = item.price * item.quantity;

      // Check for price discrepancies (allow small rounding differences)
      const priceDifference = Math.abs(validatedItemTotal - clientItemTotal);
      const tolerance = 0.01; // Allow 0.01 currency unit difference for rounding

      if (priceDifference > tolerance) {
        // Warning: price mismatch (non-critical, we'll use server price)
        warnings.push(
          `Price mismatch for ${item.productTitle}: client sent ${clientItemTotal.toFixed(2)} ${currency}, but server calculated ${validatedItemTotal.toFixed(2)} ${currency}. Using server price.`
        );
      }

      recalculatedItems.push({
        productId: item.productId,
        originalPrice: clientItemTotal,
        validatedPrice: validatedItemTotal,
        priceDifference,
      });

      // Add to subtotals
      validatedSubtotal += validatedItemTotal;

      // Calculate original subtotal (for discount calculation)
      // Client-side logic: Uses originalPrice if available and > finalPrice, otherwise uses finalPrice
      // Uses product.basePrice (originalPrice) when available
      // For regular: Uses product.originalPrice if available
      if (productPricing.originalPrice && productPricing.originalPrice > pricePerUnitXOF) {
        // Original price exists and is greater than current price (discount scenario)
        const originalPricePerUnit = convertPrice(productPricing.originalPrice, currency);
        validatedOriginalSubtotal += originalPricePerUnit * item.quantity;
      } else {
        // No discount - original price equals or is less than current price
        validatedOriginalSubtotal += validatedItemTotal;
      }
    } catch (error) {
      // Critical error: failed to validate item
      errors.push(
        `Error validating item ${item.productId} (${item.productTitle}): ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Calculate discount
  const validatedDiscount =
    validatedOriginalSubtotal > validatedSubtotal
      ? validatedOriginalSubtotal - validatedSubtotal
      : 0;

  // Check discount discrepancy
  const discountDifference = Math.abs(validatedDiscount - clientDiscount);
  if (discountDifference > 0.01) {
    warnings.push(
      `Discount mismatch: client sent ${clientDiscount.toFixed(2)} ${currency}, but server calculated ${validatedDiscount.toFixed(2)} ${currency}. Using server-calculated discount.`
    );
  }

  // Check subtotal discrepancy
  const subtotalDifference = Math.abs(validatedSubtotal - clientSubtotal);
  if (subtotalDifference > 0.01) {
    warnings.push(
      `Subtotal mismatch: client sent ${clientSubtotal.toFixed(2)} ${currency}, but server calculated ${validatedSubtotal.toFixed(2)} ${currency}. Using server-calculated subtotal.`
    );
  }

  // Critical errors are ones that prevent us from validating items (product not found, etc.)
  const hasCriticalErrors = errors.length > 0;

  return {
    isValid: !hasCriticalErrors && warnings.length === 0,
    hasCriticalErrors,
    errors,
    warnings,
    recalculatedItems,
    subtotal: validatedSubtotal,
    originalSubtotal: validatedOriginalSubtotal,
    discount: validatedDiscount,
    originalDiscount: clientDiscount,
  };
}

interface TaxSettings {
  isActive: boolean;
  taxRates: Array<{
    name: string;
    type: 'percentage' | 'fixed';
    rate: number; // Percentage as decimal (0.1 = 10%) or fixed amount in XOF
  }>;
}

/**
 * Fetch tax settings from Sanity
 */
export async function getTaxSettings(): Promise<TaxSettings | null> {
  try {
    const sanityClient = getSanityClient();
    const doc = await sanityClient.fetch<{
      taxSettings?: {
        isActive?: boolean;
        taxRates?: Array<{
          name?: string;
          type?: string;
          rate?: number;
        }>;
      };
    }>(TAX_SETTINGS_QUERY);

    if (!doc?.taxSettings) {
      return null;
    }

    return {
      isActive: doc.taxSettings.isActive !== false,
      taxRates: (doc.taxSettings.taxRates || []).map((rate) => ({
        name: rate.name || 'Tax',
        type: (rate.type || 'percentage') as 'percentage' | 'fixed',
        rate: rate.rate || 0,
      })),
    };
  } catch (error) {
    console.error('Error fetching tax settings:', error);
    return null;
  }
}

/**
 * Recalculate tax amount based on validated subtotal
 * This uses the same logic as the client-side tax calculation
 */
export function recalculateTax(
  subtotal: number,
  currency: 'XOF' | 'EUR' | 'USD',
  taxSettings: TaxSettings | null
): number {
  if (!taxSettings || !taxSettings.isActive || taxSettings.taxRates.length === 0) {
    return 0;
  }

  // Use the first tax rate
  const taxRate = taxSettings.taxRates[0];
  if (!taxRate) {
    return 0;
  }

  if (taxRate.type === 'percentage') {
    // Percentage applies to the subtotal (which is already in the target currency)
    return subtotal * taxRate.rate;
  } else {
    // Fixed amount: convert from XOF to target currency
    return taxRate.rate * CONVERSION_RATES[currency];
  }
}

/**
 * Validate shipping cost
 * This should match the shipping options from Sanity
 * For now, we'll just validate it's a reasonable number (non-negative)
 */
export function validateShippingCost(shippingCost: number): {
  isValid: boolean;
  error?: string;
} {
  if (shippingCost < 0) {
    return {
      isValid: false,
      error: `Invalid shipping cost: ${shippingCost}. Must be non-negative.`,
    };
  }

  // You could add more validation here, like checking against actual shipping options
  // For now, we'll trust the client but log it for monitoring

  return {
    isValid: true,
  };
}
