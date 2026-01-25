/**
 * ListingsPagination - Standalone pagination component
 * Rendered outside the content panel for better layout control
 */

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ListingsPaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total results count */
  totalResults: number;
  /** Whether data is being fetched */
  isFetching: boolean;
  /** Go to specific page callback */
  goToPage: (page: number) => void;
}

export function ListingsPagination({
  currentPage,
  totalPages,
  totalResults,
  isFetching,
  goToPage,
}: ListingsPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-4 py-6 sm:py-8 md:py-10 px-4">
      {/* Page info */}
      <p className="text-xs sm:text-sm text-muted-foreground text-center">
        Page {currentPage} of {totalPages} • {totalResults} results
      </p>
      
      {/* Pagination controls */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Previous button */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1 || isFetching}
          className="p-2.5 sm:p-2 rounded-lg hover:bg-secondary/50 active:bg-secondary/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
        </button>
        
        {/* Page numbers */}
        {(() => {
          const pages: (number | 'ellipsis')[] = [];
          const maxVisible = 5;
          
          if (totalPages <= maxVisible + 2) {
            // Show all pages if there aren't many
            for (let i = 1; i <= totalPages; i++) {
              pages.push(i);
            }
          } else {
            // Always show first page
            pages.push(1);
            
            if (currentPage <= 3) {
              // Near start: 1 2 3 4 ... last
              for (let i = 2; i <= 4; i++) {
                pages.push(i);
              }
              pages.push('ellipsis');
              pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
              // Near end: 1 ... n-3 n-2 n-1 n
              pages.push('ellipsis');
              for (let i = totalPages - 3; i <= totalPages; i++) {
                pages.push(i);
              }
            } else {
              // Middle: 1 ... current-1 current current+1 ... last
              pages.push('ellipsis');
              pages.push(currentPage - 1);
              pages.push(currentPage);
              pages.push(currentPage + 1);
              pages.push('ellipsis');
              pages.push(totalPages);
            }
          }
          
          return pages.map((page, idx) => {
            if (page === 'ellipsis') {
              return (
                <span key={`ellipsis-${idx}`} className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-muted-foreground">
                  …
                </span>
              );
            }
            
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                disabled={isFetching}
                className={`min-w-[36px] h-9 sm:min-w-[32px] sm:h-8 px-2 sm:px-1.5 rounded-lg text-sm transition-colors disabled:cursor-not-allowed touch-manipulation ${
                  currentPage === page
                    ? 'bg-foreground text-background font-medium'
                    : 'text-muted-foreground hover:bg-secondary/50 active:bg-secondary/70'
                }`}
              >
                {page}
              </button>
            );
          });
        })()}
        
        {/* Next button */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages || isFetching}
          className="p-2.5 sm:p-2 rounded-lg hover:bg-secondary/50 active:bg-secondary/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
