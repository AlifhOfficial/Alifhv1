/**
 * Messaging Module - User Status Component
 * Shows online/offline/typing/active status matching existing UI patterns
 */

"use client";

import { useState, useEffect } from 'react';
import { Zap, Moon, Cloud, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export type UserStatus = 'online' | 'offline' | 'away' | 'typing';

interface UserStatusProps {
  userId: string;
  lastActiveAt?: string | null;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'compact' | 'icon-only';
}

export function UserStatus({ 
  userId, 
  lastActiveAt, 
  className, 
  showText = true, 
  size = 'sm',
  variant = 'compact'
}: UserStatusProps) {
  const [status, setStatus] = useState<UserStatus>('offline');
  const [isTyping, setIsTyping] = useState(false);

  // Determine user status based on last active time
  useEffect(() => {
    if (!lastActiveAt) {
      setStatus('offline');
      return;
    }

    const lastActive = new Date(lastActiveAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);

    if (diffMinutes < 2) {
      setStatus('online');
    } else if (diffMinutes < 30) {
      setStatus('away');
    } else {
      setStatus('offline');
    }
  }, [lastActiveAt]);

  // Mock typing detection (in real app, this would come from websockets)
  useEffect(() => {
    const interval = setInterval(() => {
      // Random typing simulation for demo
      if (status === 'online' && Math.random() < 0.1) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [status]);

  const formatLastSeen = (lastSeenDate: string, isCurrentlyOnline: boolean) => {
    if (isCurrentlyOnline) return "";
    const date = new Date(lastSeenDate);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getStatusIcon = () => {
    if (isTyping) return <Zap className="w-3 h-3 text-alifh-blue animate-pulse" />;
    
    switch (status) {
      case 'online': return <Zap className="w-3 h-3 text-emerald-500 animate-pulse" />;
      case 'away': return <Moon className="w-3 h-3 text-slate-400" />;
      case 'offline': return <Cloud className="w-3 h-3 text-slate-400" />;
      default: return <Cloud className="w-3 h-3 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    if (isTyping) return 'typing...';
    
    switch (status) {
      case 'online': return 'Active now';
      case 'away': 
      case 'offline': 
        return lastActiveAt ? `Last seen ${formatLastSeen(lastActiveAt, false)}` : 'Last seen: Unknown';
      default: return 'Unknown';
    }
  };

  const getStatusColor = () => {
    if (isTyping) return 'text-alifh-blue font-medium';
    
    switch (status) {
      case 'online': return 'text-emerald-600 font-medium';
      case 'away': return 'text-muted-foreground';
      case 'offline': return 'text-muted-foreground';
      default: return 'text-slate-500';
    }
  };

  if (variant === 'icon-only') {
    return (
      <div className={cn("flex items-center", className)}>
        {getStatusIcon()}
      </div>
    );
  }

  if (variant === 'full') {
    // Match ConversationHeader style exactly
    return (
      <div className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}>
        <span className="flex items-center gap-1.5">
          {status === 'online' ? (
            <>
              <Zap className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span className="text-emerald-600 font-medium">
                Active now
              </span>
            </>
          ) : lastActiveAt ? (
            <>
              <Moon className="w-3 h-3 text-slate-400" />
              <span>Last seen {formatLastSeen(lastActiveAt, false)}</span>
            </>
          ) : (
            <>
              <Cloud className="w-3 h-3 text-slate-400" />
              <span className="text-slate-500">Last seen: Unknown</span>
            </>
          )}
        </span>
      </div>
    );
  }

  // Compact variant (default)
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {getStatusIcon()}
      {showText && (
        <span className={cn(
          "text-xs",
          getStatusColor(),
          isTyping && "animate-pulse"
        )}>
          {getStatusText()}
        </span>
      )}
    </div>
  );
}

/**
 * Connection Status Component
 * Shows network connectivity status
 */
interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className={cn("flex items-center gap-1 text-red-500 text-xs", className)}>
      <WifiOff className="w-3 h-3" />
      <span>No connection</span>
    </div>
  );
}