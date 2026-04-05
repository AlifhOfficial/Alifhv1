/**
 * useMessages Hook
 * 
 * Manages messages state for a specific conversation.
 * Includes real-time updates, typing indicators, and read receipts.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchMessages,
  sendMessage as sendMessageAPI,
  type Message,
  type Conversation,
} from '@/lib/messaging-api';
import { getAvatarUrl , consumeDataReady, scheduleRenderPerf } from '@/lib/config';
import { useWebSocket } from '@/context/websocket-context';
import { queryKeys } from '@/lib/query-client';

interface UseMessagesOptions {
  conversationId: string;
  userId?: string;
  otherUserId?: string | null;
  isAuthenticated: boolean;
  enabled?: boolean;
  /** Deprecated: presence is websocket-only to avoid cache flicker */
  initialLastSeenAt?: string | null;
}

interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  otherLastReadAt: string | null;
  isOtherTyping: boolean;
  isOtherOnline: boolean | null;
  otherLastSeenAt: string | null;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;
  sendTyping: (isTyping: boolean) => void;
}

export function useMessages({
  conversationId,
  userId,
  otherUserId,
  isAuthenticated,
  enabled = true,
  initialLastSeenAt,
}: UseMessagesOptions): UseMessagesReturn {
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const [otherLastReadAt, setOtherLastReadAt] = useState<string | null>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState<boolean | null>(null);
  const [otherLastSeenAt, setOtherLastSeenAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { subscribe, send, isConnected } = useWebSocket();
  
  const conversationIdRef = useRef(conversationId);
  const userIdRef = useRef(userId);
  const otherUserIdRef = useRef(otherUserId);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(0);
  const watchingRef = useRef(false);
  // Initialize with current socket state to avoid mount-time double fetches.
  const wasConnectedRef = useRef(isConnected);
  const lastReconnectRefetchAtRef = useRef(0);
  const missingConversationRefetchAtRef = useRef(new Map<string, number>());
  
  // Track pending sends: tempId -> true (waiting for API) or realId (WS arrived first)
  // This prevents race conditions when WS and API responses arrive out of order
  const pendingSendsRef = useRef<Map<string, true | string>>(new Map());
  // Counter for unique temp IDs (combined with timestamp + random)
  const tempIdCounterRef = useRef(0);

  // Update refs when params change
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);
  useEffect(() => {
    otherUserIdRef.current = otherUserId;
  }, [otherUserId]);
  void initialLastSeenAt;

  const messagesQueryKey = useMemo(
    () => queryKeys.messages(conversationId),
    [conversationId]
  );

  type MessagesPage = {
    messages: Message[];
    hasMore: boolean;
    nextCursor: string | null;
    otherParticipantLastReadAt?: string | null;
  };

  const query = useInfiniteQuery({
    queryKey: messagesQueryKey,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const data = await fetchMessages(conversationId, {
        limit: 50,
        cursor: pageParam,
      });

      const messagesWithUrls = data.messages.map(msg => ({
        ...msg,
        sender: {
          ...msg.sender,
          avatarUrl: getAvatarUrl(msg.sender.avatarUrl),
        },
      }));

      return {
        ...data,
        messages: messagesWithUrls,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined),
    initialPageParam: undefined as string | undefined,
    enabled: !!conversationId && !!userId && isAuthenticated && enabled,
    refetchOnWindowFocus: false,
    // Refetch on mount only when stale (e.g. invalidated by WS while thread is closed).
    refetchOnMount: true,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const {
    data,
    error: queryError,
    isFetching,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = query;

  // Throttled reconnect refetch for the active thread.
  useEffect(() => {
    if (!conversationId || !userId || !isAuthenticated || !enabled) {
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
  }, [conversationId, userId, isAuthenticated, enabled, isConnected, refetch]);

  const dedupeMessages = useCallback((items: Message[]): Message[] => {
    const seen = new Set<string>();
    return items.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, []);

  const messages = useMemo(() => {
    const flat = data?.pages.flatMap((p) => p.messages) ?? [];
    return dedupeMessages(flat);
  }, [data?.pages, dedupeMessages]);

  // Reset per-conversation transient state and trackers
  useEffect(() => {
    setError(null);
    setOtherLastReadAt(null);
    setIsOtherTyping(false);
    setIsOtherOnline(null);
    setOtherLastSeenAt(null);
    watchingRef.current = false;
    conversationIdRef.current = conversationId;
    pendingSendsRef.current.clear();
  }, [conversationId]);

  // Watch presence for other user (matches web's useMessages)
  // Declared AFTER reset so on conversation switch: reset clears → watch re-subscribes.
  useEffect(() => {
    if (!otherUserId || !isConnected || watchingRef.current) return;
    watchingRef.current = true;
    send({ type: 'watch_user', targetUserId: otherUserId });
    return () => {
      if (watchingRef.current && otherUserId) {
        send({ type: 'unwatch_user', targetUserId: otherUserId });
        watchingRef.current = false;
      }
    };
  }, [isConnected, otherUserId, send]);

  // Keep other participant last-read time in sync from first page response
  useEffect(() => {
    const first = data?.pages[0]?.otherParticipantLastReadAt;
    if (!first) return;

    setOtherLastReadAt((prev) => {
      if (!prev) return first;
      return new Date(first) > new Date(prev) ? first : prev;
    });
  }, [data?.pages]);

  // Subscribe to real-time messages
  useEffect(() => {
    const unsubscribe = subscribe((msg) => {
      // Handle new messages — deduplicate by ID (allows multi-device sync)
      if (msg.type === 'new_message' && msg.conversationId === conversationIdRef.current && msg.message) {
        const newMessage = msg.message as Message;

        // Check if message already exists (avoid duplicates)
        queryClient.setQueryData(messagesQueryKey, (old: unknown) => {
          const data = old as { pages: MessagesPage[]; pageParams: (string | undefined)[] } | undefined;
          if (!data?.pages?.length) return old;

          const firstPage = data.pages[0];
          const prev = firstPage.messages;
          if (prev.some(m => m.id === newMessage.id)) {
            return old;
          }

          const messageWithAvatar = {
            ...newMessage,
            sender: {
              ...newMessage.sender,
              avatarUrl: getAvatarUrl(newMessage.sender.avatarUrl),
            },
          };

          // If this is our own message echoed back via WS, find the matching
          // pending temp message using FIFO order (oldest pending = first sent)
          if (newMessage.senderId === userIdRef.current) {
            // Find pending temp IDs in FIFO order (oldest first)
            const pendingTempIds = Array.from(pendingSendsRef.current.entries())
              .filter(([_, v]) => v === true)
              .map(([k]) => k)
              .sort(); // temp IDs have counter prefix, so sorting gives FIFO order
            
            if (pendingTempIds.length > 0) {
              const oldestTempId = pendingTempIds[0];
              // Mark this temp as resolved with the real ID
              pendingSendsRef.current.set(oldestTempId, newMessage.id);
              
              // Replace the temp message with real one
              const updated = prev.map(m => 
                m.id === oldestTempId ? messageWithAvatar : m
              );
              return {
                ...data,
                pages: [
                  { ...firstPage, messages: dedupeMessages(updated) },
                  ...data.pages.slice(1),
                ],
              };
            }
          }

          // Message from other user or no pending temp found - just add it
          return {
            ...data,
            pages: [
              { ...firstPage, messages: dedupeMessages([messageWithAvatar, ...prev]) },
              ...data.pages.slice(1),
            ],
          };
        });

        // Keep conversations cache in sync for list ordering/preview.
        let foundConversation = false;
        queryClient.setQueriesData({ queryKey: ['conversations'], exact: false }, (old: unknown) => {
          const data = old as { conversations?: Conversation[]; totalUnread?: number } | undefined;
          if (!data?.conversations) return old;

          const exists = data.conversations.some((c) => c.id === newMessage.conversationId);
          if (!exists) return old;
          foundConversation = true;

          const isOwnMessage = newMessage.senderId === userIdRef.current;
          const preview = newMessage.text?.substring(0, 100) || 'New message';

          return {
            ...data,
            conversations: data.conversations
              .map((c) =>
                c.id !== newMessage.conversationId
                  ? c
                  : {
                      ...c,
                      lastMessageAt: newMessage.createdAt,
                      lastMessagePreview: preview,
                      messageCount: Math.max((c.messageCount || 0) + (isOwnMessage ? 0 : 1), c.messageCount || 0),
                      unreadCount: isOwnMessage ? 0 : (c.unreadCount || 0) + 1,
                    }
              )
              .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),
            totalUnread: isOwnMessage ? data.totalUnread : (data.totalUnread || 0) + 1,
          };
        });

        if (!foundConversation) {
          const now = Date.now();
          const lastRefetchAt = missingConversationRefetchAtRef.current.get(newMessage.conversationId) ?? 0;
          if (now - lastRefetchAt > 1500) {
            missingConversationRefetchAtRef.current.set(newMessage.conversationId, now);
            // Mark stale only; avoid immediate full conversations GET while in thread.
            queryClient.invalidateQueries({ queryKey: ['conversations'], refetchType: 'none' });
          }
        }
      }

      // Handle typing indicator — only from OTHER user
      if (
        msg.type === 'typing' &&
        msg.conversationId === conversationIdRef.current &&
        msg.userId !== userIdRef.current
      ) {
        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }

        setIsOtherTyping(!!msg.isTyping);

        // Auto-clear typing indicator after 4 seconds
        if (msg.isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsOtherTyping(false);
          }, 4000);
        }
      }

      // Handle read receipts — only from the OTHER user (not self)
      if (
        msg.type === 'read_receipt' &&
        msg.conversationId === conversationIdRef.current &&
        msg.lastReadAt &&
        msg.userId !== userIdRef.current
      ) {
        const nextLastReadAt = msg.lastReadAt;
        setOtherLastReadAt((prev) => {
          if (!prev) return nextLastReadAt;
          return new Date(nextLastReadAt) > new Date(prev) ? nextLastReadAt : prev;
        });
      }

      // Handle presence updates for the other user
      if (
        msg.type === 'presence' &&
        otherUserIdRef.current &&
        msg.userId === otherUserIdRef.current
      ) {
        setIsOtherOnline(!!msg.isOnline);
        // Only update lastSeenAt if provided in the event (matches web behavior)
        // This preserves the conversation snapshot fallback when WS doesn't include it
        if (msg.lastSeenAt) {
          setOtherLastSeenAt(msg.lastSeenAt);
        }
      }

      // FALLBACK: If we receive typing/message from the other user, they're definitely online
      // This helps when presence state is lost (e.g., Railway multiple replicas)
      if (
        (msg.type === 'typing' || msg.type === 'new_message') &&
        msg.userId === otherUserIdRef.current
      ) {
        setIsOtherOnline(true);
        setOtherLastSeenAt(new Date().toISOString());
      }
    });

    return () => {
      unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [dedupeMessages, subscribe, queryClient, messagesQueryKey]);

  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Failed to load messages');
      return;
    }
    if (!isFetching) {
      setError(null);
    }
  }, [queryError, isFetching]);

  useEffect(() => {
    if (!data?.pages?.length) return;
    const firstCount = data.pages[0]?.messages?.length ?? 0;
    const readyAt = consumeDataReady(`messaging:messages:${conversationId}`) ?? performance.now();
    scheduleRenderPerf('messaging.messages-thread', readyAt, {
      conversationId,
      count: firstCount,
    });
  }, [conversationId, data?.pages]);

  // Refresh handler
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Fetch more (pagination)
  const fetchMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    await fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setIsSending(true);
      setError(null);

      // Generate unique temp ID with counter prefix for FIFO ordering
      // Format: temp-{counter}-{timestamp}-{random} ensures uniqueness and sortability
      const counter = ++tempIdCounterRef.current;
      const tempId = `temp-${String(counter).padStart(6, '0')}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      
      // Register this send as pending (true = awaiting resolution)
      pendingSendsRef.current.set(tempId, true);

      // Optimistic message
      const currentUserId = userIdRef.current || 'temp';
      const optimisticMessage: Message = {
        id: tempId,
        conversationId,
        senderId: currentUserId,
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
        sender: { id: currentUserId, name: 'You', avatarUrl: null },
      };

      // Add optimistic message to first page
      queryClient.setQueryData(messagesQueryKey, (old: unknown) => {
        const data = old as { pages: MessagesPage[]; pageParams: (string | undefined)[] } | undefined;
        if (!data?.pages?.length) {
          return {
            pages: [{ messages: [optimisticMessage], hasMore: false, nextCursor: null }],
            pageParams: [undefined],
          };
        }

        return {
          ...data,
          pages: [
            {
              ...data.pages[0],
              messages: dedupeMessages([optimisticMessage, ...data.pages[0].messages]),
            },
            ...data.pages.slice(1),
          ],
        };
      });

      queryClient.setQueriesData({ queryKey: ['conversations'], exact: false }, (old: unknown) => {
        const data = old as { conversations?: Conversation[]; totalUnread?: number } | undefined;
        if (!data?.conversations) return old;

        const optimisticSentAt = new Date().toISOString();

        return {
          ...data,
          conversations: data.conversations
            .map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    lastMessageAt: optimisticSentAt,
                    lastMessagePreview: text.trim(),
                    messageCount: (c.messageCount ?? 0) + 1,
                    unreadCount: 0,
                  }
                : c
            )
            .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),
        };
      });

      try {
        const response = await sendMessageAPI(conversationId, { text: text.trim() });
        
        // Check if WS already resolved this temp message
        const pendingValue = pendingSendsRef.current.get(tempId);
        
        // Replace optimistic message with real one
        queryClient.setQueryData(messagesQueryKey, (old: unknown) => {
          const data = old as { pages: MessagesPage[]; pageParams: (string | undefined)[] } | undefined;
          if (!data?.pages?.length) return old;
          const prev = data.pages[0].messages;

          // If WS already replaced temp (pendingValue is the real ID), just dedupe
          if (typeof pendingValue === 'string') {
            // WS handled it - the real message should already be in state
            // Just ensure no duplicates
            return {
              ...data,
              pages: [
                { ...data.pages[0], messages: dedupeMessages(prev) },
                ...data.pages.slice(1),
              ],
            };
          }
          
          // API arrived first - replace temp with real message
          const hasTemp = prev.some(m => m.id === tempId);
          if (!hasTemp) {
            // Temp was somehow removed, add real message if not exists
            if (prev.some(m => m.id === response.message.id)) {
              return old;
            }
            return {
              ...data,
              pages: [
                { ...data.pages[0], messages: dedupeMessages([response.message, ...prev]) },
                ...data.pages.slice(1),
              ],
            };
          }
          
          return {
            ...data,
            pages: [
              {
                ...data.pages[0],
                messages: dedupeMessages(prev.map(msg => (msg.id === tempId ? response.message : msg))),
              },
              ...data.pages.slice(1),
            ],
          };
        });

        queryClient.setQueriesData({ queryKey: ['conversations'], exact: false }, (old: unknown) => {
          const data = old as { conversations?: Conversation[]; totalUnread?: number } | undefined;
          if (!data?.conversations) return old;

          return {
            ...data,
            conversations: data.conversations
              .map((c) =>
                c.id === conversationId
                  ? {
                      ...c,
                      lastMessageAt: response.message.createdAt,
                      lastMessagePreview: response.message.text,
                      unreadCount: 0,
                    }
                  : c
              )
              .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),
          };
        });
        
        // Clean up tracking
        pendingSendsRef.current.delete(tempId);
      } catch (err) {
        console.error('[useMessages] Send error:', err);
        setError(err instanceof Error ? err.message : 'Failed to send message');
        
        // Remove optimistic message and tracking on error
        pendingSendsRef.current.delete(tempId);
        queryClient.setQueryData(messagesQueryKey, (old: unknown) => {
          const data = old as { pages: MessagesPage[]; pageParams: (string | undefined)[] } | undefined;
          if (!data?.pages?.length) return old;

          return {
            ...data,
            pages: [
              {
                ...data.pages[0],
                messages: data.pages[0].messages.filter(msg => msg.id !== tempId),
              },
              ...data.pages.slice(1),
            ],
          };
        });
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, dedupeMessages, messagesQueryKey, queryClient]
  );

  // Throttled typing indicator sender
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      const targetUserId = otherUserIdRef.current;
      if (!targetUserId) return;

      const now = Date.now();
      // Throttle: only send typing=true every 1 second
      if (isTyping && now - lastTypingSentRef.current < 1000) return;
      lastTypingSentRef.current = now;

      send({ type: 'typing', conversationId, targetUserId, isTyping });
    },
    [conversationId, send]
  );

  return {
    messages,
    isLoading: messages.length === 0 && (isLoading || isFetching),
    isSending,
    isFetchingMore: isFetchingNextPage,
    hasMore: hasNextPage ?? false,
    otherLastReadAt,
    isOtherTyping,
    isOtherOnline,
    otherLastSeenAt,
    error,
    sendMessage,
    fetchMore,
    refresh,
    sendTyping,
  };
}
