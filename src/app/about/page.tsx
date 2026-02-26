import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { AboutClient } from '@/components/about/about-client';
import { siteUrl } from '@/lib/utils/config';
import { getAboutPage } from '@/lib/sanity/queries';
import { getSanityImageUrl } from '@/lib/sanity/client';
import type { AboutSection } from '@/lib/sanity/queries';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: locale === 'fr' ? 'À Propos' : 'About',
    description:
      "Porter O'bled c'est notre langage, notre fierté. Vêtements et accessoires inspirés du Nouchi et fabriqués entièrement en Côte d'Ivoire.",
    openGraph: {
      url: `${siteUrl}/about`,
    },
    alternates: {
      canonical: `${siteUrl}/about`,
    },
  };
}

function transformSections(sections: AboutSection[] | undefined) {
  if (!sections?.length) return [];
  return sections.map((sec) => ({
    title: sec.title,
    subtitle: sec.subtitle,
    body: sec.body,
    images:
      sec.images?.map((img) => ({
        url: img.asset
          ? getSanityImageUrl(img.asset as Record<string, unknown>, 800, 600) ||
            undefined
          : undefined,
        caption: img.caption,
      })) ?? [],
  }));
}

export default async function AboutPage() {
  const data = await getAboutPage();

  const heroVideoUrl = data?.heroVideoUrl ?? undefined;
  const heroTitle = data?.heroTitle ?? undefined;
  const heroSubtitle = data?.heroSubtitle ?? undefined;
  const heroDescription = data?.heroDescription ?? undefined;
  const sections = transformSections(data?.sections);

  return (
    <AboutClient
      heroVideoUrl={heroVideoUrl}
      heroTitle={heroTitle}
      heroSubtitle={heroSubtitle}
      heroDescription={heroDescription}
      sections={sections}
    />
  );
}
