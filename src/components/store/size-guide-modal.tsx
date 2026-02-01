'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { sizeGuide } from '@/lib/types';
import { cn } from '@/lib/actions/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';

export function SizeGuideModal() {
  const t = useTranslations('products');

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
      <button className="bg-gray-900 text-white px-2 py-4 text-xs font-medium tracking-wider writing-vertical-rl rotate-180 hover:bg-gray-800 transition-colors">
        {t('sizeGuide.title')}
      </button>
    </div>
  );
}

interface SizeGuideModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModalWrapper({
  isOpen,
  onClose,
}: SizeGuideModalWrapperProps) {
  // Always call hooks unconditionally at the top - this ensures consistent hook order
  const isMobile = useIsMobile();
  const t = useTranslations('products');

  // Use Sheet for both mobile and desktop, but with different sides and styling
  // This ensures consistent hook order across renders
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        floating={!isMobile}
        hideCloseButton={isMobile}
        className={cn(
          "flex flex-col overflow-hidden p-0",
          isMobile
            ? "w-full max-h-[90vh]"
            : "w-full sm:max-w-xl max-h-[90vh]"
        )}
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-lg sm:text-xl font-bold tracking-wider text-center">
            {t('sizeGuide.title')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <SizeGuideContent onClose={onClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Modal content component (can be used separately if needed)
export function SizeGuideContent({ onClose }: { onClose?: () => void }) {
  const t = useTranslations('products');
  const [unit, setUnit] = useState<'CM' | 'INCHES'>('CM');

  const convertToInches = (cm: number) => Math.round((cm / 2.54) * 10) / 10;

  return (
    <div className="w-full max-w-full space-y-6">
      {/* Title is now handled by SheetHeader on mobile, so hide it here on mobile */}
      <div className="flex items-center justify-center relative  md:flex">
        <h2 className="text-lg sm:text-xl font-bold tracking-wider text-center">
          {t('sizeGuide.title')}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md touch-target absolute right-0"
            aria-label="Close size guide"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Unit Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-md bg-gray-100 p-1">
          <button
            onClick={() => setUnit('INCHES')}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              unit === 'INCHES'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {t('sizeGuide.inches')}
          </button>
          <button
            onClick={() => setUnit('CM')}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              unit === 'CM'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {t('sizeGuide.cm')}
          </button>
        </div>
      </div>

      {/* Size Table */}
      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-950 text-white">
              <th className="px-4 py-3 text-left text-sm font-medium rounded-tl-md">
                {t('sizeGuide.size')}
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium">
                {t('sizeGuide.chest')}
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium rounded-tr-md">
                {t('sizeGuide.length')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sizeGuide.rows.map((row, index) => (
              <tr
                key={row.size}
                className={cn(index % 2 === 1 ? 'bg-gray-50' : 'bg-white')}
              >
                <td className="px-4 py-3 text-sm font-medium">{row.size}</td>
                <td className="px-4 py-3 text-center text-sm">
                  {unit === 'CM' ? row.chest : convertToInches(row.chest)}
                </td>
                <td className="px-4 py-3 text-center text-sm">
                  {unit === 'CM' ? row.length : convertToInches(row.length)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Size Guide Image - directly below table in same scrollable container */}
      <div className="w-full">
        <Image
          src="/sizeguide.webp"
          alt="Size Guide Visual"
          width={1000}
          height={1000}
          className="w-full h-auto rounded-md border border-gray-200"
          unoptimized
        />
      </div>
    </div>
  );
}
