'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { sizeGuide } from '@/lib/types';
import { cn } from '@/lib/actions/utils';
import { useTranslations } from 'next-intl';

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

// Modal content component (can be used separately if needed)
export function SizeGuideContent({ onClose }: { onClose?: () => void }) {
  const t = useTranslations('products');
  const [unit, setUnit] = useState<'CM' | 'INCHES'>('CM');

  const convertToInches = (cm: number) => Math.round((cm / 2.54) * 10) / 10;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-bold tracking-wider">
          {t('sizeGuide.title')}
        </h2>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Unit Toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-full bg-gray-100 p-1">
          <button
            onClick={() => setUnit('INCHES')}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
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
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
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
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="px-4 py-3 text-left text-sm font-medium">
                {t('sizeGuide.size')}
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium">
                {t('sizeGuide.chest')}
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium">
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
    </div>
  );
}
