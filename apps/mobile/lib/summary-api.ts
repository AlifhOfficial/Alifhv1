/**
 * DarkWeave API Client — Mobile
 * 
 * Fetches AI-powered listing insights for the DarkWeave sheet.
 * Includes client-side caching to avoid redundant API calls.
 */

import { API_BASE } from './config';

// ============================================================================
// TYPES
// ============================================================================

export interface DarkWeaveFlag {
  type: 'red' | 'green';
  text: string;
}

/** Factual listing data that DarkWeave based its read on */
export interface ListingContext {
  year: number;
  mileage: number;
  specs?: string | null;
  condition?: string | null;
  trim?: string | null;
  emirate?: string | null;
  featureCount?: number;
  bodyType?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  sellerType?: 'partner' | 'user';
  sellerRating?: number | null;
  sellerReviewCount?: number | null;
  sellerVerified?: boolean;
}

export interface ListingSummary {
  darkTake: string;
  dealRating: 'steal' | 'solid' | 'fair' | 'steep' | 'unclear';
  machineNotes: string[];
  flags: DarkWeaveFlag[];
  sellerVibe: string;
  sellerTrust: 'solid' | 'decent' | 'limited' | 'unknown';
  negotiationTip: string;
  processingTimeMs: number;
  context?: ListingContext;
}

// ============================================================================
// CLIENT-SIDE CACHE (survives component re-renders, cleared on app restart)
// ============================================================================

const summaryCache = new Map<string, { data: ListingSummary; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours client-side (matches server)

// ============================================================================
// API
// ============================================================================

/**
 * Fetch AI summary for a listing.
 * Returns cached result if available and fresh.
 */
export async function getListingSummary(listingId: string): Promise<ListingSummary> {
  // Check client cache
  const cached = summaryCache.get(listingId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const url = `${API_BASE}/api/ai/summary`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listingId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch summary: ${response.status}`);
  }

  const result = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error('Invalid summary response');
  }

  const raw = result.data;

  // Normalize response — handle both old (carHighlights) and new (machineNotes) shapes
  const summary: ListingSummary = {
    darkTake: raw.darkTake || raw.quickTake || '',
    dealRating: raw.dealRating || 'fair',
    machineNotes: raw.machineNotes || raw.carHighlights || [],
    flags: Array.isArray(raw.flags) ? raw.flags : [],
    sellerVibe: raw.sellerVibe || raw.sellerVerdict || '',
    sellerTrust: raw.sellerTrust || 'unknown',
    negotiationTip: raw.negotiationTip || '',
    processingTimeMs: raw.processingTimeMs || 0,
    context: raw.context || undefined,
  };

  // Cache it
  summaryCache.set(listingId, { data: summary, timestamp: Date.now() });

  return summary;
}

/**
 * Clear cached summary for a listing (e.g., after listing update)
 */
export function clearSummaryCache(listingId?: string) {
  if (listingId) {
    summaryCache.delete(listingId);
  } else {
    summaryCache.clear();
  }
}
