/**
 * Conversations Hook - Lean Implementation
 * List + real-time updates + optimistic mark-as-read
 */

'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './use-websocket';
import { useEffect, useMemo, useRef } from 'react';
import { getConversationsAction } from '@/actions/messaging';
import { isConversationActive } from './active-conversations';

// ============================================================================
// Types
// ============================================================================

export interface Conversation {
  id: string;
  type: string;
  status: string;
  listingId: string | null;
  partnerId: string | null;
  subject: string | null;
  lastMessageAt: Date | string;
  lastMessagePreview: string | null;
  messageCount: number;
  unreadCount: number;
  myLastReadAt?: Date | string | null;
  isArchived: boolean;
  isMuted: boolean;
  isPinned: boolean;
  otherParticipant: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    lastReadAt?: Date | string | null;
    lastSeenAt?: Date | string | null;
    isOnline?: boolean;
  } | null;
  listing: { id: string; title: string; thumbnail: string | null } | null;
  partner: { id: string; name: string; logo: string | null } | null;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  totalUnread: number;
  hasMore: boolean;
}

const recentReadMarks = new Map<string, number>();
const READ_MARK_DEDUPE_MS = 60_000;

// ============================================================================
// API
// ============================================================================

async function fetchConversationsPage(
  scope?: 'personal' | 'staff',
  limit = 50,
  offset = 0
): Promise<ConversationsResponse> {
  return getConversationsAction(scope, limit, offset);
}

