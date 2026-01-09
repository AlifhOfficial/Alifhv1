/**
 * Listing Analytics Hooks - Views & Impressions
 * 
 * Fire-and-forget tracking for listing engagement metrics.
 * 
 * Usage:
 * ```tsx
 * // Track view when detail page loads
 * const { trackView } = useTrackView();
 * useEffect(() => { trackView(listingId); }, [listingId]);
 * 
 * // Track impressions when search results render
 * const { trackImpressions } = useTrackImpressions();
 * useEffect(() => { trackImpressions(visibleListingIds); }, [listings]);
 * ```
 * 
 * @module hooks/listings/use-listing-analytics
 */

'use client';

import { useCallback, useRef } from 'react';

/**
 * Hook for tracking listing views
 * Call when a listing detail page loads
 */
export function useTrackView() {
  // Track which listings we've already recorded views for this session
  const trackedViewsRef = useRef<Set<string>>(new Set());

  const trackView = useCallback(async (listingId: string) => {
    // Skip if already tracked this session (prevents double-counting on re-renders)
    if (trackedViewsRef.current.has(listingId)) {
      return;
    }

    // Mark as tracked immediately
    trackedViewsRef.current.add(listingId);

    // Fire-and-forget - don't await, don't handle errors
    fetch(`/api/listings/${listingId}/view`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {
      // Silent fail - view tracking is non-critical
    });
  }, []);

  return { trackView };
}

/**
 * Hook for tracking listing impressions
 * Call when listings appear in search results
 */
export function useTrackImpressions() {
  // Debounce impressions to avoid excessive API calls
  const pendingIdsRef = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const flushImpressions = useCallback(() => {
    const ids = Array.from(pendingIdsRef.current);
    pendingIdsRef.current.clear();

    if (ids.length === 0) return;

    // Fire-and-forget
    fetch('/api/listings/impressions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingIds: ids }),
      credentials: 'include',
    }).catch(() => {
      // Silent fail
    });
  }, []);

  const trackImpressions = useCallback((listingIds: string[]) => {
    if (!listingIds.length) return;

    // Add to pending set (auto-deduplicates)
    listingIds.forEach(id => pendingIdsRef.current.add(id));

    // Debounce: flush after 500ms of no new calls
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(flushImpressions, 500);
  }, [flushImpressions]);

  return { trackImpressions, flushImpressions };
}
