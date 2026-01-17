/**
 * Unread Count Hook - Total unread messages
 * Fetches from conversations API with scope support
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './use-websocket';
import { useEffect } from 'react';

interface UnreadCountOptions {
  userId?: string;
  scope?: 'personal' | 'staff';
  activeConversationId?: string;
}

async function fetchUnreadCount(scope?: 'personal' | 'staff'): Promise<{ totalUnread: number }> {
  const params = new URLSearchParams({ limit: '1' }); // Just need totalUnread, minimal data
  if (scope) params.set('scope', scope);
  
  const res = await fetch(`/api/conversations?${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch unread count');
  return res.json();
}

export function useUnreadCount(options: UnreadCountOptions = {}) {
  const { userId, scope, activeConversationId } = options;
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();

  const queryKey = ['unread-count', scope] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => fetchUnreadCount(scope),
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
          return;
        }
        
        queryClient.setQueryData(queryKey, (old: { totalUnread: number } | undefined) => ({
          ...old,
          totalUnread: (old?.totalUnread ?? 0) + 1,
        }));
      }
      
      // Decrement on read receipt (when user marks as read)
      if (msg.type === 'read_receipt' && msg.userId === userId) {
        // Refetch to get accurate count after marking as read
        queryClient.invalidateQueries({ queryKey });
      }
    });

    return unsub;
  }, [subscribe, queryClient, userId, activeConversationId, queryKey]);

  return {
    unreadCount: query.data?.totalUnread ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
