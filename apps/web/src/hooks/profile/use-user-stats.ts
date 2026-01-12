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
import { useAuth } from '@/providers/auth-provider';
import { queryKeys } from '@/lib/query-keys';

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
  const { isAuthenticated } = useAuth();
  
  const query = useQuery({
    queryKey: queryKeys.user.stats(),
    queryFn: fetchUserStats,
    enabled: isAuthenticated,
  });

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  };
}
