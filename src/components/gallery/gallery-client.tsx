'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

export interface GalleryImage {
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}

interface GalleryClientProps {
  images: GalleryImage[];
}

export function GalleryClient({ images }: GalleryClientProps) {
  const t = useTranslations('gallery');

  const displayTitle = t('title');
  const displaySubtitle = t('subtitle');

  if (!images.length) {
    return (
      <main className="grow">
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-medium text-foreground mt-8 mb-4">
              {displayTitle}
            </h1>
            {displaySubtitle && (
              <p className="text-lg sm:text-xl text-foreground/80 mb-3">
                {displaySubtitle}
              </p>
            )}
            <div className="flex justify-center items-center w-full pt-4 pb-8">
              <div className="bg-background border border-border rounded-md overflow-hidden max-w-md w-full">
                <div className="p-4 sm:p-6 text-center">
                  <p className="text-sm sm:text-base md:text-lg text-foreground/80">
                    {t('empty')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="grow">
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-medium text-foreground mt-8 mb-4">
            {displayTitle}
          </h1>
          {displaySubtitle && (
            <p className="text-lg sm:text-xl text-foreground/80 mb-3 max-w-2xl mx-auto">
              {displaySubtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {images.map((img, i) => {
            const hasDimensions = img.width != null && img.height != null;
            const aspectStyle = hasDimensions
              ? { aspectRatio: `${img.width} / ${img.height}` }
              : undefined;
            return (
              <figure
                key={i}
                className={`relative overflow-hidden rounded-lg bg-muted ${!hasDimensions ? 'aspect-square' : ''}`}
                style={aspectStyle}
              >
                <Image
                  src={img.url}
                  alt={img.caption || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
