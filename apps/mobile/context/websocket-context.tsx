/**
 * WebSocket Provider - Mobile
 * Matches web's singleton pattern — single source of truth.
 * Clean API: { isConnected, send, subscribe }
 * Hooks use send() directly for watch_user, unwatch_user, typing.
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import { WS_URL } from '@/lib/config';

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
// Singleton WebSocket Manager (matches web's WebSocketManager)
// ============================================================================

class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private ws: WebSocket | null = null;
  private handlers = new Set<MessageHandler>();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private attempts = 0;
  private currentUserId: string | null = null;
  private lastPingAt: number = 0;
  private connectionListeners = new Set<(connected: boolean) => void>();

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

    // Different user — disconnect first
    if (this.currentUserId && this.currentUserId !== userId) {
      this.disconnect();
    }

    // Already connecting
    if (this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.currentUserId = userId;

    const url = `${WS_URL}/ws?userId=${userId}`;
    const connectStart = Date.now();
    console.log(`🔌 [WS] Connecting: ${url}`);

    try {
      const ws = new WebSocket(url);
      this.ws = ws;

      ws.onopen = () => {
        const connectTime = Date.now() - connectStart;
        console.log(`✅ [WS] Connected for user: ${userId} (${connectTime}ms)`);
        this.attempts = 0;
        this.notifyConnectionChange(true);
        this.startHeartbeat();
        // Immediate ping to measure RTT
        this.lastPingAt = Date.now();
        this.send({ type: 'ping' });
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(typeof e.data === 'string' ? e.data : '') as WSMessage;
          // Measure ping/pong latency
          if (msg.type === 'pong' && this.lastPingAt) {
            const rtt = Date.now() - this.lastPingAt;
            console.log(`📶 [WS] RTT: ${rtt}ms`);
          }
          this.handlers.forEach((h) => {
            try { h(msg); } catch (err) { console.error('[WS] Handler error:', err); }
          });
        } catch { /* ignore parse errors */ }
      };

      ws.onerror = () => {
        console.warn('⚠️ [WS] Connection error');
        ws.close();
      };

      ws.onclose = () => {
        console.log(`❌ [WS] Disconnected`);
        this.ws = null;
        this.notifyConnectionChange(false);
        this.stopHeartbeat();

        // Reconnect with exponential backoff (max 30s, 10 attempts)
        if (this.currentUserId === userId && this.attempts < 10) {
          const delay = Math.min(1000 * Math.pow(2, this.attempts), 30000);
          console.log(`🔄 [WS] Reconnecting in ${delay}ms (attempt ${this.attempts + 1})`);
          this.attempts++;
          this.reconnectTimeout = setTimeout(() => this.connect(userId), delay);
        }
      };
    } catch (error) {
      console.warn('⚠️ [WS] Failed to create WebSocket:', error);
    }
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

  /** Pause connection (app backgrounded) — close but keep userId for resume */
  pause(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.stopHeartbeat();
    this.attempts = 0;
    if (this.ws) {
      this.ws.onclose = null; // Prevent auto-reconnect loop
      this.ws.close(1000);
      this.ws = null;
    }
    this.notifyConnectionChange(false);
  }

  /** Resume connection (app foregrounded) — reconnect with same userId */
  resume(): void {
    if (this.currentUserId && !this.ws) {
      this.connect(this.currentUserId);
    }
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
    // Immediately notify current state
    listener(this.isConnected);
    return () => this.connectionListeners.delete(listener);
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionListeners.forEach((l) => l(connected));
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.lastPingAt = Date.now();
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

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface WebSocketProviderProps {
  children: React.ReactNode;
  userId?: string | null;
}

export function WebSocketProvider({ children, userId }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const managerRef = useRef<WebSocketManager | null>(null);

  // Get singleton
  if (!managerRef.current) {
    managerRef.current = WebSocketManager.getInstance();
  }
  const manager = managerRef.current;

  // Connect/disconnect based on userId
  useEffect(() => {
    if (!userId) return;

    manager.connect(userId);
    const unsubscribe = manager.onConnectionChange(setIsConnected);

    return () => {
      unsubscribe();
      // Don't disconnect on unmount — let the singleton persist
    };
  }, [userId, manager]);

  // Handle app state changes (mobile-specific pause/resume)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        manager.resume();
      } else if (nextAppState.match(/inactive|background/)) {
        manager.pause();
      }
    });

    return () => subscription.remove();
  }, [manager]);

  // Memoized callbacks
  const send = useCallback(
    (data: Record<string, unknown>) => manager.send(data),
    [manager]
  );

  const subscribe = useCallback(
    (handler: MessageHandler) => manager.subscribe(handler),
    [manager]
  );

  return (
    <WebSocketContext.Provider value={{ isConnected, send, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}
