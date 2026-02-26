import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { AboutClient } from '@/components/about/about-client';
import { siteUrl } from '@/lib/utils/config';
import { getAboutPage } from '@/lib/sanity/queries';
import { getSanityImageUrl } from '@/lib/sanity/client';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFrench = locale === 'fr';

  return {
    title: isFrench ? 'À Propos' : 'About',
    description: isFrench
      ? "O'bled est un fabricant textile basé à Abidjan, spécialisé dans la production de t- shirts vierges de haute qualité pour professionnels."
      : "O'bled is a textile manufacturer based in Abidjan, specialized in high - quality blank t - shirt production for professionals.",
    openGraph: {
      url: `${siteUrl}/about`,
    },
    alternates: {
      canonical: `${siteUrl}/about`,
    },
  };
}

export default async function AboutPage() {
  const aboutPageData = await getAboutPage();

  // Transform the data for the client component
  const heroVideoUrl = aboutPageData?.heroVideoUrl;

  // Transform section images
  const sectionImages =
    aboutPageData?.sectionImages?.map((sectionImage) => ({
      url: sectionImage.image?.asset
        ? getSanityImageUrl(sectionImage.image.asset, 800, 600) || undefined
        : undefined,
      caption: sectionImage.caption,
      position: sectionImage.position,
    })) || [];

  return (
    <AboutClient heroVideoUrl={heroVideoUrl} sectionImages={sectionImages} />
  );
}
