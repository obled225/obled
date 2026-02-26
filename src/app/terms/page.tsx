import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { TermsClient } from '@/components/terms/terms-client';
import { siteUrl } from '@/lib/utils/config';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFrench = locale === 'fr';

  return {
    title: isFrench ? 'Conditions' : 'Terms',
    description: isFrench
      ? 'Découvrez comment nous collectons et protégeons vos informations personnelles.'
      : 'Learn how we collect and protect your personal information.',
    openGraph: {
      url: `${siteUrl}/terms`,
    },
    alternates: {
      canonical: `${siteUrl}/terms`,
    },
  };
}

export default function TermsPage() {
  return <TermsClient />;
}
