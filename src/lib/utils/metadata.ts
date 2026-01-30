import type { Metadata } from 'next';
import { siteUrl } from '@/lib/utils/config';

interface GeneratePageMetadataParams {
  title: string;
  description: string;
  keywords: string;
  path: string;
  locale: string;
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
}

/**
 * Generates page-specific metadata.
 * Includes all common SEO fields to ensure consistency even if Next.js replaces nested objects.
 * The layout provides defaults, but this ensures pages have complete metadata objects.
 */
export function generatePageMetadata({
  title,
  description,
  keywords,
  path,
  locale,
  robots,
}: GeneratePageMetadataParams): Metadata {
  const isFrench = locale === 'fr';
  const url = path === '/' ? siteUrl : `${siteUrl}${path}`;

  return {
    title,
    description,
    keywords,
    ...(robots && { robots }),
    openGraph: {
      title,
      description,
      url,
      siteName: 'Kys Factory',
      images: [
        {
          url: `${siteUrl}/icon.webp`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: isFrench ? 'fr_FR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/icon.webp`],
      creator: '@kysfactoryciv',
    },
    alternates: {
      canonical: url,
    },
  };
}
