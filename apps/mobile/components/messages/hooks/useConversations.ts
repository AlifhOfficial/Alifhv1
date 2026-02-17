/**
 * useConversations Hook
 * 
 * Manages conversations state and API interactions.
 * Real-time updates via WebSocket.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchConversations,
  markConversationAsRead,
  type Conversation,
  type Message,
} from '@/lib/messaging-api';
import { getAvatarUrl } from '@/lib/config';
import { useWebSocket } from '@/context/websocket-context';

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
  markAsRead: (conversationId: string) => Promise<void>;
}

export function useConversations({
  isAuthenticated,
  userId,
  scope,
}: UseConversationsOptions): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscribe, send, isConnected } = useWebSocket();
  const abortControllerRef = useRef<AbortController | null>(null);
  const watchedUsersRef = useRef<Set<string>>(new Set());
  const loadingRef = useRef(false);
  const markedConversationsRef = useRef<Set<string>>(new Set());
  const loadConversationsRef = useRef<(() => Promise<void>) | null>(null);
  
  // Keep userId in a ref for WebSocket handler
  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe((msg) => {
      // Handle new messages - update lastMessagePreview, lastMessageAt, and unreadCount
      if (msg.type === 'new_message' && msg.conversationId) {
        const newMsg = msg.message as Message | undefined;
        // Check if this is the user's own message using msg.userId (broadcast wrapper)
        // or newMsg.senderId (message content)
        const senderId = msg.userId || newMsg?.senderId;
        const isOwnMessage = senderId === userIdRef.current;

        console.log(`📬 [useConversations] New message:`, {
          convId: msg.conversationId,
          senderId,
          isOwnMessage,
        });

        setConversations(prev => {
          const exists = prev.some(c => c.id === msg.conversationId);
          if (!exists) {
            // Conversation not in list — trigger a refresh to fetch it
            console.log(`📬 [useConversations] Conversation not in cache, triggering refresh`);
            loadConversationsRef.current?.();
            return prev;
          }

          return prev
            .map(conv => {
              if (conv.id !== msg.conversationId) return conv;
              return {
                ...conv,
                lastMessageAt: new Date().toISOString(),
                lastMessagePreview: newMsg?.text?.substring(0, 100) || 'New message',
                messageCount: (conv.messageCount || 0) + 1,
                // Only increment unread if NOT own message
                unreadCount: isOwnMessage ? conv.unreadCount : (conv.unreadCount || 0) + 1,
              };
            })
            // Re-sort by lastMessageAt (most recent first)
            .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        });

        // Update totalUnread only if not own message
        if (!isOwnMessage) {
          setTotalUnread(prev => prev + 1);
        }
      }

      // Handle read receipts - only update otherParticipant's lastReadAt (not self)
      if (msg.type === 'read_receipt' && msg.conversationId && msg.userId !== userIdRef.current) {
        console.log(`✓✓ [useConversations] Read receipt from other user:`, msg.userId);
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
        console.log(`🟢 [useConversations] Presence update:`, {
          userId: msg.userId,
          isOnline: msg.isOnline,
          lastSeenAt: msg.lastSeenAt,
        });
        setConversations(prev => {
          const matchingConv = prev.find(c => c.otherParticipant?.id === msg.userId);
          console.log(`🟢 [useConversations] Matching conv:`, matchingConv?.id || 'NONE');
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

    console.log(`👁️ [useConversations] Watch presence update:`, {
      isConnected,
      conversationCount: conversations.length,
      otherUserIds: Array.from(currentOtherIds),
      alreadyWatching: Array.from(watchedUsersRef.current),
    });

    // Subscribe to new users
    for (const uid of currentOtherIds) {
      if (!watchedUsersRef.current.has(uid)) {
        console.log(`👁️ [useConversations] Sending watch_user for:`, uid);
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

  // Cleanup all watched users on unmount
  useEffect(() => {
    return () => {
      for (const uid of watchedUsersRef.current) {
        send({ type: 'unwatch_user', targetUserId: uid });
      }
      watchedUsersRef.current.clear();
    };
  }, [send]);

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
      const data = await fetchConversations({ scope, limit: 50 });

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
      setTotalUnread(data.totalUnread);
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
  }, [isAuthenticated, scope]);

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

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    } else {
      setIsLoading(false);
    }
  }, [loadConversations, isAuthenticated]);

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

  // Mark as read (with deduplication — prevents duplicate API calls within 5s)
  const markAsRead = useCallback(async (conversationId: string) => {
    // Skip if already marked recently
    if (markedConversationsRef.current.has(conversationId)) return;
    markedConversationsRef.current.add(conversationId);

    try {
      await markConversationAsRead(conversationId);
      
      // Optimistically update local state
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0, myLastReadAt: new Date().toISOString() }
            : conv
        )
      );
      
      // Update total unread — read from setter callback to avoid stale closure
      setTotalUnread(prev => {
        // We don't know exact unread from this closure, but marking as read
        // means at least 1 unread was cleared. Use conversations state via setter.
        return Math.max(0, prev - 1);
      });
    } catch (err) {
      console.error('[useConversations] Mark as read error:', err);
    } finally {
      // Allow re-marking after 5 seconds
      setTimeout(() => markedConversationsRef.current.delete(conversationId), 5000);
    }
  }, []);

  return {
    conversations,
    totalUnread,
    isLoading,
    isRefreshing,
    error,
    refresh,
    pullToRefresh,
    markAsRead,
  };
}
