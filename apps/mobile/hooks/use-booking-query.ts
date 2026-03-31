/**
 * useBookingQuery - React Query hooks for bookings
 * 
 * Provides:
 * - useBookings: Infinite query for paginated user bookings
 * - useCancelBooking: Mutation for cancelling a booking
 * - usePrefetchBookings: Prefetch bookings by status filter
 * 
 * @module hooks/use-booking-query
 */

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, queryClient } from '@/lib/query-client';
import {
  getUserBookings,
  cancelBooking as cancelBookingAPI,
  type UserBooking,
  type BookingStatus,
  type BookingFilter,
  type CancellationReason,
} from '@/lib/booking-api';

// ============================================================================
// QUERY KEYS
// ============================================================================

// Extend queryKeys for bookings (will add to query-client.ts separately)
const bookingKeys = {
  all: ['bookings'] as const,
  list: (filter: BookingFilter) => ['bookings', 'list', filter] as const,
};

// ============================================================================
// CONSTANTS
// ============================================================================

const PAGE_SIZE = 20;

// ============================================================================
// TYPES
// ============================================================================

interface UseBookingsOptions {
  filter?: BookingFilter;
  enabled?: boolean;
}

interface UseBookingsReturn {
  bookings: UserBooking[];
  total: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  error: Error | null;
  fetchNextPage: () => void;
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Infinite query hook for user bookings with filter support.
 * 
 * Features:
 * - Paginated with infinite scroll
 * - Filter by booking status
 * - stale-while-revalidate: shows cached data instantly
 * - Pull-to-refresh support
 */
export function useBookings({
  filter = 'all',
  enabled = true,
}: UseBookingsOptions = {}): UseBookingsReturn {
  const {
    data,
    isLoading: isQueryLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage = false,
    error,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: bookingKeys.list(filter),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await getUserBookings({
        status: filter === 'all' ? undefined : filter as BookingStatus,
        limit: PAGE_SIZE,
        offset: pageParam,
        sort: 'newest',
      });
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.bookings.length, 0);
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
    enabled,
    // Bookings change frequently, shorter stale time
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Flatten pages into single array
  const bookings = data?.pages.flatMap((page) => page.bookings) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  // Only show loading skeleton when there's no cached data
  const isLoading = isQueryLoading && !data;

  return {
    bookings,
    total,
    isLoading,
    isRefreshing: isRefetching && !isFetchingNextPage,
    isFetchingNextPage,
    hasNextPage,
    error: error as Error | null,
    fetchNextPage: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    refresh: async () => {
      await refetch();
    },
  };
}

// ============================================================================
// MUTATIONS
// ============================================================================

interface CancelBookingParams {
  bookingId: string;
  reason?: CancellationReason;
  notes?: string;
}

/**
 * Mutation hook for cancelling a booking.
 * 
 * Features:
 * - Optimistic update: immediately updates UI
 * - Invalidates booking list cache on success
 * - Rollback on error
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, reason, notes }: CancelBookingParams) => {
      return cancelBookingAPI(bookingId, { reason, notes });
    },
    onMutate: async ({ bookingId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: bookingKeys.all });

      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueriesData({ queryKey: bookingKeys.all });

      // Optimistically update all booking lists
      queryClient.setQueriesData(
        { queryKey: bookingKeys.all },
        (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              bookings: page.bookings.map((b: UserBooking) =>
                b.id === bookingId
                  ? { ...b, status: 'cancelled' as BookingStatus, cancelledAt: new Date().toISOString() }
                  : b
              ),
            })),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

// ============================================================================
// PREFETCHING
// ============================================================================

/**
 * Prefetch bookings for a specific filter.
 * Useful for prefetching adjacent tabs.
 */
export async function prefetchBookings(filter: BookingFilter) {
  await queryClient.prefetchInfiniteQuery({
    queryKey: bookingKeys.list(filter),
    queryFn: async () => {
      const response = await getUserBookings({
        status: filter === 'all' ? undefined : filter as BookingStatus,
        limit: PAGE_SIZE,
        offset: 0,
        sort: 'newest',
      });
      return response;
    },
    initialPageParam: 0,
  });
}
