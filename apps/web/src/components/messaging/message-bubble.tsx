/**
 * Message Bubble Component - Alifh Design System
 * Individual message display with sender/receiver styling
 */

'use client';

import { UserAvatar } from '@/components/ui/data-display/user-avatar';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import type { Message } from '@/hooks/messaging';
import { X } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  isReadByOther?: boolean;
  showSeen?: boolean;
  seenAt?: Date | string | null;
  otherUserAvatar?: string | null;
  otherUserName?: string | null;
  listing?: { id: string; title: string; thumbnail: string | null };
  /** Compact mode for floating chat windows */
  compact?: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  isReadByOther = false,
  showSeen = false,
  seenAt,
  otherUserAvatar,
  otherUserName,
  listing,
  compact = false,
}: MessageBubbleProps) {
  const { sender, text, mediaUrl, mediaType, createdAt, isEdited, isSystemMessage } = message;

  // System message (centered, muted)
  if (isSystemMessage) {
    return (
      <div className="flex justify-center py-3">
        <small className="text-xs text-muted-foreground/70 px-4 py-2 bg-secondary/30 rounded-full">
          {text}
        </small>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex mb-1.5 group',
        compact ? 'gap-1.5' : 'gap-2.5',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar - only show for received messages */}
      {!isOwn && (
        showAvatar ? (
          <UserAvatar
            src={sender.avatarUrl}
            name={sender.name}
            size="sm"
            className={cn(compact ? 'w-6 h-6' : 'w-8 h-8', 'flex-shrink-0')}
          />
        ) : (
          <div className={cn(compact ? 'w-6' : 'w-8', 'flex-shrink-0')} />
        )
      )}

      {/* Message Content */}
      <div className={cn(
        'flex flex-col min-w-0',
        compact ? 'max-w-[85%]' : 'max-w-[80%] md:max-w-[65%]',
        isOwn ? 'items-end' : 'items-start'
      )}>
        {/* Sender Name (only for received messages with avatar) */}
        {!isOwn && showAvatar && (
          <small className="text-xs text-muted-foreground/70 mb-1 px-2 font-medium">
            {sender.name || 'User'}
          </small>
        )}

        {/* Listing Preview - rendered OUTSIDE the bubble */}
        {listing && (
          <div className="mb-2 w-full rounded-xl overflow-hidden border border-border/30 bg-card shadow-sm">
            {listing.thumbnail ? (
              <img 
                src={listing.thumbnail} 
                alt={listing.title} 
                className="w-full aspect-[16/10] object-cover" 
              />
            ) : (
              <div className="w-full aspect-[16/10] bg-muted/40" />
            )}
            <div className="p-3 bg-card">
              <p className="text-sm font-semibold text-foreground">
                {listing.title}
              </p>
            </div>
          </div>
        )}

        {/* Message Bubble with Hover Timestamp */}
        <div className="relative">
          {/* Message Bubble */}
          <div
            className={cn(
              'break-words shadow-sm transition-all',
              compact ? 'rounded-xl px-3 py-2' : 'rounded-2xl px-4 py-3',
              isOwn
                ? 'bg-blue-500 text-white rounded-tr-sm'
                : 'bg-muted text-foreground rounded-tl-sm'
            )}
          >
            {/* Media (if any) */}
            {mediaUrl && mediaType === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl}
                alt="Attached"
                className="rounded-lg mb-2 max-w-full h-auto"
              />
            )}

            {/* Text */}
            {text && (
              <p className={cn(
                'whitespace-pre-wrap',
                compact ? 'text-[13px] leading-snug' : 'text-[15px] leading-relaxed'
              )}>
                {text}
              </p>
            )}

            {/* Edited indicator */}
            {isEdited && (
              <small className={cn(
                'text-xs opacity-70 mt-1 block',
                isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}>
                (edited)
              </small>
            )}
          </div>

          {/* Hover Timestamp - Shows on hover */}
          <small 
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-xs text-muted-foreground/70',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              'pointer-events-none whitespace-nowrap z-10',
              isOwn ? '-left-2 -translate-x-full' : '-right-2 translate-x-full'
            )}
          >
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </small>
        </div>

        {/* Failed indicator - only show X if message failed to send */}
        {isOwn && !message.deliveredAt && !message.createdAt && (
          <div className="mt-1 px-2 flex items-center justify-end">
            <X className="h-3 w-3 text-red-500" aria-label="Failed to send" />
          </div>
        )}

        {/* Seen indicator */}
        {showSeen && isOwn && (
          <div className="mt-1 flex items-center justify-end gap-1.5 px-2">
            <small className="text-xs text-muted-foreground/70">Seen</small>
            <UserAvatar
              src={otherUserAvatar}
              name={otherUserName || 'User'}
              size="xs"
              className="w-4 h-4"
            />
          </div>
        )}
      </div>
    </div>
  );
}
