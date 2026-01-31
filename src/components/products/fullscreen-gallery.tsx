'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface FullscreenGalleryProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function FullscreenGallery({
  images,
  initialIndex,
  isOpen,
  onClose,
}: FullscreenGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const imageContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingRef = useRef(false);

  // Update current index when initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setCurrentIndex(initialIndex);
      }, 100);
    }
  }, [initialIndex, isOpen]);

  // Scroll to current image when index changes (programmatically)
  useEffect(() => {
    if (!isOpen || !containerRef.current || isScrollingRef.current) return;

    const targetContainer = imageContainerRefs.current[currentIndex];
    if (targetContainer) {
      isScrollingRef.current = true;
      targetContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Reset flag after scroll completes
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    }
  }, [currentIndex, isOpen]);

  // Initial scroll to initial index when gallery opens
  useEffect(() => {
    if (isOpen && containerRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const targetContainer = imageContainerRefs.current[initialIndex];
        if (targetContainer) {
          targetContainer.scrollIntoView({
            behavior: 'instant',
            block: 'center',
          });
        }
      }, 50);
    }
  }, [isOpen, initialIndex]);

  // Handle scroll to update current index based on viewport
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    let scrollTimeout: NodeJS.Timeout;
    let rafId: number;

    const updateCurrentIndex = () => {
      if (isScrollingRef.current) {
        rafId = requestAnimationFrame(updateCurrentIndex);
        return;
      }

      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      imageContainerRefs.current.forEach((container, index) => {
        if (container) {
          const rect = container.getBoundingClientRect();
          const containerCenter = rect.top + rect.height / 2;
          const distance = Math.abs(viewportCenter - containerCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        }
      });

      if (closestIndex !== currentIndex) {
        setCurrentIndex(closestIndex);
      }
    };

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        updateCurrentIndex();
      }, 50);

      // Also update during scroll for responsive feel
      rafId = requestAnimationFrame(updateCurrentIndex);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateCurrentIndex);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateCurrentIndex);
      clearTimeout(scrollTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isOpen, currentIndex]);

  // Prevent body scroll when gallery is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Hide scrollbar for the gallery container
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    container.style.scrollbarWidth = 'none'; // Firefox
    // container.style.msOverflowStyle = 'none'; // IE/Edge

    // Add webkit scrollbar hide via style tag
    const styleId = 'gallery-scrollbar-hide';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        #gallery-scroll-container::-webkit-scrollbar {
          display: none;
        }
      `;
      document.head.appendChild(style);
    }

    container.id = 'gallery-scroll-container';

    return () => {
      container.id = '';
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-100 bg-black/90"
      onClick={onClose}
    >
      {/* Scrollable content - centered with max-width for clickable backdrop on sides */}
      <div
        ref={containerRef}
        className="h-full max-w-2xl mx-auto overflow-y-auto snap-y snap-mandatory scroll-smooth"
        onClick={(e) => {
          // Stop propagation only when clicking on the image itself
          if ((e.target as HTMLElement).tagName === 'IMG') {
            e.stopPropagation();
          }
        }}
      >
        <div className="flex flex-col">
          {images.map((image, index) => (
            <div
              key={index}
              ref={(el) => {
                imageContainerRefs.current[index] = el;
              }}
              className="flex items-center justify-center w-full snap-center snap-always py-8 px-4"
              style={{ minHeight: '100vh' }}
            >
              {/* Container with 3:4 aspect ratio to match product detail page */}
              <div className="w-full max-w-[70vh] aspect-3/4 rounded-md overflow-hidden">
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                  loading={index <= currentIndex + 1 ? 'eager' : 'lazy'}
                  width={1000}
                  height={1000}
                  unoptimized
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-md text-sm pointer-events-none backdrop-blur-sm z-10">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
