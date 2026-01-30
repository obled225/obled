'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/actions/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  className?: string;
  'data-testid'?: string;
}

export function Pagination({
  page,
  totalPages,
  className,
  'data-testid': dataTestId,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper function to generate an array of numbers within a range
  const arrayRange = (start: number, stop: number) =>
    Array.from({ length: stop - start + 1 }, (_, index) => start + index);

  // Function to handle page changes
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Function to render a page button
  const renderPageButton = (pageNum: number, isCurrent: boolean) => (
    <button
      key={pageNum}
      className={cn(
        'px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors min-w-[36px] sm:min-w-[40px] touch-target',
        {
          'bg-blue-600 text-white': isCurrent,
          'text-gray-700 hover:bg-gray-100': !isCurrent,
        }
      )}
      disabled={isCurrent}
      onClick={() => handlePageChange(pageNum)}
    >
      {pageNum}
    </button>
  );

  // Function to render ellipsis
  const renderEllipsis = (key: string) => (
    <span key={key} className="px-3 py-2 text-gray-400 cursor-default">
      ...
    </span>
  );

  // Function to render page buttons based on the current page and total pages
  const renderPageButtons = () => {
    const buttons = [];

    if (totalPages <= 7) {
      // Show all pages
      buttons.push(
        ...arrayRange(1, totalPages).map((p) => renderPageButton(p, p === page))
      );
    } else {
      // Handle different cases for displaying pages and ellipses
      if (page <= 4) {
        // Show 1, 2, 3, 4, 5, ..., lastpage
        buttons.push(
          ...arrayRange(1, 5).map((p) => renderPageButton(p, p === page))
        );
        buttons.push(renderEllipsis('ellipsis1'));
        buttons.push(renderPageButton(totalPages, totalPages === page));
      } else if (page >= totalPages - 3) {
        // Show 1, ..., lastpage - 4, lastpage - 3, lastpage - 2, lastpage - 1, lastpage
        buttons.push(renderPageButton(1, 1 === page));
        buttons.push(renderEllipsis('ellipsis2'));
        buttons.push(
          ...arrayRange(totalPages - 4, totalPages).map((p) =>
            renderPageButton(p, p === page)
          )
        );
      } else {
        // Show 1, ..., page - 1, page, page + 1, ..., lastpage
        buttons.push(renderPageButton(1, 1 === page));
        buttons.push(renderEllipsis('ellipsis3'));
        buttons.push(
          ...arrayRange(page - 1, page + 1).map((p) =>
            renderPageButton(p, p === page)
          )
        );
        buttons.push(renderEllipsis('ellipsis4'));
        buttons.push(renderPageButton(totalPages, totalPages === page));
      }
    }

    return buttons;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={cn('flex justify-center items-center space-x-1', className)}
    >
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed touch-target"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Buttons */}
      <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto" data-testid={dataTestId}>
        {renderPageButtons()}
      </div>

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed touch-target"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
