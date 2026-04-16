/**
 * Partner Stats Hook - Dynamic Calculated Metrics
 * 
 * Separate from profile data - these are calculated on-demand
 * Cached for 5 minutes to reduce database load
 * 
 * Metrics:
 * - inventoryCount: Active listings count
 * - totalSales: Completed sales count
 * - responseTime: Average time to first response (minutes)
 * - responseRate: % of inquiries responded to
 */

'use client';

import { useAsyncQuery } from '@/hooks/use-async-query';

// ============================================================================
// Types
// ============================================================================

export interface PartnerStats {
  inventoryCount: number;
  totalSales: number;
  responseTime: number | null; // Average minutes to respond
  responseRate: number | null; // Percentage (0-100)
}

// ============================================================================
// API Function
// ============================================================================

async function fetchPartnerStats(partnerId: string): Promise<PartnerStats> {
  const res = await fetch(`/api/partners/${partnerId}/stats`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch partner stats');
  }

  return res.json();
}

// ============================================================================
// Main Hook
// ============================================================================

export function usePartnerStats(
  partnerId: string | null | undefined,
  initialData?: PartnerStats | null
) {
  const shouldFetch = !!partnerId && initialData === undefined;

  const query = useAsyncQuery({
    queryFn: () => fetchPartnerStats(partnerId!),
    enabled: shouldFetch,
    initialData: initialData ?? undefined,
  });

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  };
}
