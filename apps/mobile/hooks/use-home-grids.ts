/**
 * useHomeGrids Hook - Smart Grid Loading with React Query
 * 
 * Manages home feed grid loading with:
 * - Lazy loading (4 grids at a time via infinite query)
 * - Automatic caching
 * - Error recovery
 * - Loading states per grid
 * 
 * @module apps/mobile/hooks/use-home-grids
 */

import { useMemo, useCallback } from 'react';
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import {
  type AnyGridConfig,
  type GridData,
  fetchGridsBatch,
  generateHomeGridSequence,
  fetchPartners,
  createPartnerGridConfig,
  clearGridCache,
} from '@/lib/grid-api';
import { type PartnerListItem } from '@/lib/partner-api';

// ============================================================================
// TYPES
// ============================================================================

export interface GridState {
  config: AnyGridConfig;
  data?: GridData;
  isLoading: boolean;
  error?: Error;
}

export interface UseHomeGridsReturn {
  /** All grid states (loaded + pending) */
  grids: GridState[];
  /** Currently loaded grid data */
  loadedGrids: GridState[];
  /** Whether more grids can be loaded */
  hasMore: boolean;
  /** Whether currently loading a batch */
  isLoading: boolean;
  /** Load more grids (call on scroll) */
  loadMore: () => Promise<void>;
  /** Refresh all grids */
  refresh: () => Promise<void>;
  /** Partners list (for founding/partner grids) */
  partners: PartnerListItem[];
  /** Error state */
  error: Error | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BATCH_SIZE = 4;

// ============================================================================
// HELPER: Build grid sequence from partners
// ============================================================================

function buildGridSequence(partners: PartnerListItem[]): AnyGridConfig[] {
  // Get base sequence
  const baseSequence = generateHomeGridSequence();
  
  // Create partner showcase grids (one per partner with listings)
  const partnerGrids = partners
    .slice(0, 8) // Limit to 8 partner showcases
    .map(p => createPartnerGridConfig(p));
  
  // Interleave partner grids into the sequence
  const sequence: AnyGridConfig[] = [];
  let partnerIndex = 0;
  
  baseSequence.forEach((config, i) => {
    sequence.push(config);
    
    // Insert partner grids starting after position 2 (after BLK and Founding)
    // Then every 3 grids
    if (i >= 2 && (i - 2) % 3 === 0 && partnerIndex < partnerGrids.length) {
      sequence.push(partnerGrids[partnerIndex]);
      partnerIndex++;
    }
  });
  
  // Add remaining partner grids at the end
  while (partnerIndex < partnerGrids.length) {
    sequence.push(partnerGrids[partnerIndex]);
    partnerIndex++;
  }
  
  return sequence;
}

// ============================================================================
// HOOK
// ============================================================================

export function useHomeGrids(): UseHomeGridsReturn {
  const queryClient = useQueryClient();

  // ── Query 1: Fetch partners ──────────────────────────────────────────────
  const {
    data: partners = [],
    isLoading: isLoadingPartners,
    error: partnersError,
  } = useQuery({
    queryKey: queryKeys.partners(),
    queryFn: fetchPartners,
    staleTime: 5 * 60 * 1000, // Partners don't change often
  });

  // ── Compute grid sequence (memoized) ─────────────────────────────────────
  const gridSequence = useMemo(() => {
    if (isLoadingPartners) return [];
    return buildGridSequence(partners);
  }, [partners, isLoadingPartners]);

  // Stable key for the sequence to trigger query reset when it changes
  const sequenceKey = useMemo(() => {
    return gridSequence.map(g => g.id).join(',');
  }, [gridSequence]);

  // ── Query 2: Infinite query for grid data ────────────────────────────────
  const {
    data: gridsData,
    isLoading: isLoadingGrids,
    isFetchingNextPage,
    hasNextPage = false,
    error: gridsError,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    // Include sequence key so query resets when grid sequence changes
    queryKey: [...queryKeys.homeGrids(), sequenceKey],
    queryFn: async ({ pageParam = 0 }) => {
      const startIndex = pageParam;
      const endIndex = Math.min(startIndex + BATCH_SIZE, gridSequence.length);
      const batchConfigs = gridSequence.slice(startIndex, endIndex);
      
      if (batchConfigs.length === 0) {
        return { grids: [], nextOffset: undefined };
      }

      const batchData = await fetchGridsBatch(batchConfigs);
      
      return {
        grids: batchData.map(data => ({
          config: data.config,
          data,
          isLoading: false,
        })),
        nextOffset: endIndex < gridSequence.length ? endIndex : undefined,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !isLoadingPartners && gridSequence.length > 0,
    // Show cached data instantly
    placeholderData: (prev) => prev,
    staleTime: 2 * 60 * 1000,
  });

  // ── Flatten pages into grid states (deduplicated) ─────────────────────────
  const loadedGrids = useMemo(() => {
    if (!gridsData?.pages) return [];
    const allGrids = gridsData.pages.flatMap(page => page.grids);
    // Dedupe by config.id to prevent React key warnings
    const seen = new Set<string>();
    return allGrids.filter(g => {
      if (seen.has(g.config.id)) return false;
      seen.add(g.config.id);
      return true;
    });
  }, [gridsData]);

  // ── Build complete grid state list (loaded + pending) ────────────────────
  const grids = useMemo(() => {
    const loadedIds = new Set(loadedGrids.map(g => g.config.id));
    
    // Create pending states for unloaded grids
    const pendingGrids: GridState[] = gridSequence
      .filter(config => !loadedIds.has(config.id))
      .map(config => ({
        config,
        isLoading: false,
      }));
    
    return [...loadedGrids, ...pendingGrids];
  }, [loadedGrids, gridSequence]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const refresh = useCallback(async () => {
    // Clear local cache first
    clearGridCache();
    
    // Invalidate both queries to force refetch
    await queryClient.invalidateQueries({ queryKey: queryKeys.partners() });
    await queryClient.invalidateQueries({ queryKey: queryKeys.homeGrids() });
    
    // Refetch
    await refetch();
  }, [queryClient, refetch]);

  // ── Error handling ───────────────────────────────────────────────────────
  const error = partnersError || gridsError;

  return {
    grids,
    loadedGrids,
    hasMore: hasNextPage,
    isLoading: isLoadingPartners || (isLoadingGrids && loadedGrids.length === 0),
    loadMore,
    refresh,
    partners,
    error: error instanceof Error ? error : error ? new Error('Failed to load grids') : null,
  };
}

export default useHomeGrids;
