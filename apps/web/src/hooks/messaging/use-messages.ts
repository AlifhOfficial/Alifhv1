/**
 * Messages Hook - Lean Implementation
 * Infinite scroll + real-time updates + optimistic send
 */

'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './use-websocket';
import { useCallback, useEffect, useRef, useState } from 'react';
import { queryKeys } from '@/lib/query-keys';
import { getMessagesPageAction } from '@/actions/messaging';

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
  deliveredAt: Date | string | null;
  readAt: Date | string | null;
  isEdited: boolean;
  editedAt: Date | string | null;
  isDeleted: boolean;
  createdAt: Date | string;
  sender: { id: string; name: string | null; avatarUrl: string | null };
}

interface MessagesPage {
  messages: Message[];
  hasMore: boolean;
  nextCursor: string | null;
  otherParticipantLastReadAt?: string | null; // Included on first page only
}

// ============================================================================
// API
// ============================================================================

async function fetchMessages(conversationId: string, cursor?: string): Promise<MessagesPage> {
  return getMessagesPageAction(conversationId, cursor, 50);
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

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  placeName?: string;
}

async function postLocationMessage(conversationId: string, location: LocationData): Promise<{ message: Message }> {
  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      text: location.address || 'Shared location',
      mediaType: 'location',
      mediaMetadata: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        placeName: location.placeName,
      },
    }),
  });
  if (!res.ok) throw new Error('Failed to send location');
  return res.json();
}

// ============================================================================
// useMessages - Main Hook
// ============================================================================

export interface InitialMessagesData {
  messages: Message[];
  hasMore: boolean;
  nextCursor: string | null;
  otherParticipantLastReadAt?: string | null;
}

interface UseMessagesOptions {
  otherUserId?: string | null;
  initialLastReadAt?: Date | string | null;
  initialLastSeenAt?: Date | string | null;
  initialData?: InitialMessagesData;
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
  const [otherLastSeenAt, setOtherLastSeenAt] = useState<Date | null>(() => {
    const v = options.initialLastSeenAt;
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    return isNaN(d.getTime()) ? null : d;
  });

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const watchingRef = useRef(false);

  // Update state when initial values change (from conversation refresh)
  // Only update if the new value is MORE recent than current state
  useEffect(() => {
    if (options.initialLastSeenAt) {
      const d = options.initialLastSeenAt instanceof Date 
        ? options.initialLastSeenAt 
        : new Date(options.initialLastSeenAt);
      if (!isNaN(d.getTime())) {
        setOtherLastSeenAt(prev => {
          // Only update if new value is more recent or we have no value
          if (!prev || d > prev) return d;
          return prev;
        });
      }
    }
  }, [options.initialLastSeenAt]);

  useEffect(() => {
    if (options.initialLastReadAt) {
      const d = options.initialLastReadAt instanceof Date 
        ? options.initialLastReadAt 
        : new Date(options.initialLastReadAt);
      if (!isNaN(d.getTime())) {
        setOtherLastReadAt(prev => {
          // Only update if new value is more recent or we have no value
          if (!prev || d > prev) return d;
          return prev;
        });
      }
    }
  }, [options.initialLastReadAt]);

  // Check for existing query state (set by page prefetch or previous render)
  type MessagesInfiniteData = { pages: MessagesPage[]; pageParams: (string | undefined)[] };
  const messagesQueryKey = queryKeys.messaging.messages(conversationId);
  const existingQueryState = queryClient.getQueryState<MessagesInfiniteData>(messagesQueryKey);
  
  // Build effective initial data from props or cache
  const effectiveInitialData = options.initialData 
    ? { pages: [options.initialData], pageParams: [undefined] }
    : existingQueryState?.data;

  // Query
  const query = useInfiniteQuery({
    queryKey: messagesQueryKey,
    queryFn: ({ pageParam }) => fetchMessages(conversationId, pageParam),
    getNextPageParam: (page) => (page.hasMore ? page.nextCursor ?? undefined : undefined),
    initialPageParam: undefined as string | undefined,
    // Keep query active so threads can recover from missed realtime events.
    enabled: !!conversationId && !!userId,
    // Server-side prefetched data for instant display
    initialData: effectiveInitialData as MessagesInfiniteData | undefined,
    initialDataUpdatedAt: effectiveInitialData ? Date.now() : undefined,
  });

  // Update otherLastReadAt from API response (first page includes this for persistence)
  const firstPageLastReadAt = query.data?.pages[0]?.otherParticipantLastReadAt;
  useEffect(() => {
    if (firstPageLastReadAt) {
      const d = new Date(firstPageLastReadAt);
      if (!isNaN(d.getTime())) {
        setOtherLastReadAt(prev => {
          // Only update if new value is more recent or we have no value
          if (!prev || d > prev) return d;
          return prev;
        });
      }
    }
  }, [firstPageLastReadAt]);

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
        
        // Skip own messages delivered via WebSocket - onSuccess handler already adds them
        // This prevents duplicates caused by race between API response and WebSocket
        if (newMsg.senderId === userId) {
          return;
        }

