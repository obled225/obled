/**
 * Meta Pixel (Facebook Pixel) tracking utilities
 *
 * Usage:
 * 1. Add your Meta Pixel ID to NEXT_PUBLIC_META_PIXEL_ID environment variable
 * 2. Import and use these functions in your components
 *
 * Example for checkout tracking:
 * import { trackPurchase } from '@/lib/utils/meta-pixel';
 *
 * // When user completes checkout
 * trackPurchase(totalAmount, 'USD', productIds, 'Order completed');
 */

import '@/lib/types/meta-pixel';

export function trackEvent(
  event: string,
  parameters?: Record<string, unknown>
) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, parameters);
  }
}

export function trackPurchase(
  value: number,
  currency: string = 'USD',
  contentIds?: string[],
  contentName?: string
) {
  trackEvent('Purchase', {
    value,
    currency,
    content_ids: contentIds,
    content_name: contentName,
  });
}

export function trackAddToCart(
  contentId: string,
  contentName: string,
  value: number,
  currency: string = 'USD'
) {
  trackEvent('AddToCart', {
    content_ids: [contentId],
    content_name: contentName,
    value,
    currency,
  });
}

export function trackViewContent(
  contentId: string,
  contentName: string,
  contentType: string = 'product'
) {
  trackEvent('ViewContent', {
    content_ids: [contentId],
    content_name: contentName,
    content_type: contentType,
  });
}
