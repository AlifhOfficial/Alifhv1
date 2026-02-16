/**
 * Global Chat Provider - Single source of truth for WebSocket + Floating Chat
 * Wraps entire app with WebSocket connection and floating chat functionality
 */

'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { FloatingChatProvider } from '@/components/messaging/floating-chat-manager';
import { WebSocketProvider } from '@/providers/websocket-provider';
import { useUser } from '@/hooks/auth/use-auth';

interface GlobalChatProviderProps {
  children: ReactNode;
}

function GlobalChatProviderInner({ children }: GlobalChatProviderProps) {
  const { user } = useUser();
  
  return (
    <WebSocketProvider userId={user?.id} autoConnect={!!user?.id}>
      <FloatingChatProvider userId={user?.id}>
        {children}
      </FloatingChatProvider>
    </WebSocketProvider>
  );
}

export function GlobalChatProvider({ children }: GlobalChatProviderProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // During SSR, render children without the chat providers
  if (!mounted) {
    return <>{children}</>;
  }
  
  return <GlobalChatProviderInner>{children}</GlobalChatProviderInner>;
}
