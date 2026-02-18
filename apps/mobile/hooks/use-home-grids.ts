/**
 * useHomeGrids Hook - Smart Grid Loading
 * 
 * Manages home feed grid loading with:
 * - Lazy loading (4 grids at a time)
 * - Caching loaded data
 * - Error recovery
 * - Loading states per grid
 * 
 * @module apps/mobile/hooks/use-home-grids
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  type AnyGridConfig,
  type GridData,
  fetchGridsBatch,
  generateHomeGridSequence,
  fetchPartners,
  createPartnerGridConfig,
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
const INITIAL_LOAD = 4; // Load first 4 grids on mount

// ============================================================================
// HOOK
// ============================================================================

export function useHomeGrids(): UseHomeGridsReturn {
  // Grid sequence and states
  const [gridSequence, setGridSequence] = useState<AnyGridConfig[]>([]);
  const [gridStates, setGridStates] = useState<Map<string, GridState>>(new Map());
  const [loadedCount, setLoadedCount] = useState(0);
  
  // Partners cache
  const [partners, setPartners] = useState<PartnerListItem[]>([]);
  const [partnersLoaded, setPartnersLoaded] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Prevent concurrent loads
  const loadingRef = useRef(false);

  // Load partners first, then initialize grid sequence
  useEffect(() => {
    const loadPartners = async () => {
      try {
        const partnerList = await fetchPartners();
        setPartners(partnerList);
        setPartnersLoaded(true);
      } catch (err) {
        console.error('[useHomeGrids] Failed to load partners:', err);
        setPartnersLoaded(true); // Continue without partners
      }
    };
    loadPartners();
  }, []);

  // Initialize grid sequence after partners load
  useEffect(() => {
    if (!isInitialized && partnersLoaded) {
      console.log('[useHomeGrids] Initializing with', partners.length, 'partners');
      
      // Get base sequence
      const baseSequence = generateHomeGridSequence();
      
      // Create partner showcase grids (one per partner with listings)
      const partnerGrids = partners
        .slice(0, 8) // Limit to 8 partner showcases
        .map(p => createPartnerGridConfig(p));
      
      console.log('[useHomeGrids] Created', partnerGrids.length, 'partner grids');
      
      // Interleave partner grids into the sequence
      // Insert first partner grid at position 3 (after BLK and Founding)
      // Then every 3 grids after that
      const sequence: AnyGridConfig[] = [];
      let partnerIndex = 0;
      
      baseSequence.forEach((config, i) => {
        sequence.push(config);
        
        // Insert partner grids starting after position 2 (after BLK and Founding)
        // Then every 3 grids
        if (i >= 2 && (i - 2) % 3 === 0 && partnerIndex < partnerGrids.length) {
          sequence.push(partnerGrids[partnerIndex]);
          console.log('[useHomeGrids] Inserted partner grid at position', sequence.length - 1);
          partnerIndex++;
        }
      });
      
      // Add remaining partner grids at the end
      while (partnerIndex < partnerGrids.length) {
        sequence.push(partnerGrids[partnerIndex]);
        partnerIndex++;
      }
      
      console.log('[useHomeGrids] Final sequence length:', sequence.length);
      
      setGridSequence(sequence);
      
      // Initialize all grid states as pending
      const initialStates = new Map<string, GridState>();
      sequence.forEach(config => {
        initialStates.set(config.id, {
          config,
          isLoading: false,
        });
      });
      setGridStates(initialStates);
      setIsInitialized(true);
    }
  }, [isInitialized, partnersLoaded, partners]);

  // Initial load
  useEffect(() => {
    if (isInitialized && loadedCount === 0 && gridSequence.length > 0) {
      loadMore();
    }
  }, [isInitialized, gridSequence.length]);

  // Load more grids
  const loadMore = useCallback(async () => {
    if (loadingRef.current || loadedCount >= gridSequence.length) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const startIndex = loadedCount;
      const endIndex = Math.min(startIndex + BATCH_SIZE, gridSequence.length);
      const batchConfigs = gridSequence.slice(startIndex, endIndex);

      // Mark batch as loading
      setGridStates(prev => {
        const next = new Map(prev);
        batchConfigs.forEach(config => {
          const existing = next.get(config.id);
          if (existing) {
            next.set(config.id, { ...existing, isLoading: true });
          }
        });
        return next;
      });

      // Fetch batch data
      const batchData = await fetchGridsBatch(batchConfigs);

      // Update states with data
      setGridStates(prev => {
        const next = new Map(prev);
        batchData.forEach(data => {
          next.set(data.config.id, {
            config: data.config,
            data,
            isLoading: false,
          });
        });
        return next;
      });

      setLoadedCount(endIndex);
    } catch (err) {
      console.error('[useHomeGrids] Failed to load batch:', err);
      setError(err instanceof Error ? err : new Error('Failed to load grids'));
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [loadedCount, gridSequence]);

  // Refresh all grids
  const refresh = useCallback(async () => {
    // Reset state
    setLoadedCount(0);
    setError(null);
    setIsInitialized(false);
    setPartnersLoaded(false);
    
    // Reload partners - this will trigger sequence regeneration
    try {
      const partnerList = await fetchPartners();
      setPartners(partnerList);
      setPartnersLoaded(true);
    } catch (err) {
      console.error('[useHomeGrids] Failed to refresh partners:', err);
      setPartnersLoaded(true);
    }
  }, []);

  // Compute derived values
  const grids = Array.from(gridStates.values());
  // Include grids that have data OR are currently loading (to show skeletons)
  const loadedGrids = grids.filter(g => g.data !== undefined || g.isLoading);
  const hasMore = loadedCount < gridSequence.length;

  return {
    grids,
    loadedGrids,
    hasMore,
    isLoading,
    loadMore,
    refresh,
    partners,
    error,
  };
}

export default useHomeGrids;
