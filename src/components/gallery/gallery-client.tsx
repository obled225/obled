'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

const ASPECT_CLASSES: Record<string, string> = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '3:4': 'aspect-[3/4]',
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
  '3:2': 'aspect-[3/2]',
  '2:3': 'aspect-[2/3]',
};

export interface GalleryImage {
  url: string;
  aspectRatio?: string;
  caption?: string;
}

interface GalleryClientProps {
  title?: string;
  subtitle?: string;
  images: GalleryImage[];
}

export function GalleryClient({
  title,
  subtitle,
  images,
}: GalleryClientProps) {
  const t = useTranslations('gallery');

  const displayTitle = title ?? t('title');
  const displaySubtitle = subtitle ?? t('subtitle');

  if (!images.length) {
    return (
      <main className="grow">
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground">
              {displayTitle}
            </h1>
            {displaySubtitle && (
              <p className="mt-2 text-foreground/70">{displaySubtitle}</p>
            )}
            <p className="mt-8 text-foreground/60">{t('empty')}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="grow">
      <section className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            {displayTitle}
          </h1>
          {displaySubtitle && (
            <p className="mt-2 text-foreground/70 max-w-xl mx-auto">
              {displaySubtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {images.map((img, i) => {
            const aspectClass =
              ASPECT_CLASSES[img.aspectRatio ?? '1:1'] ?? 'aspect-square';
            return (
              <figure
                key={i}
                className={`relative overflow-hidden rounded-lg bg-muted ${aspectClass}`}
              >
                <Image
                  src={img.url}
                  alt={img.caption || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
                {img.caption && (
                  <figcaption className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1.5 truncate">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </section>
    </main>
  );
}
