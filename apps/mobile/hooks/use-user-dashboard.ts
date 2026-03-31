/**
 * useUserDashboardStats - Mobile
 *
 * Fetches user dashboard stats for home UI.
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { fetchUserDashboardStats, type UserDashboardStats } from '@/lib/dashboard-api';

export function useUserDashboardStats(userId?: string) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<UserDashboardStats>({
    queryKey: queryKeys.userDashboard(userId),
    queryFn: fetchUserDashboardStats,
    enabled: !!userId,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const refresh = useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({ queryKey: queryKeys.userDashboard(userId) });
    await refetch();
  }, [queryClient, refetch, userId]);

  return {
    stats: data ?? null,
    isLoading,
    refresh,
    error: error instanceof Error ? error : null,
  };
}
