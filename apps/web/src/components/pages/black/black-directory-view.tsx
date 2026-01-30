/**
 * Black Directory View
 * 
 * Premium showroom directory for Black tier members.
 * Following Alifh design system patterns.
 */

'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
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

export function BlackDirectoryView() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.showroom.list(1, 50),
    queryFn: () => fetchShowrooms(1, 50),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  // Filter showrooms by search query (dealer name)
  const filteredShowrooms = useMemo(() => {
    if (!data?.showrooms) return [];
    if (!searchQuery.trim()) return data.showrooms;
    
    const query = searchQuery.toLowerCase().trim();
    return data.showrooms.filter(showroom => 
      showroom.partner.brandName.toLowerCase().includes(query)
    );
  }, [data?.showrooms, searchQuery]);

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full h-12 pl-11 pr-11',
                'bg-sidebar border border-border/40 rounded-xl',
                'text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
                'transition-all'
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
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
            <p className="py-16 text-center text-sm text-muted-foreground">
              Unable to load showrooms
            </p>
          )}
          
          {/* No Results */}
          {showNoResults && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No results for "{searchQuery}"
            </p>
          )}
          
          {/* Empty State */}
          {!isLoading && !error && !searchQuery && data?.showrooms.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No showrooms yet
            </p>
          )}
          
          {/* Showroom Cards */}
          {!isLoading && !error && filteredShowrooms.map((showroom, index) => (
            <BlackShowroomCard
              key={showroom.id}
              showroom={showroom}
              index={index}
              priority={index < 2}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
