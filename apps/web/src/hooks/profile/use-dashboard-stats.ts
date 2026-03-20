/**
 * User Dashboard Stats Hook
 * 
 * Single hook for all dashboard metrics.
 * Cached for 5 minutes to reduce database load.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth-provider';

// ============================================================================
// Types
// ============================================================================

export interface DashboardStats {
  // Listings
  activeListings: number;
  totalListings: number;
  expiringSoon: number;
  
  // Engagement
  totalViews: number;
  totalSaves: number;
  avgViewsPerListing: number;
  saveRate: number;
  
  // Sales
  soldCount: number;
  
  // User Activity
  mySaves: number;
  superlikesUsed: number;
  superlikesRemaining: number;
  
  // Member info
  memberSince: string | null;
  
  // Compatibility placeholder; time-series view history is currently disabled
  viewsTrend: { date: string; views: number }[];
}

// ============================================================================
// API Function
// ============================================================================

async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/user/dashboard', {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }

  return res.json();
}

// ============================================================================
// Main Hook
// ============================================================================

export function useDashboardStats(initialData?: DashboardStats | null) {
  const { isAuthenticated } = useAuth();
  
  const query = useQuery({
    queryKey: ['user-dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: isAuthenticated,
    staleTime: initialData ? Infinity : 0,
    initialData: initialData ?? undefined,
  });

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
