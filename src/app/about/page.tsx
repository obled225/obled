import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { AboutClient } from '@/components/about/about-client';
import { siteUrl } from '@/lib/utils/config';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFrench = locale === 'fr';

  return {
    title: isFrench ? 'À Propos' : 'About',
    description: isFrench
      ? 'KYS Factory est un fabricant textile basé à Abidjan, spécialisé dans la production de t-shirts vierges de haute qualité pour professionnels.'
      : 'KYS Factory is a textile manufacturer based in Abidjan, specialized in high-quality blank t-shirt production for professionals.',
    openGraph: {
      url: `${siteUrl}/about`,
    },
    alternates: {
      canonical: `${siteUrl}/about`,
    },
  };
}

export default function AboutPage() {
  return <AboutClient />;
}
