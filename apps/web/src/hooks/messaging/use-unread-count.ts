/**
 * Unread Count Hook - Total unread messages
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './use-websocket';
import { useEffect } from 'react';
import { queryKeys } from '@/lib/query-keys';
import { CACHE_STALE_TIME } from '@/lib/cache-config';
import { updateCache } from '@/lib/cache-patterns';

async function fetchUnreadCount(): Promise<{ unreadCount: number }> {
  const res = await fetch('/api/conversations/unread-count', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch unread count');
  return res.json();
}

export function useUnreadCount(userId?: string, activeConversationId?: string) {
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();

  const query = useQuery({
    queryKey: queryKeys.messaging.unreadCount(),
    queryFn: fetchUnreadCount,
    staleTime: CACHE_STALE_TIME.LONG,
    refetchInterval: false, // Disable polling - rely on WebSocket updates
    refetchOnWindowFocus: false, // No auto-refetch, WebSocket handles updates
    refetchOnReconnect: false, // No auto-refetch, WebSocket handles updates
    enabled: false, // Don't fetch on mount - only update via WebSocket
  });

  useEffect(() => {
    if (!userId) return;

    const unsub = subscribe((msg) => {
      if (msg.type === 'new_message' && msg.conversationId !== activeConversationId) {
        updateCache(queryClient, queryKeys.messaging.unreadCount(), (old: { unreadCount: number } | undefined) => ({
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
