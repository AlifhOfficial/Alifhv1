/**
 * Messaging Query Hooks
 * 
 * React Query hooks for messaging functionality.
 * Works alongside WebSocket for real-time updates.
 */

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

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
  userId?: string;
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
  userId?: string;
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
  const { userId, conversationId, initialData, enabled = true } = options;
  
  const queryKey = conversationId
    ? queryKeys.conversation(userId, conversationId)
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
    enabled: enabled && !!userId && !!conversationId,
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
  const { userId, scope = 'personal', enabled = true } = options;
  
  const queryKey = queryKeys.conversations(userId, scope);
  
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
    enabled: enabled && !!userId,
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
export function useMarkAsRead(userId?: string) {
  const queryClient = useQueryClient();
  const markedRef = useRef(new Set<string>());

  const mutation = useMutation({
    mutationFn: async ({ conversationId, messageId }: { conversationId: string; messageId?: string }) => {
      await markReadApi(conversationId, messageId);
      return conversationId;
    },
    onMutate: async ({ conversationId }) => {
      if (markedRef.current.has(conversationId)) {
        return { skipped: true };
      }
      markedRef.current.add(conversationId);

      // Optimistically update conversations cache
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      const now = new Date().toISOString();
      
      // Get current data
      const previousData = queryClient.getQueryData<{ conversations: Conversation[]; totalUnread: number }>(
        queryKeys.conversations(userId, 'personal')
      );
      
      if (previousData) {
        const conv = previousData.conversations.find(c => c.id === conversationId);
        const unreadToRemove = conv?.unreadCount ?? 0;
        
        queryClient.setQueryData(queryKeys.conversations(userId, 'personal'), {
          ...previousData,
          conversations: previousData.conversations.map(c =>
            c.id === conversationId ? { ...c, unreadCount: 0, myLastReadAt: now } : c
          ),
          totalUnread: Math.max(0, previousData.totalUnread - unreadToRemove),
        });
      }

      const previousConversation = queryClient.getQueryData<Conversation>(
        queryKeys.conversation(userId, conversationId)
      );

      if (previousConversation) {
        queryClient.setQueryData(queryKeys.conversation(userId, conversationId), {
          ...previousConversation,
          unreadCount: 0,
          myLastReadAt: now,
        });
      }
      
      return { previousData, previousConversation };
    },
    onError: (_err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.conversations(userId, 'personal'), context.previousData);
      }
      if (context?.previousConversation) {
        queryClient.setQueryData(queryKeys.conversation(userId, variables.conversationId), context.previousConversation);
      }
    },
    onSettled: (_data, _error, variables) => {
      markedRef.current.delete(variables.conversationId);
    }
  });

  return {
    markAsRead: (conversationId: string, messageId?: string) =>
      mutation.mutate({ conversationId, messageId }),
    isMarking: mutation.isPending,
  };
}

// ============================================================================
// PREFETCH HELPERS
// ============================================================================

/**
 * Hook to prefetch a conversation before navigation.
 * Call when user touches a conversation row.
 */
export function usePrefetchConversation(userId?: string) {
  const queryClient = useQueryClient();
  
  return useCallback(
    (conversationId: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.conversation(userId, conversationId),
        queryFn: () => fetchConversation(conversationId),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient, userId]
  );
}

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Update a conversation in the cache (for WebSocket updates).
 * Call from WebSocket handler to merge real-time updates.
 */
export function useConversationCacheUpdater(userId?: string) {
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
        queryKeys.conversation(userId, conversationId),
        (old) => (old ? updater(old) : old)
      );
    },
    [queryClient, userId]
  );
  
  const invalidateConversations = useCallback(
    () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    [queryClient]
  );
  
  return { updateConversation, invalidateConversations };
}
