/**
 * Global Chat Provider - Wraps app with floating chat functionality
 * Client component wrapper for FloatingChatProvider with WebSocket support
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
  
  return (
    <WebSocketProvider userId={user?.id} autoConnect={!!user?.id}>
      <FloatingChatProvider userId={user?.id}>
        {children}
      </FloatingChatProvider>
    </WebSocketProvider>
  );
}
