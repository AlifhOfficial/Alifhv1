/**
 * Unread Count Hook - Total unread messages
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './use-websocket';
import { useEffect } from 'react';
import { queryKeys } from '@/lib/query-keys';

async function fetchUnreadCount(): Promise<{ unreadCount: number }> {
  const res = await fetch('/api/conversations/unread-count', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch unread count');
  return res.json();
}

interface UseUnreadCountOptions {
  activeConversationId?: string;
  enableFetch?: boolean;
}

export function useUnreadCount(
  userId?: string,
  initialCount?: number,
  options: UseUnreadCountOptions = {}
) {
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();
  const { activeConversationId, enableFetch = true } = options;

  const query = useQuery({
    queryKey: queryKeys.messaging.unreadCount(),
    queryFn: fetchUnreadCount,
    enabled: !!userId && enableFetch,
    ...(initialCount !== undefined && { initialData: { unreadCount: initialCount } }),
  });

  useEffect(() => {
    if (!userId) return;

    const unsub = subscribe((msg) => {
      if (msg.type === 'new_message' && msg.conversationId !== activeConversationId) {
        // Extract senderId from the message - check both locations
        const newMsg = msg.message as { senderId?: string } | undefined;
        const senderId = msg.userId || newMsg?.senderId;
        
        // Don't increment unread count for your own messages
        if (senderId === userId) {
          return;
        }

        queryClient.setQueryData(queryKeys.messaging.unreadCount(), (old: { unreadCount: number } | undefined) => ({
          unreadCount: (old?.unreadCount ?? 0) + 1,
        }));
      }
    });

    return unsub;
  }, [subscribe, queryClient, userId, activeConversationId]);

  return {
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
