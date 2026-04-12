/**
 * useConversations Hook
 * 
 * Manages conversations state and API interactions.
 * Real-time updates via WebSocket.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  fetchConversations,
  type Conversation,
  type Message,
} from '@/lib/messaging-api';
import { getAvatarUrl , consumeDataReady, scheduleRenderPerf } from '@/lib/config';
import { useWebSocket } from '@/context/websocket-context';
import { isConversationActive } from './active-conversations';
import {
  applyConversationMutation,
  applyMessageActivityToConversations,
  applyReadReceiptToConversations,
  readConversationListCache,
  resetWatchedUsers,
  retainWatchedUser,
  releaseWatchedUser,
  requestConversationRefresh,
  sortConversationsByLastMessage,
  shouldProcessConversationWsEvent,
  subscribeToConversationMutations,
  subscribeToConversationRefresh,
  writeConversationListCache,
} from './messaging-sync';
import {
  MESSAGING_CONVERSATIONS_PAGE_SIZE,
} from '@alifh/shared';

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

export function useConversations({
  isAuthenticated,
  userId,
  scope,
}: UseConversationsOptions): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscribe, send, isConnected } = useWebSocket();
  const abortControllerRef = useRef<AbortController | null>(null);
  const watchedUsersRef = useRef<Set<string>>(new Set());
  const loadConversationsRef = useRef<(() => Promise<void>) | null>(null);
  const lastFetchedCacheKeyRef = useRef<string | null>(null);
  const wasConnectedRef = useRef(false);
  const cacheKey = useMemo(
    () => `${scope ?? 'personal'}:${userId ?? 'anon'}`,
    [scope, userId]
  );
  
  // Keep userId in a ref for WebSocket handler
  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Persist latest conversations snapshot into shared cache.
  useEffect(() => {
    // Only write cache after a successful fetch for this exact key.
    // Prevents open-time races writing transient empty state.
    if (lastFetchedCacheKeyRef.current !== cacheKey) return;
    if (!isAuthenticated || isLoading) return;
    writeConversationListCache(cacheKey, conversations);
  }, [cacheKey, conversations, isAuthenticated, isLoading]);

  useEffect(() => {
    return subscribeToConversationMutations((updater) => {
      setConversations((prev) => updater(prev));
    });
  }, []);

  useEffect(() => {
    return subscribeToConversationRefresh(() => {
      void loadConversationsRef.current?.();
    });
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe((msg) => {
      // Handle new messages - update lastMessagePreview, lastMessageAt, and unreadCount
      if (msg.type === 'new_message' && msg.conversationId) {
        const conversationId = msg.conversationId;
        const newMsg = msg.message as Message | undefined;
        const eventKey = newMsg?.id
          ? `new_message:${newMsg.id}`
          : `new_message:${msg.conversationId}:${msg.userId ?? newMsg?.senderId ?? 'unknown'}:${newMsg?.createdAt ?? 'unknown'}`;

        if (!shouldProcessConversationWsEvent(eventKey)) {
          return;
        }

        // Check if this is the user's own message using msg.userId (broadcast wrapper)
        // or newMsg.senderId (message content)
        const senderId = msg.userId || newMsg?.senderId;
        const isOwnMessage = senderId === userIdRef.current;
        const isActiveOpenConversation = isConversationActive(conversationId);

        let found = false;
        applyConversationMutation((prev) => {
          const result = applyMessageActivityToConversations(prev, {
            conversationId,
            createdAt: newMsg?.createdAt || new Date().toISOString(),
            preview:
              (newMsg?.text?.trim() ? newMsg.text.substring(0, 100) : null) ||
              (newMsg?.mediaType ? `Sent a ${newMsg.mediaType}` : null) ||
              'New message',
            isOwnMessage,
            isActiveConversation: isActiveOpenConversation,
          });

          found = result.found;
          return result.conversations;
        });

        if (!found) {
          requestConversationRefresh();
        }

      }

      // Handle read receipts
      if (msg.type === 'read_receipt' && msg.conversationId) {
        const conversationId = msg.conversationId;
        const eventKey = `read_receipt:${msg.conversationId}:${msg.userId ?? 'unknown'}:${msg.messageId ?? 'none'}:${msg.lastReadAt ?? 'none'}`;
        if (!shouldProcessConversationWsEvent(eventKey)) {
          return;
        }

        if (msg.userId === userIdRef.current) {
          applyConversationMutation((prev) =>
            applyReadReceiptToConversations(prev, {
              conversationId,
              lastReadAt: msg.lastReadAt,
              isSelfReceipt: true,
            })
          );
          return;
        }

        applyConversationMutation((prev) =>
          applyReadReceiptToConversations(prev, {
            conversationId,
            lastReadAt: msg.lastReadAt,
            isSelfReceipt: false,
          })
        );
      }

      // Handle presence updates
      if (msg.type === 'presence' && msg.userId) {
        applyConversationMutation((prev) => {
          return prev.map((conv) => {
            if (conv.otherParticipant?.id === msg.userId) {
              return {
                ...conv,
                otherParticipant: conv.otherParticipant ? {
                  ...conv.otherParticipant,
                  isOnline: msg.isOnline,
                  lastSeenAt: msg.lastSeenAt || conv.otherParticipant.lastSeenAt,
                } : null,
              };
            }
            return conv;
          });
        });
      }
    });

    return unsubscribe;
  }, [subscribe]);

  useEffect(() => {
    if (!isConnected && wasConnectedRef.current) {
      resetWatchedUsers();
      watchedUsersRef.current.clear();
    }

    wasConnectedRef.current = isConnected;
  }, [isConnected]);

  // Watch presence for all unique other participants so the list shows live online/lastSeenAt
  useEffect(() => {
    if (!isConnected || conversations.length === 0) return;

    const currentOtherIds = new Set<string>();
    for (const c of conversations) {
      if (c.otherParticipant?.id) currentOtherIds.add(c.otherParticipant.id);
    }

    // Subscribe to new users
    for (const uid of currentOtherIds) {
      if (!watchedUsersRef.current.has(uid)) {
        retainWatchedUser(uid, send);
        watchedUsersRef.current.add(uid);
      }
    }

    // Unsubscribe from users no longer in the list
    for (const uid of watchedUsersRef.current) {
      if (!currentOtherIds.has(uid)) {
        releaseWatchedUser(uid, send);
        watchedUsersRef.current.delete(uid);
      }
    }
  }, [isConnected, conversations, send]);

  const cleanupWatchedUsers = useCallback(() => {
    const watchedUsers = Array.from(watchedUsersRef.current);
    for (const uid of watchedUsers) {
      releaseWatchedUser(uid, send);
    }
    watchedUsersRef.current.clear();
  }, [send]);

  // Cleanup all watched users on unmount
  useEffect(() => {
    return cleanupWatchedUsers;
  }, [cleanupWatchedUsers]);

  // Fetch conversations
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    // Prevent concurrent loads — abort previous if still in-flight
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 15s timeout so we never hang forever
    const timeout = setTimeout(() => controller.abort(), 15000);

    setError(null);
    
    try {
      const data = await fetchConversations({ scope, limit: MESSAGING_CONVERSATIONS_PAGE_SIZE });

      // If this call was aborted (superseded), skip state updates
      if (controller.signal.aborted) return;
      
      // Filter out conversations with no messages and convert avatar URLs
      const filteredConversations = data.conversations
        .filter(c => c.messageCount > 0)
        .map(conv => ({
          ...conv,
          otherParticipant: conv.otherParticipant ? {
            ...conv.otherParticipant,
            avatarUrl: getAvatarUrl(conv.otherParticipant.avatarUrl),
          } : null,
          listing: conv.listing ? {
            ...conv.listing,
            thumbnail: getAvatarUrl(conv.listing.thumbnail),
          } : null,
        }));
      
      setConversations((prev) => {
        const previousPresenceMap = new Map<string, { isOnline?: boolean; lastSeenAt?: string | null }>();
        prev.forEach((conv) => {
          if (conv.otherParticipant?.id) {
            previousPresenceMap.set(conv.otherParticipant.id, {
              isOnline: conv.otherParticipant.isOnline,
              lastSeenAt: conv.otherParticipant.lastSeenAt,
            });
          }
        });

        return sortConversationsByLastMessage(
          filteredConversations.map((conv) => {
            const existing = conv.otherParticipant?.id
              ? previousPresenceMap.get(conv.otherParticipant.id)
              : undefined;

            if (existing && conv.otherParticipant) {
              return {
                ...conv,
                otherParticipant: {
                  ...conv.otherParticipant,
                  isOnline: existing.isOnline ?? conv.otherParticipant.isOnline,
                  lastSeenAt: existing.lastSeenAt ?? conv.otherParticipant.lastSeenAt,
                },
              };
            }

            return conv;
          })
        );
      });
      const readyAt = consumeDataReady(`messaging:conversations:${scope ?? 'personal'}`) ?? performance.now();
      scheduleRenderPerf('messaging.conversations-list', readyAt, {
        scope: scope ?? 'personal',
        count: filteredConversations.length,
      });
      lastFetchedCacheKeyRef.current = cacheKey;
    } catch (err) {
      // Don't set error for aborted requests
      if (controller.signal.aborted) return;
      console.error('[useConversations] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      clearTimeout(timeout);
      if (!controller.signal.aborted) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [cacheKey, isAuthenticated, scope]);

  // Keep loadConversations ref up to date for WS handler
  useEffect(() => {
    loadConversationsRef.current = loadConversations;
  }, [loadConversations]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Initial load (web-like staleTime/gcTime behavior)
  useEffect(() => {
    if (isAuthenticated) {
      const cached = readConversationListCache(cacheKey);
      if (cached) {
        setConversations(cached.conversations);
        setIsLoading(false);

        if (!cached.isFresh) {
          // Stale-while-revalidate: show cache now, refresh in background.
          void loadConversations();
        }
      } else {
        loadConversations();
      }
    } else {
      setIsLoading(false);
    }
  }, [cacheKey, loadConversations, isAuthenticated]);

  // Silent background refresh — no RefreshControl spinner
  // Used by useFocusEffect when returning to the tab
  const refresh = useCallback(async () => {
    await loadConversations();
  }, [loadConversations]);

  // User-initiated pull-to-refresh — shows the RefreshControl spinner
  const pullToRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadConversations();
  }, [loadConversations]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0),
    [conversations]
  );

  return {
    conversations,
    totalUnread,
    isLoading,
    isRefreshing,
    error,
    refresh,
    pullToRefresh,
  };
}
