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
import { getAvatarUrl , consumeDataReady, scheduleRenderPerf } from '@/lib/config';
import { useWebSocket } from '@/context/websocket-context';

interface UseMessagesOptions {
  conversationId: string;
  userId?: string;
  otherUserId?: string | null;
  isAuthenticated: boolean;
  enabled?: boolean;
  /** Initial lastSeenAt from conversation snapshot (DB) - used before WS responds */
  initialLastSeenAt?: string | null;
}

interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  otherLastReadAt: string | null;
  otherLastReadMessageId: string | null;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [otherLastReadAt, setOtherLastReadAt] = useState<string | null>(null);
  const [otherLastReadMessageId, setOtherLastReadMessageId] = useState<string | null>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState<boolean | null>(null);
  // Initialize from DB snapshot, WS updates override it
  const [otherLastSeenAt, setOtherLastSeenAt] = useState<string | null>(initialLastSeenAt ?? null);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const { subscribe, send, isConnected } = useWebSocket();
  
  const conversationIdRef = useRef(conversationId);
  const userIdRef = useRef(userId);
  const otherUserIdRef = useRef(otherUserId);
  const initialLastSeenAtRef = useRef<string | null>(initialLastSeenAt ?? null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(0);
  const watchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
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
  useEffect(() => {
    initialLastSeenAtRef.current = initialLastSeenAt ?? null;
  }, [initialLastSeenAt]);

  // Update lastSeenAt when initial value changes (conversation refresh)
  // Only update if new value is more recent (matches web behavior)
  useEffect(() => {
    if (initialLastSeenAt) {
      setOtherLastSeenAt(prev => {
        if (!prev) return initialLastSeenAt;
        // Only update if new value is more recent
        return new Date(initialLastSeenAt) > new Date(prev) ? initialLastSeenAt : prev;
      });
    }
  }, [initialLastSeenAt]);

  // Reset state when conversation changes
  // MUST be declared BEFORE the watch effect — React runs effects in declaration
  // order, so reset clears state first, then watch re-subscribes to presence.
  useEffect(() => {
    // Reset all state for new conversation
    setMessages([]);
    setIsLoading(true);
    setError(null);
    setHasMore(false);
    setNextCursor(null);
    setOtherLastReadAt(null);
    setOtherLastReadMessageId(null);
    setIsOtherTyping(false);
    setIsOtherOnline(null);
    // Reset to initial value from DB (not undefined)
    setOtherLastSeenAt(initialLastSeenAtRef.current);
    watchingRef.current = false;
    conversationIdRef.current = conversationId;
    // Clear pending sends tracking
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

  // Helper to deduplicate messages array by ID (keeps first occurrence)
  const dedupeMessages = useCallback((messages: Message[]): Message[] => {
    const seen = new Set<string>();
    return messages.filter(m => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, []);

  // Subscribe to real-time messages
  useEffect(() => {
    const unsubscribe = subscribe((msg) => {
      // Handle new messages — deduplicate by ID (allows multi-device sync)
      if (msg.type === 'new_message' && msg.conversationId === conversationIdRef.current && msg.message) {
        const newMessage = msg.message as Message;

        // Check if message already exists (avoid duplicates)
        setMessages(prev => {
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
              return dedupeMessages(updated);
            }
          }

          // Message from other user or no pending temp found - just add it
          return dedupeMessages([messageWithAvatar, ...prev]);
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
        if (typeof msg.messageId === 'string') {
          setOtherLastReadMessageId(msg.messageId);
        }
        setOtherLastReadAt(msg.lastReadAt);
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
  }, [dedupeMessages, subscribe]);

  // Fetch messages
  const loadMessages = useCallback(
    async (cursor?: string) => {
      if (!isAuthenticated || !enabled) {
        setIsLoading(false);
        return;
      }

      // Abort previous in-flight request (prevents stale data on rapid switching)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setError(null);
      
      try {
        const data = await fetchMessages(conversationId, {
          limit: 50,
          cursor,
        });

        // If this request was superseded, skip state updates
        if (controller.signal.aborted) return;
        
        // Convert avatar URLs in messages
        const messagesWithUrls = data.messages.map(msg => ({
          ...msg,
          sender: {
            ...msg.sender,
            avatarUrl: getAvatarUrl(msg.sender.avatarUrl),
          },
        }));
        
        if (cursor) {
          // Appending older messages - dedupe to handle any overlap
          setMessages(prev => dedupeMessages([...prev, ...messagesWithUrls]));
        } else {
          // Initial load or refresh
          setMessages(dedupeMessages(messagesWithUrls));
          
          // Set other participant's last read time (only on first page)
          if (data.otherParticipantLastReadAt) {
            setOtherLastReadAt(data.otherParticipantLastReadAt);
          }
        }

        if (!cursor) {
          const readyAt = consumeDataReady(`messaging:messages:${conversationId}`) ?? performance.now();
          scheduleRenderPerf('messaging.messages-thread', readyAt, {
            conversationId,
            count: messagesWithUrls.length,
          });
        }
        
        setHasMore(data.hasMore);
        setNextCursor(data.nextCursor);
      } catch (err) {
        // Don't set error for aborted requests
        if (controller.signal.aborted) return;
        console.error('[useMessages] Load error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsFetchingMore(false);
        }
      }
    },
    [conversationId, dedupeMessages, isAuthenticated, enabled]
  );

  // Load on conversation change or initial mount
  useEffect(() => {
    if (isAuthenticated && enabled) {
      loadMessages();
    }
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [conversationId, isAuthenticated, enabled, loadMessages]);

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

      // Add optimistic message to list
      setMessages(prev => [optimisticMessage, ...prev]);

      try {
        const response = await sendMessageAPI(conversationId, { text: text.trim() });
        
        // Check if WS already resolved this temp message
        const pendingValue = pendingSendsRef.current.get(tempId);
        
        // Replace optimistic message with real one
        setMessages(prev => {
          // If WS already replaced temp (pendingValue is the real ID), just dedupe
          if (typeof pendingValue === 'string') {
            // WS handled it - the real message should already be in state
            // Just ensure no duplicates
            return dedupeMessages(prev);
          }
          
          // API arrived first - replace temp with real message
          const hasTemp = prev.some(m => m.id === tempId);
          if (!hasTemp) {
            // Temp was somehow removed, add real message if not exists
            if (prev.some(m => m.id === response.message.id)) {
              return prev;
            }
            return dedupeMessages([response.message, ...prev]);
          }
          
          return dedupeMessages(
            prev.map(msg => (msg.id === tempId ? response.message : msg))
          );
        });
        
        // Clean up tracking
        pendingSendsRef.current.delete(tempId);
      } catch (err) {
        console.error('[useMessages] Send error:', err);
        setError(err instanceof Error ? err.message : 'Failed to send message');
        
        // Remove optimistic message and tracking on error
        pendingSendsRef.current.delete(tempId);
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, dedupeMessages]
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
    isLoading,
    isSending,
    isFetchingMore,
    hasMore,
    otherLastReadAt,
    otherLastReadMessageId,
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
