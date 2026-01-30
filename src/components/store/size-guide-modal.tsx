'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { sizeGuide } from '@/lib/types/product';
import { cn } from '@/lib/actions/utils';

export function SizeGuideModal() {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
      <button className="bg-gray-900 text-white px-2 py-4 text-xs font-medium tracking-wider writing-vertical-rl rotate-180 hover:bg-gray-800 transition-colors">
        SIZE GUIDE
      </button>
    </div>
  );
}

// Modal content component (can be used separately if needed)
export function SizeGuideContent({ onClose }: { onClose?: () => void }) {
  const [unit, setUnit] = useState<'CM' | 'INCHES'>('CM');

  const convertToInches = (cm: number) => Math.round((cm / 2.54) * 10) / 10;

  return (
    <div className="max-w-lg w-full mx-auto">
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-wider">SIZE GUIDE</h2>
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
              INCHES
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
              CM
            </button>
          </div>
        </div>

        {/* Size Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-4 py-3 text-left text-sm font-medium">
                  SIZE
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium">
                  Chest
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium">
                  Length
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
    </div>
  );
}
