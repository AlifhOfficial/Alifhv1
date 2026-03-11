/**
 * Seller Stats Hook
 * 
 * Fetches seller statistics separately from listing data for better performance.
 * Stats are loaded lazily after the main listing data loads.
 * 
 * Usage:
 *   const { stats, isLoading } = useSellerStats('partner', partnerId);
 *   const { stats, isLoading } = useSellerStats('user', userId);
 */

'use client';

import { useQuery } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export interface PartnerStats {
  inventoryCount: number;
  totalSales: number;
  responseTime: number | null;
  responseRate: number | null;
  hasShowroom?: boolean;
}

export interface UserStats {
  listingsCount: number;
  soldCount: number;
  responseTime: number | null;
  responseRate: number | null;
}

export type SellerStats = PartnerStats | UserStats;

// ============================================================================
// API Function
// ============================================================================

async function fetchSellerStats(type: 'partner' | 'user', id: string): Promise<SellerStats> {
  const res = await fetch(`/api/sellers/stats?type=${type}&id=${id}`);
  
  if (!res.ok) {
    throw new Error('Failed to fetch seller stats');
  }
  
  return res.json();
}

// ============================================================================
// Hook
// ============================================================================

export function useSellerStats(
  type: 'partner' | 'user' | null,
  id: string | null | undefined,
  initialData?: SellerStats | null
) {
  const query = useQuery({
    queryKey: ['seller-stats', type, id],
    queryFn: () => fetchSellerStats(type!, id!),
    enabled: !!type && !!id,
    initialData: initialData ?? undefined,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
    staleTime: initialData ? Infinity : 0,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  };
}
