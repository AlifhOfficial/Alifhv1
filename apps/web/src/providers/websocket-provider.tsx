/**
 * WebSocket Provider - Singleton Connection
 * Single shared connection for real-time messaging
 * Uses a global singleton to prevent duplicate connections from React StrictMode
 */

'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

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
    
    // Use NEXT_PUBLIC_WS_URL for production, fallback to localhost for dev
    let url: string;
    if (process.env.NEXT_PUBLIC_WS_URL) {
      // Production: use configured WS URL (e.g., wss://ws.revvup.ae)
      url = `${process.env.NEXT_PUBLIC_WS_URL}/ws?userId=${userId}`;
    } else {
      // Development: use same host with WS port
      const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const port = process.env.NEXT_PUBLIC_WS_PORT || '3001';
      url = `${protocol}//${host}:${port}/ws?userId=${userId}`;
    }

    console.log(`🔌 [WS] Connecting: ${url}`);
    const ws = new WebSocket(url);
    this.ws = ws;

    ws.onopen = () => {
      console.log(`✅ [WS] Connected for user: ${userId}`);
      this.attempts = 0;
      this.notifyConnectionChange(true);
      this.startHeartbeat();
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as WSMessage;
        if (msg.type !== 'pong') {
          console.log(`📨 [WS] Received:`, msg.type, msg.conversationId ? `conv:${msg.conversationId}` : '');
        }
        this.handlers.forEach(h => h(msg));
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      console.log(`❌ [WS] Disconnected for user: ${userId}`);
      this.ws = null;
      this.notifyConnectionChange(false);
      this.stopHeartbeat();
      
      // Reconnect with backoff (max 30s)
      if (this.currentUserId === userId && this.attempts < 10) {
        const delay = Math.min(1000 * Math.pow(2, this.attempts), 30000);
        console.log(`🔄 [WS] Reconnecting in ${delay}ms (attempt ${this.attempts + 1})`);
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
    this.heartbeatInterval = setInterval(() => this.send({ type: 'ping' }), 45000);
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
  const managerRef = useRef<WebSocketManager | null>(null);

  // Get singleton manager
  if (!managerRef.current) {
    managerRef.current = WebSocketManager.getInstance();
  }
  const manager = managerRef.current;

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
