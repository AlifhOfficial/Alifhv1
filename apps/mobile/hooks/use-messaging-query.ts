/**
 * Messaging Query Hooks
 * 
 * React Query hooks for messaging functionality.
 * Works alongside WebSocket for real-time updates.
 */

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';

import { queryKeys } from '@/lib/query-client';
import {
  fetchConversation,
  fetchConversations,
  markConversationAsRead as markReadApi,
  type Conversation,
} from '@/lib/messaging-api';
import { getAvatarUrl } from '@/lib/config';

// ============================================================================
// TYPES
// ============================================================================

export interface UseConversationOptions {
  conversationId: string | undefined;
  /** Initial data passed from navigation (avoids fetch if available) */
  initialData?: Conversation;
  /** Whether to enable the query */
  enabled?: boolean;
}

export interface UseConversationResult {
  conversation: Conversation | undefined;
  /** True only when fetching AND no cached/initial data */
  isLoading: boolean;
  /** True when refetching with data already visible */
  isFetching: boolean;
  error: Error | null;
  refresh: () => void;
}

export interface UseConversationsQueryOptions {
  scope?: 'personal' | 'staff';
  enabled?: boolean;
}

export interface UseConversationsQueryResult {
  conversations: Conversation[];
  totalUnread: number;
  /** Only true when fetching with no cached data */
  isLoading: boolean;
  /** True when refetching with data visible */
  isFetching: boolean;
  isRefreshing: boolean;
  error: Error | null;
  refresh: () => void;
}

// ============================================================================
// SINGLE CONVERSATION HOOK
// ============================================================================

/**
 * Hook for fetching a single conversation.
 * Used by chat screen - supports passing initial data from navigation.
 * 
 * @example
 * ```tsx
 * // Parse from nav params if available
 * const initialConversation = params.conversationData 
 *   ? JSON.parse(params.conversationData) 
 *   : undefined;
 * 
 * const { conversation, isLoading } = useConversation({
 *   conversationId: params.conversationId,
 *   initialData: initialConversation,
 * });
 * ```
 */
export function useConversation(options: UseConversationOptions): UseConversationResult {
  const { conversationId, initialData, enabled = true } = options;
  
  const queryKey = conversationId 
    ? queryKeys.conversation(conversationId) 
    : ['conversation', 'none'] as const;
  
  const {
    data: conversation,
    isLoading: isQueryLoading,
    isFetching,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!conversationId) throw new Error('No conversation ID');
      const conv = await fetchConversation(conversationId);
      // Transform avatar URLs
      return {
        ...conv,
        otherParticipant: conv.otherParticipant ? {
          ...conv.otherParticipant,
          avatarUrl: getAvatarUrl(conv.otherParticipant.avatarUrl),
        } : null,
        listing: conv.listing ? {
          ...conv.listing,
          thumbnail: getAvatarUrl(conv.listing.thumbnail),
        } : null,
      };
    },
    enabled: enabled && !!conversationId,
    // Use initial data from navigation params
    initialData,
    // Conversations are fairly stable
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    // Keep previous data during refetch
    placeholderData: (previousData) => previousData,
  });
  
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);
  
  return {
    conversation,
    // Only show loading when truly no data
    isLoading: isQueryLoading && !conversation,
    // Background fetch indicator
    isFetching: isFetching && !!conversation,
    error: error as Error | null,
    refresh,
  };
}

// ============================================================================
// CONVERSATIONS LIST HOOK (for use with WebSocket hook)
// ============================================================================

/**
 * React Query hook for conversations list.
 * Provides caching layer - designed to work WITH WebSocket updates.
 * 
 * Note: For real-time updates, use this with useConversationsWebSocket
 * which handles presence and new message notifications.
 */
export function useConversationsQuery(options: UseConversationsQueryOptions = {}): UseConversationsQueryResult {
  const { scope = 'personal', enabled = true } = options;
  
  const queryKey = queryKeys.conversations(scope);
  
  const {
    data,
    isLoading: isQueryLoading,
    isFetching,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetchConversations({ scope, limit: 50 });
      // Filter and transform
      const conversations = response.conversations
        .filter(c => c.messageCount > 0)
        .map(conv => ({
          ...conv,
          otherParticipant: conv.otherParticipant ? {
            ...conv.otherParticipant,
            avatarUrl: getAvatarUrl(conv.otherParticipant.avatarUrl),
          } : null,
          listing: conv.listing ? {
            ...conv.listing,
            thumbnail: getAvatarUrl(conv.listing.thumbnail),
          } : null,
        }));
      return { conversations, totalUnread: response.totalUnread };
    },
    enabled,
    // Messages list should refresh more often
    staleTime: 1 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
  
  const conversations = data?.conversations ?? [];
  
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);
  
  return {
    conversations,
    totalUnread: data?.totalUnread ?? 0,
    isLoading: isQueryLoading && conversations.length === 0,
    isFetching: isFetching && conversations.length > 0,
    isRefreshing: isRefetching,
    error: error as Error | null,
    refresh,
  };
}

// ============================================================================
// MARK AS READ MUTATION
// ============================================================================

/**
 * Mutation hook for marking conversation as read.
 * Optimistically updates cache.
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (conversationId: string) => {
      await markReadApi(conversationId);
      return conversationId;
    },
    onMutate: async (conversationId) => {
      // Optimistically update conversations cache
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      
      // Get current data
      const previousData = queryClient.getQueryData<{ conversations: Conversation[]; totalUnread: number }>(
        queryKeys.conversations('personal')
      );
      
      if (previousData) {
        const conv = previousData.conversations.find(c => c.id === conversationId);
        const unreadToRemove = conv?.unreadCount ?? 0;
        
        queryClient.setQueryData(queryKeys.conversations('personal'), {
          ...previousData,
          conversations: previousData.conversations.map(c =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          ),
          totalUnread: Math.max(0, previousData.totalUnread - unreadToRemove),
        });
      }
      
      return { previousData };
    },
    onError: (_err, _conversationId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.conversations('personal'), context.previousData);
      }
    },
  });
}

// ============================================================================
// PREFETCH HELPERS
// ============================================================================

/**
 * Hook to prefetch a conversation before navigation.
 * Call when user touches a conversation row.
 */
export function usePrefetchConversation() {
  const queryClient = useQueryClient();
  
  return useCallback(
    (conversationId: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.conversation(conversationId),
        queryFn: () => fetchConversation(conversationId),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Update a conversation in the cache (for WebSocket updates).
 * Call from WebSocket handler to merge real-time updates.
 */
export function useConversationCacheUpdater() {
  const queryClient = useQueryClient();
  
  const updateConversation = useCallback(
    (conversationId: string, updater: (conv: Conversation) => Conversation) => {
      // Update in conversations list cache
      queryClient.setQueriesData<{ conversations: Conversation[]; totalUnread: number }>(
        { queryKey: ['conversations'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            conversations: old.conversations.map(c =>
              c.id === conversationId ? updater(c) : c
            ),
          };
        }
      );
      
      // Update single conversation cache
      queryClient.setQueryData<Conversation>(
        queryKeys.conversation(conversationId),
        (old) => (old ? updater(old) : old)
      );
    },
    [queryClient]
  );
  
  const invalidateConversations = useCallback(
    () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    [queryClient]
  );
  
  return { updateConversation, invalidateConversations };
}
