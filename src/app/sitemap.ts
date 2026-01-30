import { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/lib/translations/i18n';
import { siteUrl } from '@/lib/utils/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseRoutes = [
    '',
    '/about',
    '/shop',
    '/products',
    '/business',
    '/faq',
    '/terms',
    '/cart',
  ];

  // Generate sitemap entries for all locales
  const routes: MetadataRoute.Sitemap = [];

  // Add base routes for each locale
  for (const locale of locales) {
    for (const route of baseRoutes) {
      const url =
        locale === defaultLocale
          ? `${siteUrl}${route}`
          : `${siteUrl}/${locale}${route}`;

      routes.push({
        url,
        lastModified: new Date(),
        changeFrequency:
          route === '' ? 'daily' : route === '/products' ? 'daily' : 'weekly',
        priority:
          route === ''
            ? 1
            : route === '/about' || route === '/shop'
              ? 0.9
              : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [
              loc,
              loc === defaultLocale
                ? `${siteUrl}${route}`
                : `${siteUrl}/${loc}${route}`,
            ])
          ),
        },
      });
    }
  }

  // TODO: Add product pages from Sanity CMS
  // Product pages will be added dynamically when fetching from Sanity

  return routes;
}
