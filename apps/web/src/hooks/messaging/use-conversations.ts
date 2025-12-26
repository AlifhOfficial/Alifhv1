/**
 * Conversations Hook - Lean Implementation
 * List + real-time updates + optimistic mark-as-read
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './use-websocket';
import { useEffect } from 'react';

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
  lastMessageAt: Date;
  lastMessagePreview: string | null;
  messageCount: number;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  isPinned: boolean;
  otherParticipant: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    lastReadAt?: Date | string | null;
  } | null;
  listing: { id: string; title: string; thumbnail: string | null } | null;
  partner: { id: string; name: string; logo: string | null } | null;
}

interface ConversationsResponse {
  conversations: Conversation[];
  totalUnread: number;
  hasMore: boolean;
}

// ============================================================================
// API
// ============================================================================

async function fetchConversations(scope?: 'personal' | 'staff'): Promise<ConversationsResponse> {
  const params = new URLSearchParams({ limit: '50' });
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
}

export function useConversations(options: UseConversationsOptions = {}) {
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();

  const query = useQuery({
    queryKey: ['conversations', options],
    queryFn: () => fetchConversations(options.scope),
    staleTime: 5 * 60 * 1000,
    enabled: !!options.userId,
  });

  // WebSocket updates
  useEffect(() => {
    if (!options.userId) return;

    const unsub = subscribe((msg) => {
      if (msg.type === 'new_message' && msg.conversationId) {
        const newMsg = msg.message as { createdAt?: string; text?: string; senderId?: string } | undefined;

        queryClient.setQueryData(['conversations', options], (old: ConversationsResponse | undefined) => {
          if (!old?.conversations) return old;
          
          const exists = old.conversations.some(c => c.id === msg.conversationId);
          if (!exists) {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            return old;
          }

          return {
            ...old,
            conversations: old.conversations
              .map(c => c.id !== msg.conversationId ? c : {
                ...c,
                lastMessageAt: new Date(newMsg?.createdAt || Date.now()),
                lastMessagePreview: newMsg?.text?.substring(0, 100) || 'New message',
                messageCount: (c.messageCount || 0) + 1,
                unreadCount: newMsg?.senderId !== options.userId ? (c.unreadCount || 0) + 1 : c.unreadCount,
              })
              .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),
            totalUnread: newMsg?.senderId !== options.userId ? (old.totalUnread || 0) + 1 : old.totalUnread,
          };
        });
      }
    });

    return unsub;
  }, [subscribe, queryClient, options]);

  return {
    conversations: query.data?.conversations ?? [],
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
  const markedRef = new Set<string>(); // Prevent duplicate calls

  const mutation = useMutation({
    mutationFn: markAsReadAPI,

    onMutate: async (conversationId) => {
      if (markedRef.has(conversationId)) return;
      markedRef.add(conversationId);

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

      queryClient.setQueryData(['unread-count'], (old: number | undefined) => Math.max(0, (old || 0) - 1));
    },

    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },

    onSettled: (_, __, conversationId) => {
      // Allow re-marking after 5 seconds
      setTimeout(() => markedRef.delete(conversationId), 5000);
    },
  });

  return { markAsRead: mutation.mutate, isMarking: mutation.isPending };
}

// ============================================================================
// useCreateConversation
// ============================================================================

export function useCreateConversation() {
  const mutation = useMutation({ mutationFn: createConversationAPI });

  return {
    createConversation: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error?.message,
  };
}
