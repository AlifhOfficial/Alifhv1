/**
 * React Query Helpers — Client-Side Query Management
 *
 * Helper functions for React Query (TanStack Query) operations.
 * These are CLIENT-SIDE only — they manage the browser query cache,
 * not server-side caching.
 *
 * THREE PATTERNS:
 * 1. Simple Invalidation - Just refetch (most common)
 * 2. Optimistic Updates - Update cache immediately, rollback on error
 * 3. Manual Updates - Manually update cache without refetch
 *
 * WHEN TO USE WHICH:
 * - Simple: Default for most cases (mutations, data changes)
 * - Optimistic: Fast UI feedback (likes, favorites, toggles)
 * - Manual: Real-time updates (WebSocket messages, notifications)
 *
 * @module lib/query-helpers
 */

import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';

// ============================================================================
// PATTERN 1: SIMPLE INVALIDATION
// ============================================================================

/**
 * Simple invalidation - just mark as stale and refetch
 * 
 * USE WHEN:
 * - After mutations (create, update, delete)
 * - Data changed on server, want fresh data
 * - Don't need instant UI feedback
 * 
 * @example
 * ```typescript
 * const mutation = useMutation({
 *   mutationFn: updateProfile,
 *   onSuccess: () => invalidateQueries(queryClient, queryKeys.user.profile()),
 * });
 * ```
 */
export function invalidateQueries(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  options?: { exact?: boolean }
) {
  return queryClient.invalidateQueries({ 
    queryKey, 
    exact: options?.exact ?? false 
  });
}

/**
 * Invalidate multiple query families at once
 * 
 * @example
 * ```typescript
 * invalidateMultiple(queryClient, [
 *   queryKeys.user.profile(),
 *   queryKeys.user.stats(),
 * ]);
 * ```
 */
export function invalidateMultiple(
  queryClient: QueryClient,
  queryKeys: readonly (readonly unknown[])[]
) {
  return Promise.all(
    queryKeys.map(key => queryClient.invalidateQueries({ queryKey: key }))
  );
}

/**
 * Invalidate entire domain (all queries with same prefix)
 * 
 * @example
 * ```typescript
 * // Invalidate ALL user queries
 * invalidateDomain(queryClient, queryKeys.user.all);
 * ```
 */
export function invalidateDomain(
  queryClient: QueryClient,
  domainKey: readonly unknown[]
) {
  return queryClient.invalidateQueries({ queryKey: domainKey });
}

// ============================================================================
// PATTERN 2: OPTIMISTIC UPDATES
// ============================================================================

/**
 * Optimistic update - update cache immediately, rollback on error
 * 
 * USE WHEN:
 * - Need instant UI feedback (favorites, likes, toggles)
 * - Mutation unlikely to fail
 * - Can easily compute new state from old state
 * 
 * @example
 * ```typescript
 * const mutation = useMutation({
 *   mutationFn: toggleFavorite,
 *   onMutate: async (listingId) => {
 *     return optimisticUpdate(queryClient, queryKeys.engagement.favoritesStatus(), (old) => {
 *       return { ...old, [listingId]: !old?.[listingId] };
 *     });
 *   },
 *   onError: (_err, _vars, context) => {
 *     if (context?.previousData) {
 *       queryClient.setQueryData(queryKeys.engagement.favoritesStatus(), context.previousData);
 *     }
 *   },
 *   onSettled: () => {
 *     queryClient.invalidateQueries({ queryKey: queryKeys.engagement.favoritesStatus() });
 *   },
 * });
 * ```
 */
export async function optimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  updateFn: (oldData: T | undefined) => T
): Promise<{ previousData: T | undefined }> {
  // Cancel outgoing refetches to prevent race conditions
  await queryClient.cancelQueries({ queryKey });

  // Snapshot previous value
  const previousData = queryClient.getQueryData<T>(queryKey);

  // Optimistically update cache
  queryClient.setQueryData<T>(queryKey, updateFn);

  // Return context for rollback
  return { previousData };
}

/**
 * Optimistic toggle - flip boolean value
 * 
 * @example
 * ```typescript
 * onMutate: async (id) => {
 *   return optimisticToggle(queryClient, queryKeys.listing.detail(id), ['isFavorited']);
 * }
 * ```
 */
export async function optimisticToggle<T extends Record<string, any>>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  path: (keyof T)[]
): Promise<{ previousData: T | undefined }> {
  await queryClient.cancelQueries({ queryKey });
  const previousData = queryClient.getQueryData<T>(queryKey);

  queryClient.setQueryData<T>(queryKey, (old) => {
    if (!old) return old;
    
    const updated = { ...old };
    let current: any = updated;
    
    // Navigate to nested property
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    // Toggle the final property
    const lastKey = path[path.length - 1];
    current[lastKey] = !current[lastKey];
    
    return updated;
  });

  return { previousData };
}

/**
 * Optimistic increment/decrement counter
 * 
 * @example
 * ```typescript
 * onMutate: async () => {
 *   return optimisticCounter(queryClient, queryKeys.messaging.unreadCount(), ['unreadCount'], 1);
 * }
 * ```
 */
export async function optimisticCounter<T extends Record<string, any>>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  path: (keyof T)[],
  delta: number
): Promise<{ previousData: T | undefined }> {
  await queryClient.cancelQueries({ queryKey });
  const previousData = queryClient.getQueryData<T>(queryKey);

  queryClient.setQueryData<T>(queryKey, (old) => {
    if (!old) return old;
    
    const updated = { ...old };
    let current: any = updated;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    const lastKey = path[path.length - 1];
    current[lastKey] = (current[lastKey] ?? 0) + delta;
    
    return updated;
  });

  return { previousData };
}

