/**
 * useMessages Hook
 * 
 * Manages messages state for a specific conversation.
 * Includes real-time updates, typing indicators, and read receipts.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchMessages,
  sendMessage as sendMessageAPI,
  type Message,
} from '@/lib/messaging-api';
import { getAvatarUrl } from '@/lib/config';
import { useWebSocket } from '@/context/websocket-context';

interface UseMessagesOptions {
  conversationId: string;
  userId?: string;
  otherUserId?: string | null;
  isAuthenticated: boolean;
  enabled?: boolean;
}

interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  otherLastReadAt: string | null;
  isOtherTyping: boolean;
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
}: UseMessagesOptions): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [otherLastReadAt, setOtherLastReadAt] = useState<string | null>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const { subscribe, sendTyping: wsSendTyping } = useWebSocket();
  
  const isInitialLoad = useRef(true);
  const conversationIdRef = useRef(conversationId);
  const userIdRef = useRef(userId);
  const otherUserIdRef = useRef(otherUserId);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(0);


  // Update refs when params change
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);
  useEffect(() => {
    otherUserIdRef.current = otherUserId;
  }, [otherUserId]);

  // Subscribe to real-time messages
  useEffect(() => {
    const unsubscribe = subscribe((msg) => {
      // Handle new messages — skip own messages (already handled via optimistic update + API response)
      if (msg.type === 'new_message' && msg.conversationId === conversationIdRef.current && msg.message) {
        const newMessage = msg.message as Message;
        
        // Skip own messages — they are already in the list from sendMessage
        if (newMessage.senderId === userIdRef.current) return;

        setMessages(prev => {
          // Check if message already exists (avoid duplicates)
          if (prev.some(m => m.id === newMessage.id)) {
            return prev;
          }
          const messageWithAvatar = {
            ...newMessage,
            sender: {
              ...newMessage.sender,
              avatarUrl: getAvatarUrl(newMessage.sender.avatarUrl),
            },
          };
          return [messageWithAvatar, ...prev];
        });
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
        setOtherLastReadAt(msg.lastReadAt);
      }
    });

    return () => {
      unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [subscribe]);

  // Fetch messages
  const loadMessages = useCallback(
    async (cursor?: string) => {
      if (!isAuthenticated || !enabled) {
        setIsLoading(false);
        return;
      }

      setError(null);
      
      try {
        const data = await fetchMessages(conversationId, {
          limit: 50,
          cursor,
        });
        
        // Convert avatar URLs in messages
        const messagesWithUrls = data.messages.map(msg => ({
          ...msg,
          sender: {
            ...msg.sender,
            avatarUrl: getAvatarUrl(msg.sender.avatarUrl),
          },
        }));
        
        if (cursor) {
          // Appending older messages
          setMessages(prev => [...prev, ...messagesWithUrls]);
        } else {
          // Initial load or refresh
          setMessages(messagesWithUrls);
          
          // Set other participant's last read time (only on first page)
          if (data.otherParticipantLastReadAt) {
            setOtherLastReadAt(data.otherParticipantLastReadAt);
          }
        }
        
        setHasMore(data.hasMore);
        setNextCursor(data.nextCursor);
      } catch (err) {
        console.error('[useMessages] Load error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [conversationId, isAuthenticated, enabled]
  );

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadMessages();
    }
  }, [loadMessages]);

  // Refresh handler
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadMessages();
  }, [loadMessages]);

  // Fetch more (pagination)
  const fetchMore = useCallback(async () => {
    if (!hasMore || isFetchingMore || !nextCursor) return;
    
    setIsFetchingMore(true);
    await loadMessages(nextCursor);
  }, [hasMore, isFetchingMore, nextCursor, loadMessages]);

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setIsSending(true);
      setError(null);

      // Optimistic message
      const currentUserId = userIdRef.current || 'temp';
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
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

      // Add optimistic message to list
      setMessages(prev => [optimisticMessage, ...prev]);

      try {
        const response = await sendMessageAPI(conversationId, { text: text.trim() });
        
        // Replace optimistic message with real one
        setMessages(prev =>
          prev.map(msg => (msg.id === optimisticMessage.id ? response.message : msg))
        );
      } catch (err) {
        console.error('[useMessages] Send error:', err);
        setError(err instanceof Error ? err.message : 'Failed to send message');
        
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      } finally {
        setIsSending(false);
      }
    },
    [conversationId]
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

      wsSendTyping(conversationId, targetUserId, isTyping);
    },
    [conversationId, wsSendTyping]
  );

  return {
    messages,
    isLoading,
    isSending,
    isFetchingMore,
    hasMore,
    otherLastReadAt,
    isOtherTyping,
    error,
    sendMessage,
    fetchMore,
    refresh,
    sendTyping,
  };
}
