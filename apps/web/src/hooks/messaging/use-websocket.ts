/**
 * WebSocket Hook - Convenience Wrapper
 */

'use client';

import { useOptionalWebSocketContext } from '@/providers/websocket-provider';

const NOOP_WEBSOCKET = {
  isConnected: false,
  send: () => {},
  subscribe: () => () => {},
};

export function useWebSocket() {
  return useOptionalWebSocketContext() ?? NOOP_WEBSOCKET;
}
