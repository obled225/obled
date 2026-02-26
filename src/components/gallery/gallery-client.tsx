'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { FullscreenGallery } from '@/components/products/fullscreen-gallery';

export interface GalleryImage {
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}

interface GalleryClientProps {
  images: GalleryImage[];
}

function useColumnCount() {
  const [cols, setCols] = useState(2);
  useEffect(() => {
    const mq = (n: number) => window.matchMedia(`(min-width: ${n}px)`).matches;
    const update = () => {
      if (mq(1024)) setCols(4);
      else if (mq(640)) setCols(3);
      else setCols(2);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return cols;
}

function GalleryItem({
  img,
  index,
  failed,
  isEager,
  onError,
  onZoom,
  t,
}: {
  img: GalleryImage;
  index: number;
  failed: boolean;
  isEager: boolean;
  onError: (url: string) => void;
  onZoom: (index: number) => void;
  t: (key: string) => string;
}) {
  const hasDimensions = img.width != null && img.height != null;
  const aspectStyle = hasDimensions
    ? { aspectRatio: `${img.width} / ${img.height}` }
    : undefined;
  return (
    <figure
      role="button"
      tabIndex={0}
      onClick={() => !failed && onZoom(index)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !failed) {
          e.preventDefault();
          onZoom(index);
        }
      }}
      className={`relative overflow-hidden rounded-lg bg-muted mb-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${!hasDimensions ? 'aspect-square' : ''}`}
      style={aspectStyle}
      aria-label={img.caption || 'View image'}
    >
      {failed ? (
        <div
          className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm"
          aria-hidden
        >
          {t('imageError') || 'Image unavailable'}
        </div>
      ) : (
        <Image
          src={img.url}
          alt={img.caption || ''}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading={isEager ? 'eager' : 'lazy'}
          unoptimized={img.url.includes('cdn.sanity.io')}
          onError={() => onError(img.url)}
        />
      )}
      {img.caption && !failed && (
        <figcaption className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1.5 truncate pointer-events-none">
          {img.caption}
        </figcaption>
      )}
    </figure>
  );
}

export function GalleryClient({ images }: GalleryClientProps) {
  const t = useTranslations('gallery');
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const [isFullscreenGalleryOpen, setIsFullscreenGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const displayTitle = t('title');
  const displaySubtitle = t('subtitle');

  const handleImageError = useCallback((url: string) => {
    setFailedUrls((prev) => new Set(prev).add(url));
  }, []);

  const handleZoom = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsFullscreenGalleryOpen(true);
  }, []);

  const imageUrls = useMemo(() => images.map((img) => img.url), [images]);

  const columnCount = useColumnCount();
  const columns = useMemo(() => {
    const cols: GalleryImage[][] = Array.from(
      { length: columnCount },
      () => []
    );
    images.forEach((img, i) => cols[i % columnCount].push(img));
    return cols;
  }, [images, columnCount]);

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

        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          }}
        >
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col min-w-0">
              {col.map((img, i) => {
                const globalIndex = colIndex + i * columnCount;
                return (
                  <GalleryItem
                    key={globalIndex}
                    img={img}
                    index={globalIndex}
                    failed={failedUrls.has(img.url)}
                    isEager={globalIndex === 0}
                    onError={handleImageError}
                    onZoom={handleZoom}
                    t={t}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <FullscreenGallery
          images={imageUrls}
          initialIndex={selectedImageIndex}
          isOpen={isFullscreenGalleryOpen}
          onClose={() => setIsFullscreenGalleryOpen(false)}
        />
      </section>
    </main>
  );
}
