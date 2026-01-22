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
    <div className="flex flex-col items-center gap-3 py-6 sm:py-8 md:py-10">
      {/* Page info */}
      <p className="text-xs sm:text-sm text-muted-foreground">
        Page {currentPage} of {totalPages} • {totalResults} results
      </p>
      
      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1 || isFetching}
          className="p-2 rounded-lg hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
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
                <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground">
                  …
                </span>
              );
            }
            
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                disabled={isFetching}
                className={`w-8 h-8 rounded-lg text-sm transition-colors disabled:cursor-not-allowed ${
                  currentPage === page
                    ? 'bg-foreground text-background font-medium'
                    : 'text-muted-foreground hover:bg-secondary/50'
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
          className="p-2 rounded-lg hover:bg-secondary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
