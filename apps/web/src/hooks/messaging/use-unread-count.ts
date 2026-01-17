/**
 * Unread Count Hook - Total unread messages
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './use-websocket';
import { useEffect } from 'react';

async function fetchUnreadCount(): Promise<{ unreadCount: number }> {
  const res = await fetch('/api/conversations/unread-count', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch unread count');
  return res.json();
}

export function useUnreadCount(userId?: string, activeConversationId?: string) {
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();

  const query = useQuery({
    queryKey: ['unread-count'],
    queryFn: fetchUnreadCount,
    refetchInterval: 2 * 60 * 1000,
    enabled: !!userId,
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
          console.log(`🔔 [useUnreadCount] Own message in background conversation, skipping count increment`);
          return;
        }
        
        console.log(`🔔 [useUnreadCount] New message in background conversation, incrementing count`);
        queryClient.setQueryData(['unread-count'], (old: { unreadCount: number } | undefined) => ({
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
