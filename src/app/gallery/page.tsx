import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { GalleryClient } from '@/components/gallery/gallery-client';
import { siteUrl } from '@/lib/utils/config';
import { getGalleryPage } from '@/lib/sanity/queries';
import { getSanityImageUrl } from '@/lib/sanity/client';
import type { GalleryImageItem } from '@/lib/sanity/queries';

type GalleryImage = {
  url: string;
  width?: number;
  height?: number;
  caption?: string;
};

function transformGalleryImages(
  images: GalleryImageItem[] | undefined
): GalleryImage[] {
  if (!images?.length) return [];
  const result: GalleryImage[] = [];
  for (const item of images) {
    const asset = item.asset;
    if (!asset) continue;
    const url = getSanityImageUrl(asset as Record<string, unknown>, 800);
    if (!url) continue;
    result.push({
      url,
      width: item.width,
      height: item.height,
    });
  }
  return result;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isFrench = locale === 'fr';

  return {
    title: isFrench ? 'Galerie' : 'Gallery',
    description: isFrench
      ? "Images de la marque O'bled — notre univers et notre style."
      : "O'bled brand images — our world and our style.",
    openGraph: {
      url: `${siteUrl}/gallery`,
    },
    alternates: {
      canonical: `${siteUrl}/gallery`,
    },
  };
}

export default async function GalleryPage() {
  const data = await getGalleryPage();
  const images = transformGalleryImages(data?.images);

  return <GalleryClient images={images} />;
}
