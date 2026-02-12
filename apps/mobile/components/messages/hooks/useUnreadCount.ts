/**
 * useUnreadCount Hook
 *
 * Total unread messages count with real-time WebSocket updates.
 * Mirrors web's useUnreadCount — provides global badge count.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getUnreadCount } from '@/lib/messaging-api';
import { useWebSocket } from '@/context/websocket-context';

interface UseUnreadCountOptions {
  userId?: string | null;
  /** Currently active conversation — messages here don't increment count */
  activeConversationId?: string;
}

interface UseUnreadCountReturn {
  unreadCount: number;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useUnreadCount({
  userId,
  activeConversationId,
}: UseUnreadCountOptions = {}): UseUnreadCountReturn {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { subscribe } = useWebSocket();

  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const activeConversationIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Fetch initial count
  const fetchCount = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('[useUnreadCount] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // WebSocket updates — increment on new messages in background conversations
  useEffect(() => {
    if (!userId) return;

    const unsub = subscribe((msg) => {
      if (msg.type === 'new_message' && msg.conversationId !== activeConversationIdRef.current) {
        // Extract senderId from the message
        const newMsg = msg.message as { senderId?: string } | undefined;
        const senderId = msg.userId || newMsg?.senderId;

        // Don't increment for own messages
        if (senderId === userIdRef.current) return;

        setUnreadCount(prev => prev + 1);
      }
    });

    return unsub;
  }, [subscribe, userId]);

  return {
    unreadCount,
    isLoading,
    refetch: fetchCount,
  };
}