// ============================================================================
// PATTERN 3: MANUAL CACHE UPDATES
// ============================================================================

/**
 * Manual cache update - set cache data directly without refetch
 * 
 * USE WHEN:
 * - WebSocket/real-time updates
 * - Server sent new data (SSE, polling)
 * - Know exact new state from mutation response
 * 
 * @example
 * ```typescript
 * // WebSocket message received
 * updateCache(queryClient, queryKeys.messaging.unreadCount(), (old) => ({
 *   unreadCount: (old?.unreadCount ?? 0) + 1,
 * }));
 * ```
 */
export function updateCache<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  updateFn: (oldData: T | undefined) => T
): void {
  queryClient.setQueryData<T>(queryKey, updateFn);
}

/**
 * Set cache data directly (replace completely)
 * 
 * @example
 * ```typescript
 * // After mutation, server returns fresh data
 * setCache(queryClient, queryKeys.user.profile(), newProfileData);
 * ```
 */
export function setCache<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  data: T
): void {
  queryClient.setQueryData<T>(queryKey, data);
}

/**
 * Update multiple caches at once
 * 
 * @example
 * ```typescript
 * // New message arrived via WebSocket
 * updateMultipleCaches(queryClient, [
 *   [queryKeys.messaging.unreadCount(), (old) => ({ unreadCount: old.unreadCount + 1 })],
 *   [queryKeys.messaging.conversations(), (old) => updateConversationList(old)],
 * ]);
 * ```
 */
export function updateMultipleCaches<T = any>(
  queryClient: QueryClient,
  updates: Array<[queryKey: readonly unknown[], updateFn: (oldData: T | undefined) => T]>
): void {
  updates.forEach(([queryKey, updateFn]) => {
    queryClient.setQueryData<T>(queryKey, updateFn);
  });
}

// ============================================================================
// COMMON PATTERNS FOR SPECIFIC FEATURES
// ============================================================================

/**
 * After profile update - invalidate profile and stats
 */
export function invalidateUserData(queryClient: QueryClient) {
  return invalidateMultiple(queryClient, [
    queryKeys.user.profile(),
    queryKeys.user.stats(),
  ]);
}

/**
 * After listing mutation - invalidate listing detail and user's listings
 */
export function invalidateListingData(
  queryClient: QueryClient,
  listingId: string
) {
  return invalidateMultiple(queryClient, [
    queryKeys.listing.detail(listingId),
    queryKeys.listing.myListings(),
  ]);
}

/**
 * After partner request status change - invalidate request and admin list
 */
export function invalidatePartnerRequestData(
  queryClient: QueryClient,
  requestId?: string
) {
  const keysToInvalidate: readonly (readonly unknown[])[] = [
    queryKeys.partner.request(),
    queryKeys.admin.partnerRequests(),
    queryKeys.admin.partnerRequestCounts(),
  ];
  
  if (requestId) {
    return invalidateMultiple(queryClient, [
      ...keysToInvalidate,
      queryKeys.admin.partnerRequest(requestId),
    ]);
  }
  
  return invalidateMultiple(queryClient, keysToInvalidate);
}

/**
 * After staff team change - invalidate team and overview
 */
export function invalidateStaffData(queryClient: QueryClient) {
  return invalidateMultiple(queryClient, [
    queryKeys.staff.team(),
    queryKeys.staff.overview(),
  ]);
}

/**
 * After new message - update counts and conversation list
 */
export function handleNewMessage(
  queryClient: QueryClient,
  conversationId: string,
  activeConversationId?: string
) {
  // Only increment unread count if not viewing this conversation
  if (conversationId !== activeConversationId) {
    updateCache(
      queryClient,
      queryKeys.messaging.unreadCount(),
      (old: { unreadCount: number } | undefined) => ({
        unreadCount: (old?.unreadCount ?? 0) + 1,
      })
    );
  }
  
  // Always invalidate conversations to update last message
  invalidateQueries(queryClient, queryKeys.messaging.conversations());
}

// ============================================================================
// ROLLBACK HELPERS
// ============================================================================

/**
 * Rollback optimistic update
 * 
 * USE IN: onError callback of mutations with optimistic updates
 */
export function rollbackOptimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  previousData: T | undefined
): void {
  if (previousData !== undefined) {
    queryClient.setQueryData(queryKey, previousData);
  }
}

/**
 * Rollback multiple optimistic updates
 */
export function rollbackMultiple<T = any>(
  queryClient: QueryClient,
  rollbacks: Array<[queryKey: readonly unknown[], previousData: T | undefined]>
): void {
  rollbacks.forEach(([queryKey, previousData]) => {
    if (previousData !== undefined) {
      queryClient.setQueryData(queryKey, previousData);
    }
  });
}

// ============================================================================
// USAGE DECISION TREE
// ============================================================================

/**
 * DECISION TREE: Which pattern should I use?
 * 
 * ┌─────────────────────────────────────────┐
 * │ Is this a mutation?                     │
 * └─────────────────┬───────────────────────┘
 *                   │
 *         ┌─────────┴─────────┐
 *         │ YES               │ NO (real-time update)
 *         ▼                   ▼
 * ┌───────────────────┐   ┌─────────────────┐
 * │ Need instant UI?  │   │ Use Manual      │
 * └───────┬───────────┘   │ Update Pattern  │
 *         │               └─────────────────┘
 *    ┌────┴────┐
 *    │ YES     │ NO
 *    ▼         ▼
 * ┌─────────┐ ┌──────────────┐
 * │ Use     │ │ Use Simple   │
 * │ Optimis │ │ Invalidation │
 * │ tic     │ │              │
 * └─────────┘ └──────────────┘
 */
