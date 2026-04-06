/**
 * Messages Hook - Lean Implementation
 * Infinite scroll + real-time updates + optimistic send
 */

'use client';

import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useWebSocket } from './use-websocket';
import { useCallback, useEffect, useRef, useState } from 'react';
import { queryKeys } from '@/lib/query-keys';
import {
  MESSAGING_CACHE_STALE_TIME_MS,
  MESSAGING_CACHE_GC_TIME_MS,
  MESSAGING_MESSAGES_PAGE_SIZE,
} from '@alifh/shared';

// Module-level counter for unique temp IDs — FIFO ordering across concurrent sends
let tempIdCounter = 0;

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

interface ConversationsCacheConversation {
  id: string;
  lastMessageAt: Date | string;
  lastMessagePreview: string | null;
  messageCount: number;
  unreadCount: number;
  myLastReadAt?: Date | string | null;
}

interface ConversationsCachePage {
  conversations: ConversationsCacheConversation[];
  totalUnread: number;
  hasMore: boolean;
}

interface ConversationsCacheData {
  pages: ConversationsCachePage[];
  pageParams: unknown[];
}

function bumpConversationInCache(
  current: ConversationsCacheData,
  conversationId: string,
  preview: string,
  createdAt: string
): ConversationsCacheData {
  const allConversations = current.pages.flatMap((page) => page.conversations);
  let found = false;

  const updated = allConversations.map((conversation) => {
    if (conversation.id !== conversationId) return conversation;
    found = true;
    return {
      ...conversation,
      lastMessageAt: createdAt,
      lastMessagePreview: preview,
    };
  });

  if (!found) return current;

  const sorted = updated.sort(
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
}

// ============================================================================
// API
// ============================================================================

async function fetchMessages(
  conversationId: string,
  cursor?: string,
  signal?: AbortSignal
): Promise<MessagesPage> {
  const params = new URLSearchParams({
    limit: String(MESSAGING_MESSAGES_PAGE_SIZE),
  });
  if (cursor) {
    params.set('cursor', cursor);
  }

  const res = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages?${params.toString()}`,
    {
      credentials: 'include',
      cache: 'no-store',
      signal,
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch messages');
  }

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
  const [otherLastReadMessageId, setOtherLastReadMessageId] = useState<string | null>(null);
  const [otherLastSeenAt, setOtherLastSeenAt] = useState<Date | null>(() => {
    const v = options.initialLastSeenAt;
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    return isNaN(d.getTime()) ? null : d;
  });

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const watchingRef = useRef(false);

  useEffect(() => {
    setOtherLastReadMessageId(null);
  }, [conversationId]);

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

  const messagesQueryKey = queryKeys.messaging.messages(conversationId);

  // Query
  const query = useInfiniteQuery({
    queryKey: messagesQueryKey,
    queryFn: ({ pageParam, signal }) => fetchMessages(conversationId, pageParam, signal),
    getNextPageParam: (page) => (page.hasMore ? page.nextCursor ?? undefined : undefined),
    initialPageParam: undefined as string | undefined,
    enabled: !!conversationId && !!userId,
    // WS drives live updates — only refetch when data is older than 30s.
    // This prevents redundant fetches while keeping a safety-net refetch on
    // tab focus / reconnect for the case where WS missed events.
    staleTime: MESSAGING_CACHE_STALE_TIME_MS,
    gcTime: MESSAGING_CACHE_GC_TIME_MS,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
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
      // New message — append to cache directly when payload is usable.
      // If payload is partial/missing, immediately refetch this active thread.
      if (msg.type === 'new_message' && msg.conversationId === conversationId) {
        const payload = msg.message as Partial<Message> | undefined;
        const hasUsablePayload =
          !!payload &&
          typeof payload.id === 'string' &&
          typeof payload.senderId === 'string' &&
          !!payload.createdAt;

        if (!hasUsablePayload) {
          // Some WS paths only provide conversation-level fields.
          // Keep the open thread fresh instead of silently dropping the event.
          queryClient.invalidateQueries({
            queryKey: queryKeys.messaging.messages(conversationId),
            refetchType: 'active',
          });
        } else {
          const newMsg = payload as Message;
          let updated = false;

          queryClient.setQueryData<InfiniteData<MessagesPage>>(
            queryKeys.messaging.messages(conversationId),
            (current) => {
              if (!current) return current;

              const allMessages = current.pages.flatMap((p) => p.messages);

              if (newMsg.senderId === userId) {
                // Own message echo — resolve the oldest pending temp (FIFO)
                // temp IDs are prefixed `temp-{counter}-...` so sort gives FIFO order
                if (allMessages.some((m) => m.id === newMsg.id)) {
                  updated = true;
                  return current; // already resolved by API
                }

                const tempIds = allMessages
                  .map((m) => m.id)
                  .filter((id) => id.startsWith('temp-'))
                  .sort();

                if (tempIds.length === 0) {
                  // No temp found (late echo) — prepend real message
                  const [first, ...rest] = current.pages;
                  updated = true;
                  return { ...current, pages: [{ ...first, messages: [newMsg, ...first.messages] }, ...rest] };
                }

                const oldestTempId = tempIds[0];
                updated = true;
                return {
                  ...current,
                  pages: current.pages.map((page) => ({
                    ...page,
                    messages: page.messages.map((m) => (m.id === oldestTempId ? newMsg : m)),
                  })),
                };
              }

              // Message from other user — dedup then prepend
              if (allMessages.some((m) => m.id === newMsg.id)) {
                updated = true;
                return current;
              }
              const [first, ...rest] = current.pages;
              updated = true;
              return { ...current, pages: [{ ...first, messages: [newMsg, ...first.messages] }, ...rest] };
            }
          );

          if (!updated) {
            // Cache not ready yet (e.g., first mount race) — force active fetch.
            queryClient.invalidateQueries({
              queryKey: queryKeys.messaging.messages(conversationId),
              refetchType: 'active',
            });
          }
        }
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
        if (typeof msg.messageId === 'string') {
          setOtherLastReadMessageId(msg.messageId);
        }
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

      // FALLBACK: If we receive typing/message from the other user, they're definitely online
      // This helps when presence state is lost (e.g., Railway multiple replicas)
      if (
        (msg.type === 'typing' || msg.type === 'new_message') &&
        options.otherUserId &&
        msg.userId === options.otherUserId
      ) {
        setIsOtherOnline(true);
        setOtherLastSeenAt(new Date());
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
    otherLastReadMessageId,
    otherLastSeenAt,
    sendTyping,
  };
}

// ============================================================================
// useSendMessage - Optimistic Send
// ============================================================================

export function useSendMessage() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    { message: Message },
    Error,
    { conversationId: string; senderId: string; text: string },
    { tempId: string }
  >({
    mutationFn: ({ conversationId, text }) => postMessage(conversationId, text),

    // Step 1: Optimistically insert a temp message — mirrors mobile pendingSendsRef pattern
    onMutate: ({ conversationId, senderId, text }) => {
      // Do not block optimistic UI on cancel timing — cancel in background.
      void queryClient.cancelQueries({ queryKey: queryKeys.messaging.messages(conversationId) });

      const counter = ++tempIdCounter;
      const tempId = `temp-${String(counter).padStart(6, '0')}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const optimisticMessage: Message = {
        id: tempId,
        conversationId,
        senderId,
        text: text.trim(),
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
        createdAt: new Date().toISOString(),
        sender: { id: senderId, name: null, avatarUrl: null },
      };

      queryClient.setQueryData<InfiniteData<MessagesPage>>(
        queryKeys.messaging.messages(conversationId),
        (current) => {
          if (!current) return current;
          const [first, ...rest] = current.pages;
          return { ...current, pages: [{ ...first, messages: [optimisticMessage, ...first.messages] }, ...rest] };
        }
      );

      const nowIso = String(optimisticMessage.createdAt);
      const preview = optimisticMessage.text ?? 'New message';
      const hasThreadCache = !!queryClient.getQueryData(queryKeys.messaging.messages(conversationId));
      if (hasThreadCache) {
        queryClient.setQueriesData<ConversationsCacheData>(
          { queryKey: ['conversations'] },
          (current) => {
            if (!current) return current;
            return bumpConversationInCache(current, conversationId, preview, nowIso);
          }
        );
      }

      return { tempId };
    },

    // Step 2: Replace temp with confirmed real message (if WS echo hasn't done it already)
    onSuccess: (data, { conversationId }, context) => {
      const realMessage = data.message;
      const tempId = context?.tempId;

      queryClient.setQueryData<InfiniteData<MessagesPage>>(
        queryKeys.messaging.messages(conversationId),
        (current) => {
          if (!current) return current;

          const allMessages = current.pages.flatMap((p) => p.messages);

          // WS echo already swapped the temp for a real ID — just dedup
          if (allMessages.some((m) => m.id === realMessage.id)) {
            if (!tempId || !allMessages.some((m) => m.id === tempId)) return current;
            return {
              ...current,
              pages: current.pages.map((page) => ({
                ...page,
                messages: page.messages.filter((m) => m.id !== tempId),
              })),
            };
          }

          // API won the race — replace temp with real message
          if (tempId && allMessages.some((m) => m.id === tempId)) {
            return {
              ...current,
              pages: current.pages.map((page) => ({
                ...page,
                messages: page.messages.map((m) => (m.id === tempId ? realMessage : m)),
              })),
            };
          }

          // Fallback: just prepend (should not normally reach here)
          const [first, ...rest] = current.pages;
          return { ...current, pages: [{ ...first, messages: [realMessage, ...first.messages] }, ...rest] };
        }
      );
    },

    // Step 3: Roll back the temp message on error
    onError: (_err, { conversationId }, context) => {
      const tempId = context?.tempId;
      if (!tempId) return;

      queryClient.setQueryData<InfiniteData<MessagesPage>>(
        queryKeys.messaging.messages(conversationId),
        (current) => {
          if (!current) return current;
          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              messages: page.messages.filter((m) => m.id !== tempId),
            })),
          };
        }
      );
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

  const mutation = useMutation<
    { message: Message },
    Error,
    { conversationId: string; senderId: string; location: LocationData },
    { tempId: string }
  >({
    mutationFn: ({ conversationId, location }) => postLocationMessage(conversationId, location),

    onMutate: ({ conversationId, senderId, location }) => {
      void queryClient.cancelQueries({ queryKey: queryKeys.messaging.messages(conversationId) });

      const counter = ++tempIdCounter;
      const tempId = `temp-${String(counter).padStart(6, '0')}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const optimisticMessage: Message = {
        id: tempId,
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
        createdAt: new Date().toISOString(),
        sender: { id: senderId, name: null, avatarUrl: null },
      };

      queryClient.setQueryData<InfiniteData<MessagesPage>>(
        queryKeys.messaging.messages(conversationId),
        (current) => {
          if (!current) return current;
          const [first, ...rest] = current.pages;
          return { ...current, pages: [{ ...first, messages: [optimisticMessage, ...first.messages] }, ...rest] };
        }
      );

      const nowIso = String(optimisticMessage.createdAt);
      const preview = optimisticMessage.text ?? 'Shared location';
      const hasThreadCache = !!queryClient.getQueryData(queryKeys.messaging.messages(conversationId));
      if (hasThreadCache) {
        queryClient.setQueriesData<ConversationsCacheData>(
          { queryKey: ['conversations'] },
          (current) => {
            if (!current) return current;
            return bumpConversationInCache(current, conversationId, preview, nowIso);
          }
        );
      }

      return { tempId };
    },

    onSuccess: (data, { conversationId }, context) => {
      const realMessage = data.message;
      const tempId = context?.tempId;

      queryClient.setQueryData<InfiniteData<MessagesPage>>(
        queryKeys.messaging.messages(conversationId),
        (current) => {
          if (!current) return current;

          const allMessages = current.pages.flatMap((p) => p.messages);

          if (allMessages.some((m) => m.id === realMessage.id)) {
            if (!tempId || !allMessages.some((m) => m.id === tempId)) return current;
            return {
              ...current,
              pages: current.pages.map((page) => ({
                ...page,
                messages: page.messages.filter((m) => m.id !== tempId),
              })),
            };
          }

          if (tempId && allMessages.some((m) => m.id === tempId)) {
            return {
              ...current,
              pages: current.pages.map((page) => ({
                ...page,
                messages: page.messages.map((m) => (m.id === tempId ? realMessage : m)),
              })),
            };
          }

          const [first, ...rest] = current.pages;
          return { ...current, pages: [{ ...first, messages: [realMessage, ...first.messages] }, ...rest] };
        }
      );
    },

    onError: (_err, { conversationId }, context) => {
      const tempId = context?.tempId;
      if (!tempId) return;

      queryClient.setQueryData<InfiniteData<MessagesPage>>(
        queryKeys.messaging.messages(conversationId),
        (current) => {
          if (!current) return current;
          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              messages: page.messages.filter((m) => m.id !== tempId),
            })),
          };
        }
      );
    },
  });

  return {
    sendLocationMessage: mutation.mutateAsync,
    isSending: mutation.isPending,
    error: mutation.error?.message,
  };
}
