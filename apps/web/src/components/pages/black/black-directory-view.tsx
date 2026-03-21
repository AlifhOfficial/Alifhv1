/**
 * Black Directory View
 * 
 * Premium showroom directory for Black tier members.
 * Following Revvup design system patterns.
 */

'use client';

import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Package } from 'lucide-react';
import { queryKeys } from '@/lib/query-keys';
import { BlackShowroomCard, BlackShowroomCardSkeleton } from './black-showroom-card';
import type { ShowroomCardData } from './black-showroom-card';
import { cn } from '@/utils';

// ============================================================================
// API Response Type
// ============================================================================

interface ShowroomDirectoryResponse {
  showrooms: ShowroomCardData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================================================
// Fetch Function
// ============================================================================

async function fetchShowrooms(page: number = 1, limit: number = 10): Promise<ShowroomDirectoryResponse> {
  const res = await fetch(`/api/showroom?page=${page}&limit=${limit}`, {
    next: { revalidate: 300 }, // 5 min cache
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch showrooms');
  }
  
  return res.json();
}

// ============================================================================
// Component
// ============================================================================

interface BlackDirectoryViewProps {
  /**
   * Initial showrooms data from server-side fetch.
   * When provided, content renders immediately.
   */
  initialShowrooms?: ShowroomCardData[] | null;
}

export function BlackDirectoryView({ initialShowrooms }: BlackDirectoryViewProps = {}) {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSetSearchQuery = useDebouncedCallback((v: string) => setSearchQuery(v), 300);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSetSearchQuery(value);
  };

  const handleSearchClear = () => {
    debouncedSetSearchQuery.cancel();
    setSearchInput('');
    setSearchQuery('');
  };
  
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.showroom.list(1, 50),
    queryFn: () => fetchShowrooms(1, 50),
    // Use server-side data if available
    initialData: initialShowrooms ? {
      showrooms: initialShowrooms,
      pagination: { page: 1, limit: 50, total: initialShowrooms.length, totalPages: 1, hasMore: false }
    } : undefined,
    staleTime: initialShowrooms ? Infinity : 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Filter showrooms by search query (dealer name)
  const filteredShowrooms = (() => {
    if (!data?.showrooms) return [];
    if (!searchQuery.trim()) return data.showrooms;
    
    const query = searchQuery.toLowerCase().trim();
    return data.showrooms.filter(showroom => 
      showroom.partner.brandName.toLowerCase().includes(query)
    );
  })();

  const showNoResults = !isLoading && !error && searchQuery && filteredShowrooms.length === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Black Members
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              Every detail matters.
              <br />
              <span className="text-muted-foreground">Every single one.</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Showrooms that care about the small things.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={cn(
                'w-full h-12 pl-11 pr-11',
                'bg-sidebar border border-border/40 rounded-xl',
                'text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                'transition-all'
              )}
            />
            {searchInput && (
              <button
                onClick={handleSearchClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </section>
      
      {/* Directory Grid */}
      <main className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Loading State */}
          {isLoading && (
            <>
              <BlackShowroomCardSkeleton />
              <BlackShowroomCardSkeleton />
            </>
          )}
          
          {/* Error State */}
          {error && (
            <div className="w-full">
              <div className="rounded-xl border border-border/40 bg-sidebar p-12 sm:p-16 min-h-[50vh] flex items-center justify-center">
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                  <div className="rounded-full bg-muted/50 p-4 mb-6">
                    <X className="w-8 h-8 text-muted-foreground" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground mb-3">
                    Something went wrong
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                    Unable to load showrooms. Please try again later.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* No Results */}
          {showNoResults && (
            <div className="w-full">
              <div className="rounded-xl border border-border/40 bg-sidebar p-12 sm:p-16 min-h-[50vh] flex items-center justify-center">
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                  <div className="rounded-full bg-muted/50 p-4 mb-6">
                    <Search className="w-8 h-8 text-muted-foreground" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground mb-3">
                    No matches found
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                    No results for &quot;{searchQuery}&quot;. Try a different search term.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {!isLoading && !error && !searchQuery && data?.showrooms.length === 0 && (
            <div className="w-full">
              <div className="rounded-xl border border-border/40 bg-sidebar p-12 sm:p-16 min-h-[50vh] flex items-center justify-center">
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                  <div className="rounded-full bg-muted/50 p-4 mb-6">
                    <Package className="w-8 h-8 text-muted-foreground" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground mb-3">
                    No showrooms yet
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                    Check back soon. Black members will appear here once they join.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Showroom Cards */}
          {!isLoading && !error && filteredShowrooms.map((showroom, index) => (
            <BlackShowroomCard
              key={showroom.id}
              showroom={showroom}
              index={index}
              priority={index < 3}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
