type WebSocketMessageHandler = (data: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, Set<WebSocketMessageHandler>> = new Map();
  private userId: string | null = null;
  private roomId: string = 'default';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    // Auto-reconnect on visibility change
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && !this.isConnected()) {
          this.connect(this.userId || undefined, this.roomId);
        }
      });
    }
  }

  connect(userId?: string, roomId: string = 'default') {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WS] Already connected');
      return;
    }

    if (!userId) {
      console.warn('[WS] No userId provided, skipping connection');
      return;
    }

    this.userId = userId;
    this.roomId = roomId;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const url = `${wsUrl}/ws?userId=${encodeURIComponent(userId)}&room=${encodeURIComponent(roomId)}`;

    console.log('[WS] Connecting to:', url);

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[WS] Connected successfully');
        this.reconnectAttempts = 0;
        this.emit('connected', { userId, roomId });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WS] Message received:', data.type);
          
          // Auto-respond to pings
          if (data.type === 'ping') {
            this.ws?.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            return;
          }
          
          // Emit to type-specific handlers
          if (data.type) {
            this.emit(data.type, data);
          }
          
          // Emit to general message handlers
          this.emit('message', data);
        } catch (error) {
          console.error('[WS] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.warn('[WS] WebSocket connection error - this is normal if server is not running');
        this.emit('error', error);
      };

      this.ws.onclose = (event) => {
        console.log('[WS] Connection closed:', {
          code: event.code,
          reason: event.reason || 'No reason provided',
          wasClean: event.wasClean,
        });
        this.emit('disconnected', {});
        this.ws = null;
        
        // Attempt reconnection only if it wasn't a clean close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
          console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => this.connect(userId, roomId), delay);
        } else if (event.code !== 1000) {
          console.warn('[WS] Could not connect to WebSocket server - real-time updates disabled');
        }
      };
    } catch (error) {
      console.error('[WS] Connection initialization failed:', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
      this.ws.close();
      this.ws = null;
    }
  }

  send(type: string, data: any = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn('[WS] Cannot send message, not connected');
    }
  }

  on(type: string, handler: WebSocketMessageHandler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);
  }

  off(type: string, handler: WebSocketMessageHandler) {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private emit(type: string, data: any) {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[WS] Handler error for type "${type}":`, error);
        }
      });
    }
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getUserId() {
    return this.userId;
  }

  getRoomId() {
    return this.roomId;
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (typeof window === 'undefined') {
    // Return a mock client for SSR
    return {
      connect: () => {},
      disconnect: () => {},
      send: () => {},
      on: () => {},
      off: () => {},
      isConnected: () => false,
      getUserId: () => null,
      getRoomId: () => 'default',
    } as any;
  }

  if (!wsClient) {
    wsClient = new WebSocketClient();
  }
  return wsClient;
}

export type { WebSocketMessageHandler };
