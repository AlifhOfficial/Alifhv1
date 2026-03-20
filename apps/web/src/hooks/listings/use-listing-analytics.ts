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

import { useCallback, useRef, useEffect } from 'react';

// ============================================================================
// MODULE-LEVEL STATE (persists across component remounts within same session)
// ============================================================================

// Session-level dedup for views (prevents re-tracking on re-renders/remounts)
const sessionTrackedViews = new Set<string>();

// Session-level dedup for impressions
const sessionTrackedImpressions = new Set<string>();

// Global pending impressions queue
let pendingImpressionIds = new Set<string>();
let flushTimeout: NodeJS.Timeout | null = null;

function flushPendingImpressions() {
  const ids = Array.from(pendingImpressionIds);
  pendingImpressionIds = new Set();
  flushTimeout = null;

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
}

/**
 * Hook for tracking listing views
 * Call when a listing detail page loads
 */
export function useTrackView() {
  const trackView = useCallback(async (listingId: string) => {
    // Skip if already tracked this session (prevents double-counting on re-renders/remounts)
    if (sessionTrackedViews.has(listingId)) {
      return;
    }

    // Mark as tracked immediately (module-level, persists across remounts)
    sessionTrackedViews.add(listingId);

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
 * 
 * Optimizations:
 * - Deduplicates across the session (won't re-track same listing even after remount)
 * - Debounces API calls (waits 1s of inactivity)
 * - Sends one batched request for impressions after scrolling settles
 */
export function useTrackImpressions() {
  // Store ref to know if this instance has registered cleanup
  const cleanupRegisteredRef = useRef(false);

  const flushImpressions = useCallback(() => {
    flushPendingImpressions();
  }, []);

  const trackImpressions = useCallback((listingIds: string[]) => {
    if (!listingIds.length) return;

    // Filter out already-tracked impressions (session-level dedup - persists across remounts)
    const newIds = listingIds.filter(id => !sessionTrackedImpressions.has(id));
    
    if (newIds.length === 0) return;

    // Mark as tracked (module-level)
    newIds.forEach(id => {
      sessionTrackedImpressions.add(id);
      pendingImpressionIds.add(id);
    });

    // Debounce: flush after 1s of no new calls
    if (flushTimeout) {
      clearTimeout(flushTimeout);
    }
    flushTimeout = setTimeout(flushPendingImpressions, 1000);
  }, []);

  // Flush on unmount (only if we haven't already registered)
  useEffect(() => {
    cleanupRegisteredRef.current = true;
    return () => {
      // Flush any pending impressions when component unmounts
      if (pendingImpressionIds.size > 0) {
        flushPendingImpressions();
      }
    };
  }, []);

  return { trackImpressions, flushImpressions };
}
