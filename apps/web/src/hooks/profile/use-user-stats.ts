/**
 * User Stats Hook - Dynamic Calculated Metrics
 * 
 * Separate from profile data - these are calculated on-demand
 * Cached for 5 minutes to reduce database load
 * 
 * Metrics:
 * - listingsCount: Total listings count
 * - soldCount: Completed sales count
 * - responseTime: Avg minutes to first response (business hours only, min 5 inquiries)
 * - responseRate: % of inquiries responded to (min 5 inquiries)
 */

'use client';

import { useAsyncQuery } from '@/hooks/use-async-query';
import { useAuth } from '@/providers/auth-provider';
import { queryKeys } from '@/lib/query-keys';

// ============================================================================
// Types
// ============================================================================

export interface UserStats {
  listingsCount: number;
  soldCount: number;
  responseTime: number | null; // Minutes (business hours only)
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

export function useUserStats(initialData?: UserStats | null) {
  const { isAuthenticated } = useAuth();
  const shouldFetch = isAuthenticated && initialData === undefined;
  
  const query = useAsyncQuery({
    queryFn: fetchUserStats,
    enabled: shouldFetch,
    initialData: initialData ?? undefined,
  });

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  };
}
