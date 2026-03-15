/**
 * ListingsPagination - Standalone pagination component
 * Rendered outside the content panel for better layout control
 */

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ListingsPaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Whether a previous page exists */
  canGoBack: boolean;
  /** Whether a next page exists */
  hasNextPage: boolean;
  /** Whether data is being fetched */
  isFetching: boolean;
  /** Go to previous page callback */
  goToPreviousPage: () => void;
  /** Go to next page callback */
  goToNextPage: () => void;
}

export function ListingsPagination({
  currentPage,
  canGoBack,
  hasNextPage,
  isFetching,
  goToPreviousPage,
  goToNextPage,
}: ListingsPaginationProps) {
  if (!canGoBack && !hasNextPage) return null;

  return (
    <div className="px-4 py-6 sm:py-8 md:py-10">
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 rounded-full border border-sidebar-border bg-sidebar/80 p-2 shadow-sm backdrop-blur">
        <button
          onClick={goToPreviousPage}
          disabled={!canGoBack || isFetching}
          className="inline-flex h-11 min-w-[120px] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-muted/60 active:bg-muted/80 disabled:pointer-events-none disabled:opacity-35 touch-manipulation"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <div className="flex min-w-[84px] flex-col items-center justify-center px-2 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Page
          </span>
          <span className="text-base font-semibold text-foreground">
            {currentPage}
          </span>
        </div>

        <button
          onClick={goToNextPage}
          disabled={!hasNextPage || isFetching}
          className="inline-flex h-11 min-w-[120px] items-center justify-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-all hover:opacity-95 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-35 touch-manipulation"
          aria-label="Next page"
        >
          <span>{hasNextPage ? 'Next page' : 'No more'}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
