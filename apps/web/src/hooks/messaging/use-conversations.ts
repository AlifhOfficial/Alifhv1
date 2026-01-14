/**
 * Conversations Hook - Lean Implementation
 * List + real-time updates + optimistic mark-as-read
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './use-websocket';
import { useEffect, useRef } from 'react';

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
  limit?: number; // Not used in query key, just for API
  enabled?: boolean; // Control whether to fetch (defaults to true when userId is present)
}

export function useConversations(options: UseConversationsOptions = {}) {
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();
  
  // Stable query key - only include userId and scope
  const queryKey = ['conversations', options.userId, options.scope] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => fetchConversations(options.scope),
    enabled: !!options.userId && (options.enabled !== false),
  });

  // WebSocket updates
  useEffect(() => {
    if (!options.userId) return;

    const unsub = subscribe((msg) => {
      // Handle new messages
      if (msg.type === 'new_message' && msg.conversationId) {
        console.log(`📬 [useConversations] New message received for conv: ${msg.conversationId}`);
        const newMsg = msg.message as { createdAt?: string; text?: string; senderId?: string } | undefined;
        // Use msg.userId (from broadcast wrapper) for sender check
        const senderId = msg.userId || newMsg?.senderId;
        const isOwnMessage = senderId === options.userId;

        queryClient.setQueryData(queryKey, (old: ConversationsResponse | undefined) => {
          if (!old?.conversations) {
            console.log(`📬 [useConversations] No cached conversations, invalidating`);
            return old;
          }
          
          const exists = old.conversations.some(c => c.id === msg.conversationId);
          if (!exists) {
            console.log(`📬 [useConversations] Conversation not in cache, invalidating to fetch`);
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            return old;
          }

          console.log(`📬 [useConversations] Updating conversation in cache, isOwnMessage: ${isOwnMessage}`);
          return {
            ...old,
            conversations: old.conversations
              .map(c => c.id !== msg.conversationId ? c : {
                ...c,
                lastMessageAt: new Date(newMsg?.createdAt || Date.now()),
                lastMessagePreview: newMsg?.text?.substring(0, 100) || 'New message',
                messageCount: (c.messageCount || 0) + 1,
                // Don't increment unread if this is your own message
                unreadCount: isOwnMessage ? c.unreadCount : (c.unreadCount || 0) + 1,
              })
              .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),
            // Don't increment total unread if this is your own message  
            totalUnread: isOwnMessage ? old.totalUnread : (old.totalUnread || 0) + 1,
          };
        });
      }
      
      // Handle read receipts - update other participant's lastReadAt
      if (msg.type === 'read_receipt' && msg.conversationId && msg.userId !== options.userId) {
        queryClient.setQueryData(queryKey, (old: ConversationsResponse | undefined) => {
          if (!old?.conversations) return old;
          
          return {
            ...old,
            conversations: old.conversations.map(c => 
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
  }, [subscribe, queryClient, options.userId, options.scope, queryKey]);

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

      queryClient.setQueryData(['unread-count'], (old: number | undefined) => Math.max(0, (old || 0) - 1));
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
      // Invalidate conversations list to include newly created conversation
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    createConversation: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error?.message,
  };
}
