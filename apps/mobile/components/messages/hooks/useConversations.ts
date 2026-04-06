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
  MESSAGING_CONVERSATIONS_CACHE_STALE_TIME_MS,
  MESSAGING_CACHE_GC_TIME_MS,
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

type ConversationsCacheEntry = {
  conversations: Conversation[];
  updatedAt: number;
};

const conversationsCache = new Map<string, ConversationsCacheEntry>();

// Deduplicate repeated WS events so counts don't inflate when duplicate
// broadcasts occur in a short window.
const processedWsEvents = new Map<string, number>();
const WS_EVENT_DEDUPE_WINDOW_MS = 15_000;

function shouldProcessWsEvent(eventKey: string): boolean {
  const now = Date.now();

  for (const [key, timestamp] of processedWsEvents) {
    if (now - timestamp > WS_EVENT_DEDUPE_WINDOW_MS) {
      processedWsEvents.delete(key);
    }
  }

  if (processedWsEvents.has(eventKey)) {
    return false;
  }

  processedWsEvents.set(eventKey, now);
  return true;
}

function pruneConversationsCache() {
  const now = Date.now();
  for (const [key, entry] of conversationsCache) {
    if (now - entry.updatedAt > MESSAGING_CACHE_GC_TIME_MS) {
      conversationsCache.delete(key);
    }
  }
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
    pruneConversationsCache();
    conversationsCache.set(cacheKey, {
      conversations,
      updatedAt: Date.now(),
    });
  }, [cacheKey, conversations, isAuthenticated, isLoading]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe((msg) => {
      // Handle new messages - update lastMessagePreview, lastMessageAt, and unreadCount
      if (msg.type === 'new_message' && msg.conversationId) {
        const newMsg = msg.message as Message | undefined;
        const eventKey = newMsg?.id
          ? `new_message:${newMsg.id}`
          : `new_message:${msg.conversationId}:${msg.userId ?? newMsg?.senderId ?? 'unknown'}:${newMsg?.createdAt ?? 'unknown'}`;

        if (!shouldProcessWsEvent(eventKey)) {
          return;
        }

        // Check if this is the user's own message using msg.userId (broadcast wrapper)
        // or newMsg.senderId (message content)
        const senderId = msg.userId || newMsg?.senderId;
        const isOwnMessage = senderId === userIdRef.current;
        const isActiveOpenConversation = isConversationActive(msg.conversationId);

        setConversations(prev => {
          const exists = prev.some(c => c.id === msg.conversationId);
          if (!exists) {
            // Conversation not in list — trigger a refresh to fetch it
            loadConversationsRef.current?.();
            return prev;
          }

          const createdAt = newMsg?.createdAt || new Date().toISOString();

          return prev
            .map(conv => {
              if (conv.id !== msg.conversationId) return conv;
              const preview =
                (newMsg?.text?.trim() ? newMsg.text.substring(0, 100) : null) ||
                (newMsg?.mediaType ? `Sent a ${newMsg.mediaType}` : null) ||
                conv.lastMessagePreview ||
                'New message';

              return {
                ...conv,
                lastMessageAt: createdAt,
                lastMessagePreview: preview,
                messageCount: (conv.messageCount || 0) + 1,
                unreadCount: isOwnMessage || isActiveOpenConversation ? 0 : (conv.unreadCount || 0) + 1,
                myLastReadAt:
                  !isOwnMessage && isActiveOpenConversation
                    ? createdAt
                    : conv.myLastReadAt,
              };
            })
            // Re-sort by lastMessageAt (most recent first)
            .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        });

      }

      // Handle read receipts
      if (msg.type === 'read_receipt' && msg.conversationId) {
        const eventKey = `read_receipt:${msg.conversationId}:${msg.userId ?? 'unknown'}:${msg.messageId ?? 'none'}:${msg.lastReadAt ?? 'none'}`;
        if (!shouldProcessWsEvent(eventKey)) {
          return;
        }

        if (msg.userId === userIdRef.current) {
          setConversations(prev => prev.map(conv => {
            if (conv.id !== msg.conversationId) return conv;
            return {
              ...conv,
              unreadCount: 0,
              myLastReadAt: msg.lastReadAt || conv.myLastReadAt,
            };
          }));
          return;
        }

        setConversations(prev => prev.map(conv => {
          if (conv.id !== msg.conversationId) return conv;
          return {
            ...conv,
            otherParticipant: conv.otherParticipant ? {
              ...conv.otherParticipant,
              lastReadAt: msg.lastReadAt || conv.otherParticipant.lastReadAt,
            } : null,
          };
        }));
      }

      // Handle presence updates
      if (msg.type === 'presence' && msg.userId) {
        setConversations(prev => {
          return prev.map(conv => {
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
  }, [isConnected, conversations, send]);

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
      
      // Merge: preserve live presence data (isOnline/lastSeenAt) from WS
      setConversations(prev => {
        const presenceMap = new Map<string, { isOnline?: boolean; lastSeenAt?: string | null }>();
        prev.forEach(conv => {
          if (conv.otherParticipant?.id) {
            presenceMap.set(conv.otherParticipant.id, {
              isOnline: conv.otherParticipant.isOnline,
              lastSeenAt: conv.otherParticipant.lastSeenAt,
            });
          }
        });

        return filteredConversations.map(conv => {
          const existing = conv.otherParticipant?.id
            ? presenceMap.get(conv.otherParticipant.id)
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
        });
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
      pruneConversationsCache();
      const cached = conversationsCache.get(cacheKey);
      if (cached) {
        setConversations(cached.conversations);
        setIsLoading(false);

        const isFresh = Date.now() - cached.updatedAt < MESSAGING_CONVERSATIONS_CACHE_STALE_TIME_MS;
        if (!isFresh) {
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