async function markAsReadAPI(conversationId: string): Promise<void> {
  const res = await fetch(`/api/conversations/${conversationId}/read`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to mark as read');
}

async function createConversationAPI(params: {
  otherUserId: string;
  listingId?: string;
  partnerId?: string;
}): Promise<{ conversationId: string; created: boolean }> {
  const res = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to create conversation');
  return res.json();
}

// ============================================================================
// useConversations
// ============================================================================

// Type for infinite query data structure
type ConversationsInfiniteData = { 
  pages: ConversationsResponse[]; 
  pageParams: number[];
};

interface UseConversationsOptions {
  userId?: string;
  scope?: 'personal' | 'staff';
  limit?: number;
  initialData?: ConversationsResponse;
  enabled?: boolean;
}

export function useConversations(options: UseConversationsOptions = {}) {
  const queryClient = useQueryClient();
  const { subscribe, send, isConnected } = useWebSocket();
  const enabled = options.enabled ?? true;
  const wasConnectedRef = useRef(isConnected);
  const lastReconnectRefetchAtRef = useRef(0);
  const watchedUsersRef = useRef(new Set<string>());
  const presenceMapRef = useRef(new Map<string, { isOnline?: boolean; lastSeenAt?: Date | string | null }>());
  const missingConversationRefetchAtRef = useRef(new Map<string, number>());
  
  const limit = options.limit ?? 50;

  // Include limit so lightweight navbar data doesn't share cache with full inbox data
  const queryKey = useMemo(
    () => ['conversations', options.userId, options.scope, limit] as const,
    [options.userId, options.scope, limit]
  );

  // Check for existing query state (set by QueryProvider or previous render)
  const existingQueryState = queryClient.getQueryState<ConversationsInfiniteData>(queryKey);
  const hasExistingData = existingQueryState?.data !== undefined;
  
  // Build effective initial data for infinite query structure
  const effectiveInitialData: ConversationsInfiniteData | undefined = options.initialData 
    ? { pages: [options.initialData], pageParams: [0] }
    : existingQueryState?.data;

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) => fetchConversationsPage(options.scope, limit, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      // Calculate next offset based on total conversations loaded
      const totalLoaded = allPages.reduce((sum, page) => sum + page.conversations.length, 0);
      return totalLoaded;
    },
    initialPageParam: 0,
    // Skip fetch if we have cached data (from QueryProvider seed or previous fetch)
    enabled: !!options.userId && enabled && !hasExistingData && !options.initialData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: effectiveInitialData,
    initialDataUpdatedAt: effectiveInitialData ? Date.now() : undefined,
  });
  const { refetch } = query;

  // Flatten all pages to get conversations and aggregate totalUnread
  const flatData = useMemo(() => {
    if (!query.data?.pages) return { conversations: [], totalUnread: 0 };
    
    const allConversations: Conversation[] = [];
    let totalUnread = 0;
    
    for (const page of query.data.pages) {
      allConversations.push(...page.conversations);
      // Only use totalUnread from first page (represents total count)
      if (page === query.data.pages[0]) {
        totalUnread = page.totalUnread;
      }
    }
    
    return { conversations: allConversations, totalUnread };
  }, [query.data?.pages]);

  // Track WebSocket connection transitions and perform a throttled refresh on reconnect.
  // This heals any missed WS events without forcing frequent background fetches.
  useEffect(() => {
    if (!options.userId || !enabled) {
      wasConnectedRef.current = false;
      return;
    }

    const wasConnected = wasConnectedRef.current;
    const now = Date.now();
    if (isConnected && !wasConnected && now - lastReconnectRefetchAtRef.current > 5000) {
      lastReconnectRefetchAtRef.current = now;
      void refetch();
    }

    wasConnectedRef.current = isConnected;
  }, [options.userId, isConnected, enabled, refetch]);

  // Match mobile behavior: actively watch presence for all users shown in the conversation list
  useEffect(() => {
    if (!options.userId || !enabled || !isConnected) return;

    const currentOtherIds = new Set<string>();
    for (const conversation of flatData.conversations) {
      if (conversation.otherParticipant?.id) {
        currentOtherIds.add(conversation.otherParticipant.id);
      }
    }

    for (const userId of currentOtherIds) {
      if (!watchedUsersRef.current.has(userId)) {
        send({ type: 'watch_user', targetUserId: userId });
        watchedUsersRef.current.add(userId);
      }
    }

    for (const userId of watchedUsersRef.current) {
      if (!currentOtherIds.has(userId)) {
        send({ type: 'unwatch_user', targetUserId: userId });
        watchedUsersRef.current.delete(userId);
      }
    }
  }, [options.userId, enabled, isConnected, flatData.conversations, send]);

  useEffect(() => {
    const watchedUsers = watchedUsersRef.current;
    return () => {
      for (const userId of watchedUsers) {
        send({ type: 'unwatch_user', targetUserId: userId });
      }
      watchedUsers.clear();
    };
  }, [send]);

  // WebSocket updates
  useEffect(() => {
    if (!options.userId) return;

    const unsub = subscribe((msg) => {
      // Handle new messages
      if (msg.type === 'new_message' && msg.conversationId) {
        const newMsg = msg.message as { createdAt?: string; text?: string; senderId?: string } | undefined;
        // Use msg.userId (from broadcast wrapper) for sender check
        const senderId = msg.userId || newMsg?.senderId;
        const isOwnMessage = senderId === options.userId;
        const isActiveOpenConversation = isConversationActive(msg.conversationId);

        let foundConversation = false;

        queryClient.setQueryData(queryKey, (old: unknown) => {
          const data = old as ConversationsInfiniteData | undefined;
          if (!data?.pages) return old;

          // Check if conversation exists in any page
          const exists = data.pages.some(page => 
            page.conversations.some(c => c.id === msg.conversationId)
          );
          if (!exists) return old;
          foundConversation = true;

          // Find the conversation to get current preview
          let currentConversation: Conversation | undefined;
          for (const page of data.pages) {
            currentConversation = page.conversations.find(c => c.id === msg.conversationId);
            if (currentConversation) break;
          }

          const preview =
            newMsg?.text?.substring(0, 100) ||
            (currentConversation?.lastMessagePreview ?? 'New message');

          return {
            ...data,
            pages: data.pages.map((page, idx) => ({
              ...page,
              conversations: page.conversations
                .map(c => c.id !== msg.conversationId ? c : {
                  ...c,
                  lastMessageAt: new Date(newMsg?.createdAt || Date.now()),
                  lastMessagePreview: preview,
                  messageCount: Math.max((c.messageCount || 0) + (isOwnMessage ? 0 : 1), c.messageCount || 0),
                  unreadCount: isOwnMessage || isActiveOpenConversation ? 0 : (c.unreadCount || 0) + 1,
                  myLastReadAt:
                    !isOwnMessage && isActiveOpenConversation
                      ? new Date(newMsg?.createdAt || Date.now())
                      : c.myLastReadAt,
                })
                .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),
              // Update totalUnread only on first page
              totalUnread:
                idx === 0 && !isOwnMessage && !isActiveOpenConversation
                  ? (page.totalUnread || 0) + 1
                  : page.totalUnread,
            })),
          };
        });

        if (!foundConversation) {
          const now = Date.now();
          const lastRefetchAt = missingConversationRefetchAtRef.current.get(msg.conversationId) ?? 0;

          // Throttle forced refetches per missing conversation to avoid WS bursts.
          if (now - lastRefetchAt > 1500) {
            missingConversationRefetchAtRef.current.set(msg.conversationId, now);
            refetch();
          }
        }
      }
      
      // Handle presence updates - update isOnline/lastSeenAt for other participant
      if (msg.type === 'presence' && msg.userId) {
        presenceMapRef.current.set(msg.userId, {
          isOnline: !!msg.isOnline,
          lastSeenAt: msg.lastSeenAt ? new Date(msg.lastSeenAt) : null,
        });

        queryClient.setQueryData(queryKey, (old: unknown) => {
          const data = old as ConversationsInfiniteData | undefined;
          if (!data?.pages) return old;
          
          return {
            ...data,
            pages: data.pages.map(page => ({
              ...page,
              conversations: page.conversations.map(c => 
                c.otherParticipant?.id !== msg.userId ? c : {
                  ...c,
                  otherParticipant: {
                    ...c.otherParticipant,
                    isOnline: !!msg.isOnline,
                    lastSeenAt: msg.lastSeenAt ? new Date(msg.lastSeenAt) : c.otherParticipant.lastSeenAt,
                  },
                }
              ),
            })),
          };
        });
      }

      // Handle read receipts - update other participant's lastReadAt
      if (msg.type === 'read_receipt' && msg.conversationId && msg.userId !== options.userId) {
        queryClient.setQueryData(queryKey, (old: unknown) => {
          const data = old as ConversationsInfiniteData | undefined;
          if (!data?.pages) return old;
          
          return {
            ...data,
            pages: data.pages.map(page => ({
              ...page,
              conversations: page.conversations.map(c => 
                c.id !== msg.conversationId ? c : {
                  ...c,
                  otherParticipant: c.otherParticipant ? {
                    ...c.otherParticipant,
                    lastReadAt: msg.lastReadAt ? new Date(msg.lastReadAt) : c.otherParticipant.lastReadAt,
                  } : c.otherParticipant,
                }
              ),
            })),
          };
        });
      }
    });

    return unsub;
  }, [subscribe, queryClient, options.userId, queryKey, refetch]);

  // Apply live presence updates to flattened conversations
  const conversations = useMemo(() => {
    return flatData.conversations.map((conversation) => {
      const otherId = conversation.otherParticipant?.id;
      if (!otherId || !conversation.otherParticipant) return conversation;

      const livePresence = presenceMapRef.current.get(otherId);
      if (!livePresence) return conversation;

      return {
        ...conversation,
        otherParticipant: {
          ...conversation.otherParticipant,
          isOnline: livePresence.isOnline ?? conversation.otherParticipant.isOnline,
          lastSeenAt: livePresence.lastSeenAt ?? conversation.otherParticipant.lastSeenAt,
        },
      };
    });
  }, [flatData.conversations]);

  // Check if more pages can be loaded
  const hasMore = query.hasNextPage ?? false;

  return {
    conversations,
    totalUnread: flatData.totalUnread,
    hasMore,
    isLoading: query.isLoading,
    isFetchingMore: query.isFetchingNextPage,
    error: query.error?.message,
    fetchMore: query.fetchNextPage,
    refetch,
  };
}

