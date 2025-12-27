/**
 * WebSocket Status Indicator
 */

'use client';

import { useWebSocketContext } from '@/providers/websocket-provider';
import { cn } from '@/utils/cn';

interface WebSocketStatusProps {
  showText?: boolean;
  className?: string;
}

export function WebSocketStatus({ showText = false, className }: WebSocketStatusProps) {
  const { isConnected } = useWebSocketContext();

  return (
    <div className={cn('flex items-center gap-2', isConnected ? 'text-green-600' : 'text-muted-foreground', className)}>
      <div className={cn('h-2 w-2 rounded-full', isConnected ? 'bg-green-600' : 'bg-muted-foreground')} />
      {showText && <small className="font-medium">{isConnected ? 'Connected' : 'Offline'}</small>}
    </div>
  );
}