        queryClient.setQueryData(queryKeys.messaging.messages(conversationId), (old: { pages: MessagesPage[] } | undefined) => {
          if (!old) return old;
          const first = old.pages[0];
          if (first.messages.some(m => m.id === newMsg.id)) {
            return old;
          }
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
      await queryClient.cancelQueries({ queryKey: queryKeys.messaging.messages(conversationId) });
      const previous = queryClient.getQueryData(queryKeys.messaging.messages(conversationId));

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

      queryClient.setQueryData(queryKeys.messaging.messages(conversationId), (old: { pages: MessagesPage[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: [
            { ...old.pages[0], messages: [tempMsg, ...old.pages[0].messages] },
            ...old.pages.slice(1),
          ],
        };
      });

      // Optimistically bump conversation preview + timestamp so list reorders immediately.
      queryClient.setQueriesData({ queryKey: ['conversations'], exact: false }, (old: unknown) => {
        const data = old as {
          pages?: Array<{
            conversations: Array<{
              id: string;
              lastMessageAt?: Date | string;
              lastMessagePreview?: string | null;
              messageCount?: number;
              unreadCount?: number;
            }>;
            totalUnread?: number;
          }>;
        } | undefined;
        if (!data?.pages) return old;

        const optimisticSentAt = new Date();

        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            conversations: page.conversations
              .map((c) =>
                c.id === conversationId
                  ? {
                      ...c,
                      lastMessageAt: optimisticSentAt,
                      lastMessagePreview: text,
                      messageCount: (c.messageCount ?? 0) + 1,
                      unreadCount: 0,
                    }
                  : c
              )
              .sort(
                (a, b) =>
                  new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime()
              ),
          })),
        };
      });

      // Optimistically clear unread count for this conversation
      let unreadToRemove = 0;
      queryClient.setQueriesData({ queryKey: ['conversations'], exact: false }, (old: unknown) => {
        const data = old as { pages?: Array<{ conversations: Array<{ id: string; unreadCount?: number }>; totalUnread?: number }> } | undefined;
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

      return { previous };
    },

    onSuccess: (data, { conversationId }) => {
      // Replace temp with real
      queryClient.setQueryData(queryKeys.messaging.messages(conversationId), (old: { pages: MessagesPage[] } | undefined) => {
        if (!old) return old;
        const filtered = old.pages[0].messages.filter(m => !m.id.startsWith('temp-') && m.id !== data.message.id);
        return {
          ...old,
          pages: [{ ...old.pages[0], messages: [data.message, ...filtered] }, ...old.pages.slice(1)],
        };
      });

      // Confirm conversation preview + timestamp in paginated conversation cache.
      queryClient.setQueriesData({ queryKey: ['conversations'], exact: false }, (old: unknown) => {
        const data2 = old as {
          pages?: Array<{
            conversations: Array<{
              id: string;
              lastMessageAt?: Date | string;
              lastMessagePreview?: string | null;
              unreadCount?: number;
            }>;
            totalUnread?: number;
          }>;
        } | undefined;
        if (!data2?.pages) return old;

        return {
          ...data2,
          pages: data2.pages.map((page) => ({
            ...page,
            conversations: page.conversations
              .map((c) =>
                c.id === conversationId
                  ? {
                      ...c,
                      lastMessageAt: data.message.createdAt,
                      lastMessagePreview: data.message.text,
                      unreadCount: 0,
                    }
                  : c
              )
              .sort(
                (a, b) =>
                  new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime()
              ),
          })),
        };
      });

    },

    onError: (_err, { conversationId }, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.messaging.messages(conversationId), ctx.previous);
    },
  });

  return {
    sendMessage: mutation.mutateAsync,
    isSending: mutation.isPending,
    error: mutation.error?.message,
  };
}

// ============================================================================
// useSendLocationMessage - Location Message Send
// ============================================================================

export function useSendLocationMessage() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ conversationId, location }: { conversationId: string; senderId: string; location: LocationData }) =>
      postLocationMessage(conversationId, location),

    onMutate: async ({ conversationId, senderId, location }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.messaging.messages(conversationId) });
      const previous = queryClient.getQueryData(queryKeys.messaging.messages(conversationId));

      // Optimistic message
      const tempMsg: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId,
        text: location.address || 'Shared location',
        mediaUrl: null,
        mediaType: 'location',
        mediaThumbnail: null,
        mediaMetadata: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          placeName: location.placeName,
        },
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

      queryClient.setQueryData(queryKeys.messaging.messages(conversationId), (old: { pages: MessagesPage[] } | undefined) => {
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
      queryClient.setQueryData(queryKeys.messaging.messages(conversationId), (old: { pages: MessagesPage[] } | undefined) => {
        if (!old) return old;
        const filtered = old.pages[0].messages.filter(m => !m.id.startsWith('temp-') && m.id !== data.message.id);
        return {
          ...old,
          pages: [{ ...old.pages[0], messages: [data.message, ...filtered] }, ...old.pages.slice(1)],
        };
      });

      // Update conversation preview in cache optimistically
      queryClient.setQueriesData({ queryKey: ['conversations'], exact: false }, (old: unknown) => {
        const data2 = old as { conversations?: Array<{ id: string; lastMessageAt?: unknown; lastMessagePreview?: string }> };
        if (!data2?.conversations) return old;
        
        const exists = data2.conversations.some(c => c.id === conversationId);
        if (!exists) {
          // Conversation not in cache, return unchanged (will refetch below)
          return old;
        }
        
        return {
          ...data2,
          conversations: data2.conversations
            .map(c =>
              c.id === conversationId
                ? { ...c, lastMessageAt: data.message.createdAt, lastMessagePreview: '📍 Location' }
                : c
            )
            .sort((a, b) => new Date(b.lastMessageAt as string).getTime() - new Date(a.lastMessageAt as string).getTime()),
        };
      });

    },

    onError: (_err, { conversationId }, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.messaging.messages(conversationId), ctx.previous);
    },
  });

  return {
    sendLocationMessage: mutation.mutateAsync,
    isSending: mutation.isPending,
    error: mutation.error?.message,
  };
}
