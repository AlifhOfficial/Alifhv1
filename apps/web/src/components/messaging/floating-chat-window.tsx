/**
 * Floating Chat Window - Compact chat for global access
 * Appears at bottom-right of screen
 */

'use client';

import { useRouter } from 'next/navigation';
import { X, Minus, Maximize2 } from 'lucide-react';
import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { BrandAvatar } from '@/components/partner/car-dealer/ui/brand-avatar';
import type { Conversation } from '@/hooks/messaging';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import { ChatThread, useChatThreadController } from './chat-thread';

// Simple time ago formatter (1m, 5m, 1h, 12h, 1d, etc)
function formatTimeAgo(date: Date | string | null): string | null {
  if (!date) return null;
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

interface FloatingChatWindowProps {
  conversation: Conversation;
  userId: string;
  position: number; // 0-indexed position from right
  isMinimized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export function FloatingChatWindow({
  conversation,
  userId,
  position,
  isMinimized,
  onMinimize,
  onMaximize,
  onClose,
}: FloatingChatWindowProps) {
  const router = useRouter();
  const { otherParticipant, partner, listing } = conversation;
  const controller = useChatThreadController({
    conversationId: conversation.id,
    userId,
    otherParticipant: otherParticipant || undefined,
    listing: listing || undefined,
    myLastReadAt: conversation.myLastReadAt,
    active: !isMinimized,
  });

  // Display info
  const displayName = partner?.name || otherParticipant?.name || 'User';
  const isPartnerBrand = !!partner;
  
  const lastActiveAt =
    controller.otherLastSeenAt ??
    controller.otherLastReadAt ??
    (otherParticipant?.lastSeenAt ? new Date(String(otherParticipant.lastSeenAt)) : null) ?? 
    (otherParticipant?.lastReadAt ? new Date(String(otherParticipant.lastReadAt)) : null);

  // Calculate position from right edge
  const rightOffset = 24 + position * 340; // 340px per window + 24px initial margin

  return (
    <div
      className="fixed z-40 transition-all duration-200 ease-out overflow-hidden overscroll-contain"
      style={{ 
        right: rightOffset, 
        width: 320, 
        height: isMinimized ? 52 : 480,
        bottom: isMinimized ? 24 : 0
      }}
    >
      <div
        className={cn(
          'flex flex-col h-full bg-background border border-border shadow-2xl overflow-hidden overscroll-contain',
          isMinimized ? 'rounded-2xl' : 'rounded-t-xl'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center gap-3 px-4 bg-sidebar cursor-pointer',
            isMinimized ? 'h-full' : 'py-3 border-b border-sidebar-border'
          )}
          onClick={isMinimized ? onMaximize : undefined}
        >
          {/* Avatar - clickable to open in dashboard */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/user-dashboard/messaging?conversationId=${conversation.id}`);
              onClose();
            }}
            className="flex-shrink-0 hover:opacity-80 transition-opacity flex items-center"
          >
            {isPartnerBrand ? (
              <BrandAvatar logoUrl={partner?.logo} brandName={partner?.name || 'Partner'} size="sm" className="w-9 h-9" />
            ) : (
              <UserAvatar src={otherParticipant?.avatarUrl} name={displayName} size="md" className="w-9 h-9" />
            )}
          </button>

          {/* Name + Activity Status - clickable to open in dashboard */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/user-dashboard/messaging?conversationId=${conversation.id}`);
              onClose();
            }}
            className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold tracking-tight truncate text-sidebar-foreground leading-snug">
                {displayName}
              </h4>
              {/* Activity indicator */}
              {controller.isOtherOnline ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-semibold text-green-500">now</span>
                </div>
              ) : lastActiveAt ? (
                <span className="text-xs font-medium text-muted-foreground/70 flex-shrink-0">
                  {formatTimeAgo(lastActiveAt)}
                </span>
              ) : (
                <span className="text-xs font-medium text-muted-foreground/50 flex-shrink-0">away</span>
              )}
            </div>
            {!isMinimized && listing && (
              <Link
                href={`/listings/${listing.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-medium text-muted-foreground/70 truncate mt-1 block hover:text-primary hover:underline transition-colors leading-snug"
              >
                {listing.title}
              </Link>
            )}
          </button>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isMinimized) {
                  onMaximize();
                } else {
                  onMinimize();
                }
              }}
              className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors flex items-center justify-center"
              aria-label={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Minus className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Chat Content - Hidden when minimized */}
        {!isMinimized && (
          <>
            <ChatThread
              controller={controller}
              compact
            />
          </>
        )}
      </div>
    </div>
  );
}
