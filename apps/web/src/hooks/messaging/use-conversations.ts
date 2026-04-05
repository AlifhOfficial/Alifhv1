/**
 * Conversations Hook - Lean Implementation
 * List + real-time updates + optimistic mark-as-read
 */

'use client';

import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useWebSocket } from './use-websocket';
import { useEffect, useMemo, useRef, useState } from 'react';
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

// ============================================================================
// API
// ============================================================================

async function fetchConversationsPage(
  scope?: 'personal' | 'staff',
  limit = 50,
  offset = 0
): Promise<ConversationsResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (scope) {
    params.set('scope', scope);
  }

  const res = await fetch(`/api/conversations?${params.toString()}`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch conversations');
  }

  return res.json();
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

interface UseConversationsOptions {
  userId?: string;
  scope?: 'personal' | 'staff';
  limit?: number;
  enabled?: boolean;
}

export function useConversations(options: UseConversationsOptions = {}) {
  const queryClient = useQueryClient();
  const { subscribe, send, isConnected } = useWebSocket();
  const enabled = options.enabled ?? true;
  const wasConnectedRef = useRef(false);
  const watchedUsersRef = useRef(new Set<string>());
  const [presenceMap, setPresenceMap] = useState(
    new Map<string, { isOnline?: boolean; lastSeenAt?: Date | string | null }>()
  );
  
  const limit = options.limit ?? 50;

  // Include limit so lightweight navbar data doesn't share cache with full inbox data
  const queryKey = useMemo(
    () => ['conversations', options.userId, options.scope, limit] as const,
    [options.userId, options.scope, limit]
  );

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
    enabled: !!options.userId && enabled,
    // Disable client caching for messaging and always refresh from network.
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  });

  const pages = query.data?.pages;

  // Flatten all pages to get conversations and aggregate totalUnread
  const flatData = useMemo(() => {
    if (!pages) return { conversations: [], totalUnread: 0 };
    
    const allConversations: Conversation[] = [];
    let totalUnread = 0;
    
    for (const page of pages) {
      allConversations.push(...page.conversations);
      // Only use totalUnread from first page (represents total count)
      if (page === pages[0]) {
        totalUnread = page.totalUnread;
      }
    }
    
    return { conversations: allConversations, totalUnread };
  }, [pages]);

  // Track WebSocket connection state for presence watching
  // NOTE: We do NOT refetch on reconnect - server-seeded data is authoritative
  // Real-time updates come via WebSocket subscriptions below
  useEffect(() => {
    if (!options.userId || !enabled) {
      wasConnectedRef.current = false;
      return;
    }
    wasConnectedRef.current = isConnected;
  }, [options.userId, isConnected, enabled]);

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
        let found = false;

        queryClient.setQueryData<InfiniteData<ConversationsResponse>>(queryKey, (current) => {
          if (!current) return current;

          const payload = msg.message as { text?: string | null; createdAt?: string; senderId?: string } | undefined;
          const senderId = msg.userId ?? payload?.senderId;
          const isOwnMessage = senderId === options.userId;
          const isActiveOpenConversation = isConversationActive(msg.conversationId!);
          const createdAt = payload?.createdAt ?? new Date().toISOString();
          const preview = payload?.text?.substring(0, 100) || 'New message';

          const allConversations = current.pages.flatMap((page) => page.conversations);
          const updatedConversations = allConversations.map((conversation) => {
            if (conversation.id !== msg.conversationId) return conversation;

            found = true;
            return {
              ...conversation,
              lastMessageAt: createdAt,
              lastMessagePreview: preview,
              messageCount: Math.max(
                (conversation.messageCount || 0) + (isOwnMessage ? 0 : 1),
                conversation.messageCount || 0
              ),
              unreadCount:
                isOwnMessage || isActiveOpenConversation
                  ? 0
                  : (conversation.unreadCount || 0) + 1,
              myLastReadAt:
                !isOwnMessage && isActiveOpenConversation
                  ? createdAt
                  : conversation.myLastReadAt,
            };
          });

          if (!found) return current;

          const sorted = updatedConversations.sort(
            (a, b) => new Date(String(b.lastMessageAt)).getTime() - new Date(String(a.lastMessageAt)).getTime()
          );

          const rebuiltPages = current.pages.map((page, index) => {
            const start = current.pages.slice(0, index).reduce((sum, p) => sum + p.conversations.length, 0);
            const end = start + page.conversations.length;
            return {
              ...page,
              conversations: sorted.slice(start, end),
            };
          });

          return {
            ...current,
            pages: rebuiltPages,
          };
        });

        if (!found) {
          // New conversation may exist but is not in current page slice.
          queryClient.invalidateQueries({ queryKey });
        }
      }
      
      // Handle presence updates - update isOnline/lastSeenAt for other participant
      if (msg.type === 'presence' && msg.userId) {
        setPresenceMap((prev) => {
          const next = new Map(prev);
          next.set(msg.userId, {
            isOnline: !!msg.isOnline,
            lastSeenAt: msg.lastSeenAt ? new Date(msg.lastSeenAt) : null,
          });
          return next;
        });
      }

      // Handle read receipts - update other participant's lastReadAt
      if (msg.type === 'read_receipt' && msg.conversationId && msg.userId !== options.userId) {
        queryClient.setQueryData<InfiniteData<ConversationsResponse>>(queryKey, (current) => {
          if (!current) return current;

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              conversations: page.conversations.map((conversation) => {
                if (conversation.id !== msg.conversationId || !conversation.otherParticipant) {
                  return conversation;
                }
                return {
                  ...conversation,
                  otherParticipant: {
                    ...conversation.otherParticipant,
                    lastReadAt: msg.lastReadAt || conversation.otherParticipant.lastReadAt,
                  },
                };
              }),
            })),
          };
        });
      }
    });

    return unsub;
  }, [subscribe, queryClient, options.userId, queryKey]);

  // Apply live presence updates to flattened conversations
  const conversations = useMemo(() => {
    return flatData.conversations.map((conversation) => {
      const otherId = conversation.otherParticipant?.id;
      if (!otherId || !conversation.otherParticipant) return conversation;

      const livePresence = presenceMap.get(otherId);
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
  }, [flatData.conversations, presenceMap]);

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
    refetch: query.refetch,
  };
}

// ============================================================================
// useMarkAsRead - Optimistic
// ============================================================================

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ conversationId }: { conversationId: string; messageId?: string }) => {
      await markAsReadAPI(conversationId);
    },

    onError: (_error) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
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
