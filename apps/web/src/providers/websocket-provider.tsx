/**
 * WebSocket Provider - Singleton Connection
 * Single shared connection for real-time messaging
 */

'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export type WSMessageType = 
  | 'connected' | 'ping' | 'pong' 
  | 'new_message' | 'read_receipt' | 'typing' | 'presence'
  | 'account_banned';

export interface WSMessage {
  type: WSMessageType;
  conversationId?: string;
  userId?: string;
  message?: unknown;
  isTyping?: boolean;
  isOnline?: boolean;
  lastSeenAt?: string;
  lastReadAt?: string;
  reason?: string;
  expiresAt?: string | null;
}

type MessageHandler = (msg: WSMessage) => void;

export interface WebSocketContextValue {
  isConnected: boolean;
  send: (data: Record<string, unknown>) => void;
  subscribe: (handler: MessageHandler) => () => void;
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
  
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Set<MessageHandler>>(new Set());
  const reconnectRef = useRef<NodeJS.Timeout>(undefined);
  const attemptsRef = useRef(0);

  // Connect
  const connect = useCallback(() => {
    if (!userId) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const port = process.env.NEXT_PUBLIC_WS_PORT || '3001';
    const url = `${protocol}//${host}:${port}/ws?userId=${userId}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      attemptsRef.current = 0;
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as WSMessage;
        handlersRef.current.forEach(h => h(msg));
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      
      // Reconnect with backoff (max 30s)
      if (attemptsRef.current < 10) {
        const delay = Math.min(1000 * Math.pow(2, attemptsRef.current), 30000);
        attemptsRef.current++;
        reconnectRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [userId]);

  // Send
  const send = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  // Subscribe
  const subscribe = useCallback((handler: MessageHandler) => {
    handlersRef.current.add(handler);
    return () => { handlersRef.current.delete(handler); };
  }, []);

  // Lifecycle
  useEffect(() => {
    if (autoConnect && userId) connect();
    
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close(1000);
      wsRef.current = null;
    };
  }, [userId, autoConnect, connect]);

  // Heartbeat (every 45s)
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => send({ type: 'ping' }), 45000);
    return () => clearInterval(interval);
  }, [isConnected, send]);

  // Global handler for account_banned - redirect user immediately
  useEffect(() => {
    const unsubscribe = subscribe((msg) => {
      if (msg.type === 'account_banned') {
        // Clear any local storage/session data
        if (typeof window !== 'undefined') {
          // Redirect to banned page
          window.location.href = '/banned';
        }
      }
    });
    return unsubscribe;
  }, [subscribe]);

  return (
    <WSContext.Provider value={{ isConnected, send, subscribe }}>
      {children}
    </WSContext.Provider>
  );
}
