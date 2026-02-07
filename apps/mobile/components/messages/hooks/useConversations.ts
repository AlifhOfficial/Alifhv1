/**
 * useConversations Hook
 * 
 * Manages conversations state and API interactions.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchConversations,
  markConversationAsRead,
  type Conversation,
} from '@/lib/messaging-api';
import { getAvatarUrl } from '@/lib/config';
import { useWebSocket } from '@/context/websocket-context';

interface UseConversationsOptions {
  isAuthenticated: boolean;
  scope?: 'personal' | 'staff';
}

interface UseConversationsReturn {
  conversations: Conversation[];
  totalUnread: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
}

export function useConversations({
  isAuthenticated,
  scope,
}: UseConversationsOptions): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscribe, watchUser, unwatchUser } = useWebSocket();
  const watchedUsersRef = useRef<Set<string>>(new Set());

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe((msg) => {
      // Handle new messages - update lastMessage and unreadCount
      if (msg.type === 'new_message' && msg.conversationId) {
        setConversations(prev => prev.map(conv => {
          if (conv.id === msg.conversationId) {
            return {
              ...conv,
              lastMessage: msg.message as any,
              unreadCount: conv.unreadCount + 1,
              updatedAt: new Date().toISOString(),
            };
          }
          return conv;
        }));
      }

      // Handle read receipts - reset unread count
      if (msg.type === 'read_receipt' && msg.conversationId) {
        setConversations(prev => prev.map(conv => {
          if (conv.id === msg.conversationId) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
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

    setError(null);
    
    try {
      const data = await fetchConversations({ scope, limit: 50 });
      
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
      console.error('[useConversations] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, scope]);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Refresh handler
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadConversations();
    setIsRefreshing(false);
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
    markAsRead,
  };
}
