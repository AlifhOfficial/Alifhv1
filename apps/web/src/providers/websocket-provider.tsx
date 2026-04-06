/**
 * WebSocket Provider - Singleton Connection
 * Single shared connection for real-time messaging
 * Uses a global singleton to prevent duplicate connections from React StrictMode
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const DEFAULT_WS_URL = 'wss://ws.revvup.ae';

// ============================================================================
// Types
// ============================================================================

export type WSMessageType = 
  | 'connected' | 'ping' | 'pong' 
  | 'new_message' | 'read_receipt' | 'typing' | 'presence';

export interface WSMessage {
  type: WSMessageType;
  conversationId?: string;
  userId?: string;
  messageId?: string;
  message?: unknown;
  isTyping?: boolean;
  isOnline?: boolean;
  lastSeenAt?: string;
  lastReadAt?: string;
}

type MessageHandler = (msg: WSMessage) => void;

export interface WebSocketContextValue {
  isConnected: boolean;
  send: (data: Record<string, unknown>) => void;
  subscribe: (handler: MessageHandler) => () => void;
}

// ============================================================================
// Singleton WebSocket Manager (prevents duplicate connections)
// ============================================================================

class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private ws: WebSocket | null = null;
  private handlers = new Set<MessageHandler>();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private attempts = 0;
  private currentUserId: string | null = null;
  private connectionListeners = new Set<(connected: boolean) => void>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastPongAt = 0;

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  connect(userId: string): void {
    // Already connected for this user
    if (this.currentUserId === userId && this.ws?.readyState === WebSocket.OPEN) {
      return;
    }
    
    // Different user - disconnect first
    if (this.currentUserId && this.currentUserId !== userId) {
      this.disconnect();
    }
    
    // Already connecting
    if (this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.currentUserId = userId;
    
    const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || DEFAULT_WS_URL;
    const url = `${wsBaseUrl}/ws?userId=${userId}`;

    const ws = new WebSocket(url);
    this.ws = ws;

    ws.onopen = () => {
      this.attempts = 0;
      this.lastPongAt = Date.now();
      this.notifyConnectionChange(true);
      this.startHeartbeat();
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as WSMessage;
        if (msg.type === 'pong' || msg.type === 'connected') {
          this.lastPongAt = Date.now();
        }
        this.handlers.forEach(h => h(msg));
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      this.ws = null;
      this.notifyConnectionChange(false);
      this.stopHeartbeat();
      
      // Reconnect with backoff (max 30s)
      if (this.currentUserId === userId && this.attempts < 10) {
        const delay = Math.min(1000 * Math.pow(2, this.attempts), 30000);
        this.attempts++;
        this.reconnectTimeout = setTimeout(() => this.connect(userId), delay);
      }
    };

    ws.onerror = () => ws.close();
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.stopHeartbeat();
    this.ws?.close(1000);
    this.ws = null;
    this.currentUserId = null;
    this.attempts = 0;
    this.notifyConnectionChange(false);
  }

  send(data: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  onConnectionChange(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.add(listener);
    // Immediately notify of current state
    listener(this.isConnected);
    return () => this.connectionListeners.delete(listener);
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionListeners.forEach(l => l(connected));
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    // Keepalive every 30s (matches mobile) to avoid idle-proxy disconnect stalls.
    this.heartbeatInterval = setInterval(() => {
      // If we haven't received a pong for too long, force close to trigger reconnect.
      if (Date.now() - this.lastPongAt > 65000) {
        this.ws?.close();
        return;
      }
      this.send({ type: 'ping' });
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// ============================================================================
// Context
// ============================================================================

const WSContext = createContext<WebSocketContextValue | null>(null);

export const useWebSocketContext = () => {
  const ctx = useContext(WSContext);
  if (!ctx) throw new Error('useWebSocketContext must be within WebSocketProvider');
  return ctx;
};

export const useOptionalWebSocketContext = () => useContext(WSContext);

// ============================================================================
// Provider
// ============================================================================

interface Props {
  children: React.ReactNode;
  userId?: string;
  autoConnect?: boolean;
}

export function WebSocketProvider({ children, userId, autoConnect = true }: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const [manager] = useState(() => WebSocketManager.getInstance());

  // Connect/disconnect based on userId
  useEffect(() => {
    if (!autoConnect || !userId) return;
    
    manager.connect(userId);
    
    const unsubscribe = manager.onConnectionChange(setIsConnected);
    
    return () => {
      unsubscribe();
      // Don't disconnect on unmount - let the singleton persist
    };
  }, [userId, autoConnect, manager]);

  // Page visibility + online events:
  // - notify server on visible/hidden state
  // - force reconnect immediately when user returns/connection is offline
  useEffect(() => {
    if (typeof document === 'undefined' || !userId) return;

    const handleVisibilityChange = () => {
      manager.send({ type: 'visibility', visible: !document.hidden });

      if (!document.hidden && !manager.isConnected) {
        manager.connect(userId);
      }
    };

    const handleOnline = () => {
      if (!manager.isConnected) {
        manager.connect(userId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [userId, manager]);

  // Memoized callbacks
  const send = useCallback((data: Record<string, unknown>) => {
    manager.send(data);
  }, [manager]);

  const subscribe = useCallback((handler: MessageHandler) => {
    return manager.subscribe(handler);
  }, [manager]);

  return (
    <WSContext.Provider value={{ isConnected, send, subscribe }}>
      {children}
    </WSContext.Provider>
  );
}
