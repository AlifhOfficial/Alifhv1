/**
 * Global Chat Provider - Single source of truth for WebSocket + Floating Chat
 * Wraps entire app with WebSocket connection and floating chat functionality
 */

'use client';

import { type ReactNode } from 'react';
import { FloatingChatProvider } from '@/components/messaging/floating-chat-manager';
import { WebSocketProvider } from '@/providers/websocket-provider';
import { useUser } from '@/hooks/auth/use-auth';

interface GlobalChatProviderProps {
  children: ReactNode;
}

export function GlobalChatProvider({ children }: GlobalChatProviderProps) {
  const { user } = useUser();
  
  // Single WebSocket connection + FloatingChat for entire app
  return (
    <WebSocketProvider userId={user?.id} autoConnect={!!user?.id}>
      <FloatingChatProvider userId={user?.id}>
        {children}
      </FloatingChatProvider>
    </WebSocketProvider>
  );
}
