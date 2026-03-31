/**
 * useUserDashboardStats - Mobile
 *
 * Fetches user dashboard stats for home UI.
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { fetchUserDashboardStats, type UserDashboardStats } from '@/lib/dashboard-api';

export function useUserDashboardStats() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<UserDashboardStats>({
    queryKey: queryKeys.userDashboard(),
    queryFn: fetchUserDashboardStats,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.userDashboard() });
    await refetch();
  }, [queryClient, refetch]);

  return {
    stats: data ?? null,
    isLoading,
    refresh,
    error: error instanceof Error ? error : null,
  };
}
