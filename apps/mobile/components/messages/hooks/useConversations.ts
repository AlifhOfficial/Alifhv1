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
  const { subscribe, watchUser, unwatchUser } = useWebSocket();
  const watchedUsersRef = useRef<Set<string>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  
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
            // Conversation not in list - might be a new conversation, trigger refresh
            console.log(`📬 [useConversations] Conversation not in cache, will need refresh`);
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
        setConversations(prev => prev.map(conv => {
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
        }));
      }
    });

    return unsubscribe;
  }, [subscribe]);

  // Watch presence for conversation participants (only new ones)
  useEffect(() => {
    const currentUserIds = new Set<string>();
    
    // Collect all current user IDs
    conversations.forEach(conv => {
      if (conv.otherParticipant?.id) {
        currentUserIds.add(conv.otherParticipant.id);
      }
    });

    // Watch new users
    currentUserIds.forEach(userId => {
      if (!watchedUsersRef.current.has(userId)) {
        watchUser(userId);
        watchedUsersRef.current.add(userId);
      }
    });

    // Unwatch users no longer in conversations
    watchedUsersRef.current.forEach(userId => {
      if (!currentUserIds.has(userId)) {
        unwatchUser(userId);
        watchedUsersRef.current.delete(userId);
      }
    });
  }, [conversations, watchUser, unwatchUser]);

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
      
      setConversations(filteredConversations);
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

  // Mark as read
  const markAsRead = useCallback(async (conversationId: string) => {
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
      
      // Update total unread
      setTotalUnread(prev => {
        const conv = conversations.find(c => c.id === conversationId);
        return Math.max(0, prev - (conv?.unreadCount || 0));
      });
    } catch (err) {
      console.error('[useConversations] Mark as read error:', err);
    }
  }, [conversations]);

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
