import { headers } from 'next/headers';

/**
 * Base URL for metadata (og:image, canonical, etc.).
 * Uses the actual request host when available so that on Vercel (or any host)
 * links and images use the current domain, not a hardcoded one.
 * Only use in server code (e.g. generateMetadata).
 */
export async function getMetadataBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'https';
  if (host) {
    return `${proto}://${host}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://obled225.com';
}
