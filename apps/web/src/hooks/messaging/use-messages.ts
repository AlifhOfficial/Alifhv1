/**
 * Messages Hook - Lean Implementation
 * Infinite scroll + real-time updates + optimistic send
 */

'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './use-websocket';
import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string | null;
  mediaUrl: string | null;
  mediaType: 'image' | 'audio' | 'video' | 'document' | 'location' | null;
  mediaThumbnail: string | null;
  mediaMetadata: Record<string, unknown> | null;
  isSystemMessage: boolean;
  systemMessageType: string | null;
  deliveredAt: Date | null;
  readAt: Date | null;
  isEdited: boolean;
  editedAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  sender: { id: string; name: string | null; avatarUrl: string | null };
}

interface MessagesPage {
  messages: Message[];
  hasMore: boolean;
  nextCursor: string | null;
}

// ============================================================================
// API
// ============================================================================

async function fetchMessages(conversationId: string, cursor?: string): Promise<MessagesPage> {
  const params = new URLSearchParams({ limit: '50' });
  if (cursor) params.set('cursor', cursor);

  const res = await fetch(`/api/conversations/${conversationId}/messages?${params}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

async function postMessage(conversationId: string, text: string): Promise<{ message: Message }> {
  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

// ============================================================================
// useMessages - Main Hook
// ============================================================================

interface UseMessagesOptions {
  otherUserId?: string | null;
  initialLastReadAt?: Date | string | null;
}

export function useMessages(conversationId: string, userId?: string, options: UseMessagesOptions = {}) {
  const queryClient = useQueryClient();
  const { subscribe, send, isConnected } = useWebSocket();

  // Presence state (typing + online + lastRead)
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState<boolean | null>(null);
  const [otherLastReadAt, setOtherLastReadAt] = useState<Date | null>(() => {
    const v = options.initialLastReadAt;
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    return isNaN(d.getTime()) ? null : d;
  });
  const [otherLastSeenAt, setOtherLastSeenAt] = useState<Date | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const watchingRef = useRef(false);

  // Query
  const query = useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam }) => fetchMessages(conversationId, pageParam),
    getNextPageParam: (page) => page.nextCursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 5 * 60 * 1000,
    enabled: !!conversationId && !!userId,
  });

  // Watch presence for other user
  useEffect(() => {
    if (!options.otherUserId || !isConnected || watchingRef.current) return;
    watchingRef.current = true;
    send({ type: 'watch_user', targetUserId: options.otherUserId });
    return () => {
      if (watchingRef.current) {
        send({ type: 'unwatch_user', targetUserId: options.otherUserId });
        watchingRef.current = false;
      }
    };
  }, [isConnected, options.otherUserId, send]);

  // WebSocket subscription
  useEffect(() => {
    if (!conversationId || !userId) return;

    const unsub = subscribe((msg) => {
      // New message
      if (msg.type === 'new_message' && msg.conversationId === conversationId) {
        const newMsg = msg.message as Message;
        queryClient.setQueryData(['messages', conversationId], (old: { pages: MessagesPage[] } | undefined) => {
          if (!old) return old;
          const first = old.pages[0];
          if (first.messages.some(m => m.id === newMsg.id)) return old;
          return {
            ...old,
            pages: [{ ...first, messages: [newMsg, ...first.messages] }, ...old.pages.slice(1)],
          };
        });
      }

      // Typing indicator
      if (msg.type === 'typing' && msg.conversationId === conversationId && msg.userId !== userId) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setIsOtherTyping(!!msg.isTyping);
        if (msg.isTyping) {
          typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 4000);
        }
      }

      // Read receipt
      if (msg.type === 'read_receipt' && msg.conversationId === conversationId && msg.userId !== userId) {
        const d = msg.lastReadAt ? new Date(msg.lastReadAt) : null;
        if (d && !isNaN(d.getTime())) setOtherLastReadAt(d);
      }

      // Presence
      if (msg.type === 'presence' && options.otherUserId && msg.userId === options.otherUserId) {
        setIsOtherOnline(!!msg.isOnline);
        if (msg.lastSeenAt) {
          const d = new Date(msg.lastSeenAt);
          if (!isNaN(d.getTime())) setOtherLastSeenAt(d);
        }
      }
    });

    return () => {
      unsub();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, userId, options.otherUserId, subscribe, queryClient]);

  // Throttled typing sender
  const lastTypingSent = useRef(0);
  const sendTyping = useCallback((targetUserId: string, isTyping: boolean) => {
    const now = Date.now();
    if (isTyping && now - lastTypingSent.current < 1000) return;
    lastTypingSent.current = now;
    send({ type: 'typing', targetUserId, conversationId, isTyping });
  }, [conversationId, send]);

  const messages = query.data?.pages.flatMap(p => p.messages) ?? [];

  return {
    messages,
    isLoading: query.isLoading,
    isFetchingMore: query.isFetchingNextPage,
    hasMore: query.hasNextPage ?? false,
    fetchMore: query.fetchNextPage,
    isOtherTyping,
    isOtherOnline,
    otherLastReadAt,
    otherLastSeenAt,
    sendTyping,
  };
}

// ============================================================================
// useSendMessage - Optimistic Send
// ============================================================================

export function useSendMessage() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ conversationId, text }: { conversationId: string; senderId: string; text: string }) =>
      postMessage(conversationId, text),

    onMutate: async ({ conversationId, senderId, text }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });
      const previous = queryClient.getQueryData(['messages', conversationId]);

      // Optimistic message
      const tempMsg: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId,
        text,
        mediaUrl: null,
        mediaType: null,
        mediaThumbnail: null,
        mediaMetadata: null,
        isSystemMessage: false,
        systemMessageType: null,
        deliveredAt: null,
        readAt: null,
        isEdited: false,
        editedAt: null,
        isDeleted: false,
        createdAt: new Date(),
        sender: { id: senderId, name: null, avatarUrl: null },
      };

      queryClient.setQueryData(['messages', conversationId], (old: { pages: MessagesPage[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: [
            { ...old.pages[0], messages: [tempMsg, ...old.pages[0].messages] },
            ...old.pages.slice(1),
          ],
        };
      });

      return { previous };
    },

    onSuccess: (data, { conversationId }) => {
      // Replace temp with real
      queryClient.setQueryData(['messages', conversationId], (old: { pages: MessagesPage[] } | undefined) => {
        if (!old) return old;
        const filtered = old.pages[0].messages.filter(m => !m.id.startsWith('temp-') && m.id !== data.message.id);
        return {
          ...old,
          pages: [{ ...old.pages[0], messages: [data.message, ...filtered] }, ...old.pages.slice(1)],
        };
      });

      // Update conversation preview
      queryClient.setQueriesData({ queryKey: ['conversations'], exact: false }, (old: unknown) => {
        const data2 = old as { conversations?: Array<{ id: string; lastMessageAt?: unknown; lastMessagePreview?: string }> };
        if (!data2?.conversations) return old;
        return {
          ...data2,
          conversations: data2.conversations.map(c =>
            c.id === conversationId
              ? { ...c, lastMessageAt: data.message.createdAt, lastMessagePreview: data.message.text }
              : c
          ),
        };
      });
    },

    onError: (_err, { conversationId }, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['messages', conversationId], ctx.previous);
    },
  });

  return {
    sendMessage: mutation.mutateAsync,
    isSending: mutation.isPending,
    error: mutation.error?.message,
  };
}
