/**
 * useConversations Hook
 * 
 * Manages conversations state and API interactions.
 * Real-time updates via WebSocket.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchConversations,
  type Conversation,
  type Message,
} from '@/lib/messaging-api';
import { getAvatarUrl , consumeDataReady, scheduleRenderPerf } from '@/lib/config';
import { useWebSocket } from '@/context/websocket-context';
import { isConversationActive } from './active-conversations';
import { queryKeys } from '@/lib/query-client';

interface UseConversationsOptions {
  isAuthenticated: boolean;
  userId?: string | null;
  scope?: 'personal' | 'staff';
}

interface UseConversationsReturn {
  conversations: Conversation[];
  totalUnread: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  /** Silent background refresh (no RefreshControl spinner) */
  refresh: () => Promise<void>;
  /** User-initiated pull-to-refresh (shows RefreshControl spinner) */
  pullToRefresh: () => Promise<void>;
}

const EMPTY_CONVERSATIONS: Conversation[] = [];

export function useConversations({
  isAuthenticated,
  userId,
  scope,
}: UseConversationsOptions): UseConversationsReturn {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscribe, send, isConnected } = useWebSocket();
  const watchedUsersRef = useRef<Set<string>>(new Set());
  const missingConversationRefetchAtRef = useRef(new Map<string, number>());
  const lastManualRefreshAtRef = useRef(0);
  const presenceMapRef = useRef(new Map<string, { isOnline?: boolean; lastSeenAt?: string | null }>());
  const [presenceVersion, setPresenceVersion] = useState(0);
  const queryKey = useMemo(
    () => queryKeys.conversations(userId ?? undefined, scope ?? 'personal'),
    [userId, scope]
  );
  
  // Keep userId in a ref for WebSocket handler
  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await fetchConversations({ scope, limit: 50 });
      const conversations = data.conversations
        .filter(c => c.messageCount > 0)
        .map(conv => ({
          ...conv,
          otherParticipant: conv.otherParticipant ? {
            ...conv.otherParticipant,
            avatarUrl: getAvatarUrl(conv.otherParticipant.avatarUrl),
            // Presence is websocket-driven only; do not persist server snapshot in cache.
            isOnline: undefined,
            lastSeenAt: null,
          } : null,
          listing: conv.listing ? {
            ...conv.listing,
            thumbnail: getAvatarUrl(conv.listing.thumbnail),
          } : null,
        }))
        .sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );

      const readyAt = consumeDataReady(`messaging:conversations:${scope ?? 'personal'}`) ?? performance.now();
      scheduleRenderPerf('messaging.conversations-list', readyAt, {
        scope: scope ?? 'personal',
        count: conversations.length,
      });

      return {
        conversations,
        totalUnread: data.totalUnread,
      };
    },
    enabled: isAuthenticated && !!userId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const {
    data,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = query;

  const conversations = useMemo(
    () => data?.conversations ?? EMPTY_CONVERSATIONS,
    [data?.conversations]
  );

  // Subscribe to real-time updates
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const unsubscribe = subscribe((msg) => {
      // Handle new messages - update lastMessagePreview, lastMessageAt, and unreadCount
      if (msg.type === 'new_message' && msg.conversationId) {
        const newMsg = msg.message as Message | undefined;
        // Check if this is the user's own message using msg.userId (broadcast wrapper)
        // or newMsg.senderId (message content)
        const senderId = msg.userId || newMsg?.senderId;
        const isOwnMessage = senderId === userIdRef.current;
        const isActiveOpenConversation = isConversationActive(msg.conversationId);

        // Keep thread cache stale only for inactive conversations.
        // Active chat thread gets live updates via websocket + optimistic cache writes.
        if (!isActiveOpenConversation) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.messages(msg.conversationId),
            exact: true,
          });
        }

        let foundConversation = false;

        queryClient.setQueryData(queryKey, (old: unknown) => {
          const data = old as { conversations: Conversation[]; totalUnread: number } | undefined;
          if (!data?.conversations) return old;

          const exists = data.conversations.some(c => c.id === msg.conversationId);
          if (!exists) return old;
          foundConversation = true;

          const createdAt = newMsg?.createdAt || new Date().toISOString();

          return {
            ...data,
            conversations: data.conversations
              .map(conv => {
                if (conv.id !== msg.conversationId) return conv;
                const preview = newMsg?.text?.substring(0, 100) || conv.lastMessagePreview || 'New message';

                return {
                  ...conv,
                  lastMessageAt: createdAt,
                  lastMessagePreview: preview,
                  messageCount: isOwnMessage ? conv.messageCount || 0 : (conv.messageCount || 0) + 1,
                  unreadCount: isOwnMessage || isActiveOpenConversation ? 0 : (conv.unreadCount || 0) + 1,
                  myLastReadAt:
                    !isOwnMessage && isActiveOpenConversation
                      ? createdAt
                      : conv.myLastReadAt,
                };
              })
              .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()),
            totalUnread:
              !isOwnMessage && !isActiveOpenConversation
                ? (data.totalUnread || 0) + 1
                : data.totalUnread,
          };
        });

        if (!foundConversation) {
          const now = Date.now();
          const lastRefetchAt = missingConversationRefetchAtRef.current.get(msg.conversationId) ?? 0;
          if (now - lastRefetchAt > 1500) {
            missingConversationRefetchAtRef.current.set(msg.conversationId, now);
            queryClient.refetchQueries({ queryKey, exact: true });
          }
        }

      }

      // Handle read receipts - only update otherParticipant's lastReadAt (not self)
      if (msg.type === 'read_receipt' && msg.conversationId && msg.userId !== userIdRef.current) {
        queryClient.setQueryData(queryKey, (old: unknown) => {
          const data = old as { conversations: Conversation[]; totalUnread: number } | undefined;
          if (!data?.conversations) return old;

          return {
            ...data,
            conversations: data.conversations.map(conv => {
              if (conv.id !== msg.conversationId) return conv;
              return {
                ...conv,
                otherParticipant: conv.otherParticipant ? {
                  ...conv.otherParticipant,
                  lastReadAt: msg.lastReadAt || conv.otherParticipant.lastReadAt,
                } : null,
              };
            }),
          };
        });
      }

      // Handle presence updates
      if (msg.type === 'presence' && msg.userId) {
        presenceMapRef.current.set(msg.userId, {
          isOnline: msg.isOnline,
          lastSeenAt: msg.lastSeenAt || null,
        });
        setPresenceVersion((v) => v + 1);
      }
    });

    return unsubscribe;
  }, [subscribe, queryClient, queryKey, userId, isAuthenticated]);

  // Watch presence for all unique other participants so the list shows live online/lastSeenAt
  useEffect(() => {
    if (!isAuthenticated || !isConnected || conversations.length === 0) return;

    const currentOtherIds = new Set<string>();
    for (const c of conversations) {
      if (c.otherParticipant?.id) currentOtherIds.add(c.otherParticipant.id);
    }

    // Subscribe to new users
    for (const uid of currentOtherIds) {
      if (!watchedUsersRef.current.has(uid)) {
        send({ type: 'watch_user', targetUserId: uid });
        watchedUsersRef.current.add(uid);
      }
    }

    // Unsubscribe from users no longer in the list
    for (const uid of watchedUsersRef.current) {
      if (!currentOtherIds.has(uid)) {
        send({ type: 'unwatch_user', targetUserId: uid });
        watchedUsersRef.current.delete(uid);
      }
    }
  }, [isAuthenticated, isConnected, conversations, send]);

  const cleanupWatchedUsers = useCallback(() => {
    const watchedUsers = Array.from(watchedUsersRef.current);
    for (const uid of watchedUsers) {
      send({ type: 'unwatch_user', targetUserId: uid });
    }
    watchedUsersRef.current.clear();
  }, [send]);

  // Cleanup all watched users on unmount
  useEffect(() => {
    return cleanupWatchedUsers;
  }, [cleanupWatchedUsers]);

  // Silent background refresh — no RefreshControl spinner
  // Used by useFocusEffect when returning to the tab
  const refresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastManualRefreshAtRef.current < 15000) {
      return;
    }

    const isAlreadyFetching = queryClient.isFetching({ queryKey, exact: true }) > 0;
    if (isAlreadyFetching) {
      return;
    }

    setError(null);
    try {
      lastManualRefreshAtRef.current = now;
      await queryClient.refetchQueries({ queryKey, exact: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    }
  }, [queryClient, queryKey]);

  // User-initiated pull-to-refresh — shows the RefreshControl spinner
  const pullToRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  const conversationsWithLivePresence = useMemo(() => conversations.map((conversation) => {
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
  // presenceVersion is the signal that presenceMapRef was mutated
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [conversations, presenceVersion]);

  const totalUnread = useMemo(
    () => conversationsWithLivePresence.reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0),
    [conversationsWithLivePresence]
  );

  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Failed to load conversations');
      return;
    }
    if (!isFetching) {
      setError(null);
    }
  }, [queryError, isFetching]);

  return {
    conversations: conversationsWithLivePresence,
    totalUnread,
    isLoading: isLoading && conversations.length === 0,
    isRefreshing,
    error,
    refresh,
    pullToRefresh,
  };
}
