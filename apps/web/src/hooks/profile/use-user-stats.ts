/**
 * User Stats Hook - Dynamic Calculated Metrics
 * 
 * Separate from profile data - these are calculated on-demand
 * Cached for 5 minutes to reduce database load
 * 
 * Metrics:
 * - listingsCount: Total listings count
 * - soldCount: Completed sales count
 * - responseRate: % of inquiries responded to
 */

'use client';

import { useQuery } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export interface UserStats {
  listingsCount: number;
  soldCount: number;
  responseRate: number | null; // Percentage (0-100)
}

// ============================================================================
// API Function
// ============================================================================

async function fetchUserStats(): Promise<UserStats> {
  const res = await fetch('/api/user/stats', {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user stats');
  }

  return res.json();
}

// ============================================================================
// Main Hook
// ============================================================================

export function useUserStats() {
  const query = useQuery({
    queryKey: ['user-stats'],
    queryFn: fetchUserStats,
    staleTime: 5 * 60 * 1000, // 5min - these are expensive queries
    gcTime: 10 * 60 * 1000, // 10min
    refetchOnWindowFocus: false, // Don't refetch on focus - expensive
  });

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  };
}