// ============================================================================
// useMarkAsRead - Optimistic
// ============================================================================

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const markedRef = useRef(new Set<string>()); // Prevent duplicate calls within 5 seconds

  const mutation = useMutation({
    mutationFn: async ({ conversationId, messageId }: { conversationId: string; messageId?: string }) => {
      const dedupeKey = messageId ? `${conversationId}:${messageId}` : conversationId;
      const lastMarkedAt = recentReadMarks.get(dedupeKey);
      if (lastMarkedAt && Date.now() - lastMarkedAt < READ_MARK_DEDUPE_MS) {
        return;
      }
      recentReadMarks.set(dedupeKey, Date.now());
      await markAsReadAPI(conversationId);
    },

    onMutate: async ({ conversationId, messageId }) => {
      const dedupeKey = messageId ? `${conversationId}:${messageId}` : conversationId;
      const lastMarkedAt = recentReadMarks.get(dedupeKey);
      if (lastMarkedAt && Date.now() - lastMarkedAt < READ_MARK_DEDUPE_MS) {
        return { skipped: true };
      }

      // Skip optimistic update if already marked recently, but still allow API call
      if (markedRef.current.has(conversationId)) return;
      markedRef.current.add(conversationId);

      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      let unreadToRemove = 0;

      queryClient.setQueriesData({ queryKey: ['conversations'], exact: false }, (old: unknown) => {
        const data = old as ConversationsInfiniteData | undefined;
        if (!data?.pages) return old;

        return {
          ...data,
          pages: data.pages.map((page, idx) => {
            const conv = page.conversations.find(c => c.id === conversationId);
            unreadToRemove = Math.max(unreadToRemove, conv?.unreadCount || 0);

            return {
              ...page,
              conversations: page.conversations.map(c =>
                c.id === conversationId ? { ...c, unreadCount: 0 } : c
              ),
              totalUnread: idx === 0
                ? Math.max(0, (page.totalUnread || 0) - unreadToRemove)
                : page.totalUnread,
            };
          }),
        };
      });

    },

    onError: (_error, variables) => {
      if (variables?.messageId) {
        recentReadMarks.delete(`${variables.conversationId}:${variables.messageId}`);
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },

    onSettled: (_, __, variables) => {
      const conversationId = variables.conversationId;
      // Allow re-marking after 5 seconds
      setTimeout(() => markedRef.current.delete(conversationId), 5000);
    },
  });

  return {
    markAsRead: (conversationId: string, messageId?: string) =>
      mutation.mutate({ conversationId, messageId }),
    isMarking: mutation.isPending,
  };
}

// ============================================================================
// useCreateConversation
// ============================================================================

export function useCreateConversation() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({ 
    mutationFn: createConversationAPI,
    onSuccess: () => {
      // Force refetch conversations list to include newly created conversation
      queryClient.refetchQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    createConversation: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error?.message,
  };
}
