/**
 * Global Chat Provider - Single source of truth for WebSocket + Floating Chat
 * Wraps entire app with WebSocket connection and floating chat functionality
 */

'use client';

import { type ReactNode } from 'react';
import { FloatingChatProvider } from '@/components/messaging/floating-chat-manager';
import { WebSocketProvider } from '@/providers/websocket-provider';
import { useOptionalAuth } from '@/providers/auth-provider';

interface GlobalChatProviderProps {
  children: ReactNode;
}

function GlobalChatProviderInner({ children }: GlobalChatProviderProps) {
  const auth = useOptionalAuth();
  const userId = auth?.session?.id;
  
  return (
    <WebSocketProvider userId={userId} autoConnect={!!userId}>
      <FloatingChatProvider userId={userId}>
        {children}
      </FloatingChatProvider>
    </WebSocketProvider>
  );
}

export function GlobalChatProvider({ children }: GlobalChatProviderProps) {
  return <GlobalChatProviderInner>{children}</GlobalChatProviderInner>;
}
