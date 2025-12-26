/**
 * WebSocket Debug Panel
 * Shows detailed connection info for debugging
 */

'use client';

import { useWebSocketContext } from '@/providers/websocket-provider';
import { useState } from 'react';

export function WebSocketDebugPanel({ userId }: { userId: string }) {
  const { isConnected, isConnecting, error, connectionId } = useWebSocketContext();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-600 px-4 py-2 text-xs text-white shadow-lg hover:bg-blue-700"
      >
        WS Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border bg-white p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">WebSocket Debug</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between rounded bg-gray-50 p-2">
          <span className="text-gray-600">Status:</span>
          <span className={`font-medium ${
            isConnected ? 'text-green-600' :
            isConnecting ? 'text-yellow-600' :
            error ? 'text-red-600' :
            'text-gray-400'
          }`}>
            {isConnected ? '✅ Connected' :
             isConnecting ? '🔄 Connecting...' :
             error ? '❌ Error' :
             '⭕ Disconnected'}
          </span>
        </div>

        <div className="flex items-center justify-between rounded bg-gray-50 p-2">
          <span className="text-gray-600">User ID:</span>
          <span className="font-mono text-[10px]">{userId.slice(0, 12)}...</span>
        </div>

        {connectionId && (
          <div className="flex items-center justify-between rounded bg-gray-50 p-2">
            <span className="text-gray-600">Connection:</span>
            <span className="font-mono text-[10px]">{connectionId}</span>
          </div>
        )}

        {error && (
          <div className="rounded bg-red-50 p-2 text-red-600">
            {error}
          </div>
        )}

        <div className="pt-2 text-[10px] text-gray-500">
          <p>✓ Check browser console for detailed logs</p>
          <p>✓ Open DevTools → Network → WS</p>
          <p className="mt-2 font-medium">To test real-time:</p>
          <p>1. Open incognito window</p>
          <p>2. Login as different user</p>
          <p>3. Both should show "Connected"</p>
        </div>
      </div>
    </div>
  );
}
