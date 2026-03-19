/**
 * Conversations Hook - Lean Implementation
 * List + real-time updates + optimistic mark-as-read
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './use-websocket';
import { useEffect, useMemo, useRef } from 'react';
import { queryKeys } from '@/lib/query-keys';

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

async function fetchConversations(
  scope?: 'personal' | 'staff',
  limit = 50
): Promise<ConversationsResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (scope) params.set('scope', scope);
  
  const res = await fetch(`/api/conversations?${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch conversations');
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
  initialData?: ConversationsResponse;
  enabled?: boolean;
}

export function useConversations(options: UseConversationsOptions = {}) {
  const queryClient = useQueryClient();
  const { subscribe, send, isConnected } = useWebSocket();
  const enabled = options.enabled ?? true;
  const wasConnectedRef = useRef(false);
  const watchedUsersRef = useRef(new Set<string>());
  const presenceMapRef = useRef(new Map<string, { isOnline?: boolean; lastSeenAt?: Date | string | null }>());
  
  const limit = options.limit ?? 50;

  // Include limit so lightweight navbar data doesn't share cache with full inbox data
  const queryKey = ['conversations', options.userId, options.scope, limit] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => fetchConversations(options.scope, limit),
    enabled: !!options.userId && enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: enabled,
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: options.initialData,
    initialDataUpdatedAt: options.initialData ? Date.now() : undefined,
  });

  useEffect(() => {
    if (!options.userId || query.data?.totalUnread === undefined) return;
    queryClient.setQueryData(queryKeys.messaging.unreadCount(), {
      unreadCount: query.data.totalUnread ?? 0,
    });
  }, [options.userId, query.data?.totalUnread, queryClient]);

  useEffect(() => {
    if (!options.userId || !enabled) {
      wasConnectedRef.current = false;
      return;
    }

    const reconnected = isConnected && !wasConnectedRef.current;
    wasConnectedRef.current = isConnected;

    if (reconnected) {
      query.refetch();
    }
  }, [options.userId, isConnected, enabled, query.refetch]);

  // Match mobile behavior: actively watch presence for all users shown in the conversation list
  useEffect(() => {
    if (!options.userId || !enabled || !isConnected) return;

    const currentOtherIds = new Set<string>();
    for (const conversation of query.data?.conversations ?? []) {
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
  }, [options.userId, enabled, isConnected, query.data?.conversations, send]);

  useEffect(() => {
    return () => {
      for (const userId of watchedUsersRef.current) {
        send({ type: 'unwatch_user', targetUserId: userId });
      }
      watchedUsersRef.current.clear();
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

        let foundConversation = false;

        queryClient.setQueriesData({ queryKey: ['conversations'], exact: false }, (old: unknown) => {
          const data = old as ConversationsResponse | undefined;
          if (!data?.conversations) return old;

          const exists = data.conversations.some(c => c.id === msg.conversationId);
          if (!exists) return old;
          foundConversation = true;

          const currentConversation = data.conversations.find(c => c.id === msg.conversationId);
          const preview =
            newMsg?.text?.substring(0, 100) ||
            (currentConversation?.lastMessagePreview ?? 'New message');

          return {
            ...data,
            conversations: data.conversations
              .map(c => c.id !== msg.conversationId ? c : {
                ...c,
                lastMessageAt: new Date(newMsg?.createdAt || Date.now()),
                lastMessagePreview: preview,
                messageCount: Math.max((c.messageCount || 0) + (isOwnMessage ? 0 : 1), c.messageCount || 0),
                unreadCount: isOwnMessage ? c.unreadCount : (c.unreadCount || 0) + 1,
              })
              .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),
            totalUnread: isOwnMessage ? data.totalUnread : (data.totalUnread || 0) + 1,
          };
        });

        if (!foundConversation) {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      }
      
      // Handle presence updates - update isOnline/lastSeenAt for other participant
      if (msg.type === 'presence' && msg.userId) {
        presenceMapRef.current.set(msg.userId, {
          isOnline: !!msg.isOnline,
          lastSeenAt: msg.lastSeenAt ? new Date(msg.lastSeenAt) : null,
        });

        queryClient.setQueriesData({ queryKey: ['conversations'], exact: false }, (old: unknown) => {
          const data = old as ConversationsResponse | undefined;
          if (!data?.conversations) return old;
          
          return {
            ...data,
            conversations: data.conversations.map(c => 
              c.otherParticipant?.id !== msg.userId ? c : {
                ...c,
                otherParticipant: {
                  ...c.otherParticipant,
                  isOnline: !!msg.isOnline,
                  lastSeenAt: msg.lastSeenAt ? new Date(msg.lastSeenAt) : c.otherParticipant.lastSeenAt,
                },
              }
            ),
          };
        });
      }

      // Handle read receipts - update other participant's lastReadAt
      if (msg.type === 'read_receipt' && msg.conversationId && msg.userId !== options.userId) {
        queryClient.setQueriesData({ queryKey: ['conversations'], exact: false }, (old: unknown) => {
          const data = old as ConversationsResponse | undefined;
          if (!data?.conversations) return old;
          
          return {
            ...data,
            conversations: data.conversations.map(c => 
              c.id !== msg.conversationId ? c : {
                ...c,
                otherParticipant: c.otherParticipant ? {
                  ...c.otherParticipant,
                  lastReadAt: msg.lastReadAt ? new Date(msg.lastReadAt) : c.otherParticipant.lastReadAt,
                } : c.otherParticipant,
              }
            ),
          };
        });
      }
    });

    return unsub;
  }, [subscribe, queryClient, options.userId]);

  const conversations = useMemo(() => {
    return (query.data?.conversations ?? []).map((conversation) => {
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
  }, [query.data?.conversations]);

  return {
    conversations,
    totalUnread: query.data?.totalUnread ?? 0,
    hasMore: query.data?.hasMore ?? false,
    isLoading: query.isLoading,
    error: query.error?.message,
    refetch: query.refetch,
  };
}

// ============================================================================
// useMarkAsRead - Optimistic
// ============================================================================

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const markedRef = useRef(new Set<string>()); // Prevent duplicate calls within 5 seconds

  const mutation = useMutation({
    mutationFn: markAsReadAPI,

    onMutate: async (conversationId) => {
      // Skip optimistic update if already marked recently, but still allow API call
      if (markedRef.current.has(conversationId)) return;
      markedRef.current.add(conversationId);

      await queryClient.cancelQueries({ queryKey: ['conversations'] });

      queryClient.setQueriesData({ queryKey: ['conversations'], exact: false }, (old: unknown) => {
        const data = old as ConversationsResponse | undefined;
        if (!data?.conversations) return old;
        
        const conv = data.conversations.find(c => c.id === conversationId);
        const unreadToRemove = conv?.unreadCount || 0;

        return {
          ...data,
          conversations: data.conversations.map(c =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          ),
          totalUnread: Math.max(0, (data.totalUnread || 0) - unreadToRemove),
        };
      });

      queryClient.setQueryData(queryKeys.messaging.unreadCount(), (old: number | undefined) => Math.max(0, (old || 0) - 1));
    },

    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },

    onSettled: (_, __, conversationId) => {
      // Allow re-marking after 5 seconds
      setTimeout(() => markedRef.current.delete(conversationId), 5000);
    },
  });

  return { markAsRead: mutation.mutate, isMarking: mutation.isPending };
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
