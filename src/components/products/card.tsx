'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, formatPrice, getProductPrice } from '@/lib/types';
import { useCurrencyStore } from '@/lib/store/currency-store';
import { useTranslations } from 'next-intl';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('products');
  const { currency } = useCurrencyStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const lastSeenIndexRef = useRef(0); // Track the last image we saw while hovering
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get all available images
  const allImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const hasMultipleImages = allImages.length > 1;
  const hasValidImage =
    allImages.length > 0 && allImages[0] && allImages[0].trim() !== '';

  // Handle hover state changes
  useEffect(() => {
    // Clear any existing intervals/timeouts
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isHovering) {
      // Reset to image 1 when hover ends
      setCurrentImageIndex(0);
      return;
    }

    if (!hasMultipleImages) return;

    // Determine starting index: if we've seen images before, start from the last one we saw
    // Otherwise start from image 2 (index 1)
    const startIndex =
      lastSeenIndexRef.current > 0
        ? lastSeenIndexRef.current // Continue from where we left off
        : 1; // First time - start from image 2

    // Immediately show the starting image
    setCurrentImageIndex(startIndex);
    lastSeenIndexRef.current = startIndex;

    // After 2 seconds, start cycling through all images
    timeoutRef.current = setTimeout(() => {
      // First move to next image after 2 seconds
      setCurrentImageIndex((prev) => {
        const nextIndex = (prev + 1) % allImages.length;
        // Only update lastSeenIndex if it's not image 1 (index 0)
        if (nextIndex > 0) {
          lastSeenIndexRef.current = nextIndex;
        }
        return nextIndex;
      });

      // Then continue cycling every 2 seconds through all images
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => {
          // Move to next image, cycling back to 0 after last image
          const nextIndex = (prev + 1) % allImages.length;
          // Only update lastSeenIndex if it's not image 1 (index 0)
          if (nextIndex > 0) {
            lastSeenIndexRef.current = nextIndex;
          }
          return nextIndex;
        });
      }, 2000); // Change image every 2 seconds
    }, 2000); // Wait 2 seconds before starting the cycle

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHovering, hasMultipleImages, allImages.length]);

  // Get price for selected currency
  const currentPrice =
    getProductPrice(product, currency) ||
    getProductPrice(product, 'XOF') ||
    product.prices[0];
  const displayPrice = currentPrice?.basePrice || product.price;
  const displayCurrency = currentPrice?.currency || product.currency;
  const displayOriginalPrice = currentPrice?.originalPrice;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative aspect-3/4 overflow-hidden bg-gray-100 rounded-md">
        {hasValidImage ? (
          <>
            {allImages.map((imageUrl, index) => (
              <Image
                key={index}
                src={imageUrl}
                alt={`${product.name} - Image ${index + 1}`}
                fill
                className={`object-cover transition-opacity duration-500 ${
                  index === currentImageIndex
                    ? 'opacity-100'
                    : 'opacity-0 absolute'
                }`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            <span>No image</span>
          </div>
        )}
        {!product.inStock && (
          <span className="absolute bottom-4 left-4 rounded-sm bg-gray-900 px-3 py-1.5 text-xs font-medium text-white z-10">
            {t('outOfStock')}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-normal text-gray-900 leading-snug group-hover:underline">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          {displayOriginalPrice && displayOriginalPrice > displayPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(displayOriginalPrice, displayCurrency)}
            </span>
          )}
          <span className="text-sm font-medium text-gray-900">
            {displayOriginalPrice && displayOriginalPrice > displayPrice
              ? `${t('from')} ${formatPrice(displayPrice, displayCurrency)}`
              : formatPrice(displayPrice, displayCurrency)}
          </span>
        </div>
      </div>
    </Link>
  );
}
