/**
 * WebSocket Provider - Mobile
 * Real-time messaging with presence and typing indicators
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
  watchUser: (userId: string) => void;
  unwatchUser: (userId: string) => void;
  sendTyping: (conversationId: string, targetUserId: string, isTyping: boolean) => void;
}

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
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef(new Set<MessageHandler>());
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);
  const appStateRef = useRef(AppState.currentState);
  const intentionalCloseRef = useRef(false);
  const mountedRef = useRef(true);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!userId || !mountedRef.current) return;

    // Already connected
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    // Already connecting
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    intentionalCloseRef.current = false;

    const url = `${WS_URL}/ws?userId=${userId}`;
    console.log(`🔌 [WS] Connecting: ${url}`);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        console.log(`✅ [WS] Connected for user: ${userId}`);
        setIsConnected(true);
        attemptsRef.current = 0;

        // Start heartbeat
        stopHeartbeat();
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Every 30 seconds
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(event.data) as WSMessage;
          
          if (msg.type !== 'pong') {
            console.log(`📨 [WS] Received:`, msg.type, msg);
          }

          // Notify all subscribers
          handlersRef.current.forEach(handler => {
            try {
              handler(msg);
            } catch (error) {
              console.error('[WS] Handler error:', error);
            }
          });
        } catch (error) {
          console.error('[WS] Parse error:', error);
        }
      };

      ws.onerror = () => {
        // Errors are followed by onclose — no action needed here
        console.warn('⚠️ [WS] Connection error');
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;

        console.log('🔌 [WS] Disconnected');
        setIsConnected(false);
        stopHeartbeat();

        // Don't reconnect if close was intentional or unmounted
        if (intentionalCloseRef.current) return;

        // Reconnect with exponential backoff (only if app is active)
        if (appStateRef.current === 'active' && attemptsRef.current < 10) {
          const delay = Math.min(1000 * Math.pow(2, attemptsRef.current), 30000);
          attemptsRef.current++;
          
          console.log(`🔄 [WS] Reconnecting in ${delay}ms (attempt ${attemptsRef.current})`);
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.warn('⚠️ [WS] Failed to create WebSocket:', error);
    }
  }, [userId, stopHeartbeat]);

  // Disconnect
  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopHeartbeat();

    if (wsRef.current) {
      wsRef.current.onclose = null; // Prevent onclose from firing
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.onopen = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, [stopHeartbeat]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appStateRef.current = nextAppState;
      
      if (nextAppState === 'active' && userId) {
        // App came to foreground - reconnect if needed
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          connect();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background - disconnect to save battery
        disconnect();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [userId, connect, disconnect]);

  // Connect on mount if userId is available
  useEffect(() => {
    mountedRef.current = true;

    if (userId && appStateRef.current === 'active') {
      connect();
    }

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [userId, connect, disconnect]);

  // Send message
  const send = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  // Subscribe to messages
  const subscribe = useCallback((handler: MessageHandler) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  // Watch user presence
  const watchUser = useCallback((targetUserId: string) => {
    send({ type: 'watch_user', targetUserId });
  }, [send]);

  // Unwatch user presence
  const unwatchUser = useCallback((targetUserId: string) => {
    send({ type: 'unwatch_user', targetUserId });
  }, [send]);

  // Send typing indicator
  const sendTyping = useCallback((conversationId: string, targetUserId: string, isTyping: boolean) => {
    send({ type: 'typing', conversationId, targetUserId, isTyping });
  }, [send]);

  const value: WebSocketContextValue = {
    isConnected,
    send,
    subscribe,
    watchUser,
    unwatchUser,
    sendTyping,
  };

  return (
    <WebSocketContext.Provider value={value}>
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
