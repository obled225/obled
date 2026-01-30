import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import BusinessClient from './business-client';
import { siteUrl } from '@/lib/utils/config';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFrench = locale === 'fr';

  return {
    title: isFrench ? 'Offres Pro (B2B)' : 'For Businesses (B2B)',
    description: isFrench
      ? "T-shirts vierges de haute qualité pour professionnels. Packs pour marques, PME, entreprises, associations, événements et revendeurs. Production flexible à partir d'1 pièce."
      : 'High-quality blank t-shirts for professionals. Packs for brands, SMEs, businesses, associations, events and resellers. Flexible production from 1 piece.',
    openGraph: {
      url: `${siteUrl}/business`,
    },
    alternates: {
      canonical: `${siteUrl}/business`,
    },
  };
}

export default function BusinessPage() {
  return <BusinessClient />;
}
