/**
 * Legacy analytics compatibility layer.
 *
 * Raw buffered analytics storage has been removed in favor of direct counter
 * increments on `car_listing` only. These exports remain so older imports do
 * not break while routing all writes through the cheaper counter-only path.
 *
 * @module queries/listings/car-listings/view-buffer
 */

import { incrementImpressions, recordListingView, type RecordViewInput } from './analytics';

export async function recordListingViewBuffered(input: RecordViewInput): Promise<string | null> {
  return recordListingView(input);
}

export async function recordImpressionsBuffered(listingIds: string[]): Promise<number> {
  return incrementImpressions(listingIds);
}

export async function flushViewBuffer() {
  return { views: 0, viewListings: 0, impressionListings: 0 };
}

export const flushAnalyticsBuffer = flushViewBuffer;

export function getViewBufferStats() {
  return {
    pendingViews: 0,
    pendingViewListings: 0,
    pendingImpressionListings: 0,
    totalPendingImpressions: 0,
    flushIntervalMs: 0,
  };
}

export const getAnalyticsBufferStats = getViewBufferStats;
